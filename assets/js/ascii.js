(() => {
  'use strict';
  let screen;
  let previousFocus;
  function close() {
    if (!screen) return;
    const video = screen.querySelector('video');
    video.pause();
    video.removeAttribute('src');
    video.load();
    screen.remove();
    screen = null;
    previousFocus?.focus();
  }
  window.LPPP.showASCII = () => {
    if (screen) return;
    previousFocus = document.activeElement;
    screen = document.createElement('dialog');
    screen.setAttribute('aria-label', 'ASCII');
    screen.style.cssText = 'position:fixed;inset:0;margin:0;border:0;padding:0;width:100vw;height:100dvh;max-width:none;max-height:none;background:#000;color:#fff;';
    screen.innerHTML = '<video muted playsinline preload="none" style="width:100%;height:100%;object-fit:contain"></video><button type="button" aria-label="Close" style="position:absolute;right:16px;top:12px;background:#000;color:#fff;border:0;font:28px monospace;cursor:pointer">×</button>';
    document.body.append(screen);
    screen.showModal();
    screen.querySelector('button').onclick = close;
    screen.addEventListener('cancel', event => { event.preventDefault(); close(); });
    const video = screen.querySelector('video');
    video.src = window.LPPP.asset('assets/loops/ascii-failure.mp4');
    video.muted = true;
    video.onended = close;
    video.onerror = () => { video.controls = true; };
    video.play().catch(() => { video.controls = true; });
  };
  window.addEventListener('pagehide', close);
})();
