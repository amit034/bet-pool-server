#!/usr/bin/env node
/**
 * Generates PWA icons from public/img/liga-bet.png into public/icons/.
 * Run from repo root: node scripts/generate-pwa-icons.js
 * Requires: npm install sharp (dev)
 */
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'client', 'src', 'frontend', 'public');
const srcIcon = path.join(publicDir, 'img', 'liga-bet.png');
const outDir = path.join(publicDir, 'icons');

const SIZES = [512, 192, 180, 167, 152, 32];

async function main() {
  if (!fs.existsSync(srcIcon)) {
    console.error('Source icon not found:', srcIcon);
    console.error('Place liga-bet.png at client/src/frontend/public/img/liga-bet.png and run again.');
    process.exit(1);
  }
  try {
    const sharp = require('sharp');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const meta = await sharp(srcIcon).metadata();
    for (const s of SIZES) {
      const buf = await sharp(srcIcon)
        .resize(s, s)
        .png({ compressionLevel: 9 })
        .toBuffer();
      const name = s === 32 ? 'favicon-32.png' : `icon-${s}x${s}.png`;
      fs.writeFileSync(path.join(outDir, name), buf);
      console.log('Wrote', name);
    }
    console.log('Done. Icons written to', outDir);
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND' && e.message.includes('sharp')) {
      console.error('Run: npm install --save-dev sharp');
      process.exit(1);
    }
    throw e;
  }
}

main();
