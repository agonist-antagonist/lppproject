(() => {
  'use strict';
  const form = document.querySelector('#code-form'), input = document.querySelector('#code');
  const status = document.querySelector('#code-status'), screen = document.querySelector('#ascii-screen');
  const video = screen.querySelector('video'), key = 'lppp-wrong-codes-v1';
  let attempts = 0, showing = false;
  try { attempts = Math.max(0, Math.min(2, Number(sessionStorage.getItem(key)) || 0)); } catch {}
  const remember = () => { try { sessionStorage.setItem(key, String(attempts)); } catch {} };
  function close() { video.pause(); video.removeAttribute('src'); video.load(); showing = false; screen.hidden = true; form.hidden = false; attempts = 0; remember(); status.textContent = ''; input.value = ''; input.focus(); }
  function ascii() { showing = true; form.hidden = true; screen.hidden = false; input.blur(); video.src = window.LPPP.asset('assets/loops/ascii-failure.mp4'); video.muted = true; video.play().catch(() => { video.controls = true; }); }
  form.addEventListener('submit', event => {
    event.preventDefault(); if (showing) return;
    const code = input.value.trim(); if (!code) return;
    if (code === String(window.LPPP_CATALOG.settings.hiddenCode)) { attempts = 0; remember(); window.LPPP.enter(); return; }
    attempts++; remember(); input.value = '';
    if (attempts >= 3) ascii(); else { status.textContent = 'INVALID CODE'; input.focus(); }
  });
  video.addEventListener('ended', close);
  video.addEventListener('error', () => { video.controls = true; });
  document.querySelector('#ascii-close').addEventListener('click', close);
  document.addEventListener('keydown', event => { if (showing && event.key === 'Escape') close(); });
  window.addEventListener('pagehide', () => video.pause());
})();
