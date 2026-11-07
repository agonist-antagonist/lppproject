(() => {
  'use strict';
  const L = window.LPPP, D = window.LPPP_CATALOG;
  const room = D.rooms.find(item => item.id === new URL(location.href).searchParams.get('room') && L.visible(item));
  const loop = room && D.loops.find(item => item.id === room.loopId);
  const host = document.querySelector('#room');
  if (!room || !loop) {
    host.innerHTML = `<nav class="room-nav"><a href="${L.esc(L.localURL('text/index.html'))}">Text</a></nav>`; return;
  }
  const clips = (D.settings.roomPreviewAudio || []).map(L.safeURL).filter(Boolean);
  const clip = clips[Math.floor(Math.random() * clips.length)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  host.innerHTML = `<div class="room-stage" style="background-image:url('${L.esc(L.safeURL(loop.poster))}')"><video muted loop playsinline preload="none" poster="${L.esc(L.safeURL(loop.poster))}" ${reduced ? '' : 'autoplay'}></video></div><nav class="room-nav"><a href="${L.esc(L.localURL('text/index.html'))}">Text</a><a href="${L.esc(L.localURL('index.html'))}">Home</a><button type="button" data-room-play>${reduced ? 'PLAY' : 'PAUSE'}</button>${clip ? '<button type="button" data-room-bgm>音を再生</button>' : loop.hasAudio ? '<button type="button" data-room-sound>SOUND: OFF</button>' : ''}${room.title ? `<span class="room-title">${L.esc(room.title)}</span>` : ''}</nav><p class="room-status" role="status" hidden></p>`;
  const video = host.querySelector('video'), toggle = host.querySelector('[data-room-play]');
  const stage = host.querySelector('.room-stage'), status = host.querySelector('.room-status');
  video.src = L.safeURL(loop.file); video.defaultMuted = true; video.muted = true;
  const play = () => video.play().then(() => { stage.classList.add('is-playing'); }).catch(() => { toggle.textContent = 'PLAY'; });
  if (!reduced) play();
  toggle.onclick = () => { if (video.paused) play(); else video.pause(); };
  video.addEventListener('play', () => { toggle.textContent = 'PAUSE'; status.hidden = true; });
  video.addEventListener('pause', () => { toggle.textContent = 'PLAY'; });
  video.addEventListener('error', () => { status.hidden = false; status.textContent = 'VIDEO UNAVAILABLE'; });
  host.querySelector('[data-room-sound]')?.addEventListener('click', event => {
    video.muted = !video.muted; event.currentTarget.textContent = video.muted ? 'SOUND: OFF' : 'SOUND: ON';
  });
  let resume = false;
  document.addEventListener('visibilitychange', () => { if (document.hidden) { resume = !video.paused; video.pause(); } else if (resume) { resume = false; play(); } });
  const soundtrack = clip ? new Audio(clip) : null;
  if (soundtrack) {
    const soundButton = host.querySelector('[data-room-bgm]');
    soundtrack.loop = true;
    const startSound = () => soundtrack.play().catch(error => {
      if (error.name === 'NotAllowedError' || error.name === 'AbortError') return;
      soundButton.textContent = '再試行';
      status.hidden = false;
      status.textContent = '音源を読み込めませんでした。';
    });
    soundtrack.addEventListener('playing', () => {
      soundButton.textContent = '音を止める';
      if (!video.error) status.hidden = true;
    });
    soundtrack.addEventListener('pause', () => { soundButton.textContent = '音を再生'; });
    soundButton.onclick = () => {
      if (soundtrack.paused) {
        if (soundtrack.error) soundtrack.load();
        startSound();
      } else {
        soundtrack.pause();
      }
    };
    startSound();
  }
  window.addEventListener('pagehide', () => {
    video.pause();
    soundtrack?.pause();
  });
})();
