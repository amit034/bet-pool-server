#!/usr/bin/env bash
# Run on server: rotate/clean logs to free disk and avoid fills.
# Usage: ./scripts/rotate-logs.sh [--flush-pm2] [--app-dir /path/to/app]
# Cron example (daily at 3am): 0 3 * * * /home/ubuntu/bet-pool-server/scripts/rotate-logs.sh --flush-pm2 >> /var/log/betpool-rotate.log 2>&1

set -e

APP_DIR="${APP_DIR:-.}"
FLUSH_PM2=false

while [ $# -gt 0 ]; do
  case "$1" in
    --flush-pm2) FLUSH_PM2=true; shift ;;
    --app-dir)   APP_DIR="$2"; shift 2 ;;
    *) shift ;;
  esac
done

echo "[$(date -Iseconds)] rotate-logs start"

# 1. PM2: flush old log content (keeps PM2 happy, frees disk)
if command -v pm2 >/dev/null 2>&1 && [ "$FLUSH_PM2" = true ]; then
  pm2 flush || true
  echo "PM2 logs flushed"
fi

# 2. App logs dir: truncate if over 50MB (copytruncate-style: keep last 10k lines then truncate)
LOGS_DIR="$APP_DIR/logs"
if [ -d "$LOGS_DIR" ]; then
  for f in "$LOGS_DIR"/*.log; do
    [ -f "$f" ] || continue
    size=$(stat -c%s "$f" 2>/dev/null || stat -f%z "$f" 2>/dev/null)
    if [ -n "$size" ] && [ "$size" -gt 52428800 ]; then
      tail -n 10000 "$f" > "${f}.tmp" && mv "${f}.tmp" "$f"
      echo "Rotated (truncated) $f"
    fi
  done
fi

# 3. NPM debug logs (old ones)
NPM_LOGS="$HOME/.npm/_logs"
if [ -d "$NPM_LOGS" ]; then
  find "$NPM_LOGS" -name "*.log" -mtime +7 -delete 2>/dev/null || true
  echo "Cleaned old npm logs"
fi

echo "[$(date -Iseconds)] rotate-logs done"
