let deferredPrompt = null;

export function initPWA() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  });
  window.triggerPWAInstall = triggerInstall;
  window.canPWAInstall = canInstall;
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
}

export function triggerInstall() {
  if (!deferredPrompt) return Promise.resolve(false);
  deferredPrompt.prompt();
  return deferredPrompt.userChoice.then(({ outcome }) => {
    deferredPrompt = null;
    return outcome === 'accepted';
  });
}

export function canInstall() {
  return !!deferredPrompt;
}
