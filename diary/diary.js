(() => {
  'use strict';
  const L = window.LPPP;
  const preview = new URL(location.href).searchParams.get('preview') === '1';
  const mediaURL = path => {
    if (preview && typeof path === 'string' && path.startsWith('blob:')) {
      try { if (new URL(path).origin === location.origin) return path; } catch {}
    }
    return L.safeURL(path);
  };
  if (preview) {
    try {
      const entries = JSON.parse(sessionStorage.getItem('lppp-diary-preview-v1'));
      if (Array.isArray(entries)) window.LPPP_DIARY = {entries};
    } catch {}
    const note = document.createElement('span');
    note.textContent = 'DRAFT PREVIEW';
    note.style.cssText = 'background:#111;color:#fff;padding:3px';
    document.querySelector('.diary-header nav').append(note);
  }
  const plane = document.querySelector('#diary-plane');
  const interruptions = document.querySelector('#interruptions');
  const listeningArtwork = document.querySelector('#listening-artwork');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let highest = 10;
  let timer;
  const random = (min, max) => min + Math.random() * (max - min);
  function media(tag, path, attributes = {}) {
    const element = document.createElement(tag);
    const url = mediaURL(path);
    if (!url) return null;
    Object.assign(element, attributes);
    element.src = url;
    element.addEventListener('error', () => {
      const message = document.createElement('p');
      message.className = 'media-error';
      message.textContent = 'MEDIA UNAVAILABLE';
      element.replaceWith(message);
    }, {once:true});
    return element;
  }
  function text(tag, content, className) {
    const element = document.createElement(tag);
    element.textContent = content || '';
    if (className) element.className = className;
    return element;
  }
  function drag(windowElement, handle) {
    handle.addEventListener('pointerdown', event => {
      if (event.target.closest('button')) return;
      const startX = event.clientX;
      const startY = event.clientY;
      const left = windowElement.offsetLeft;
      const top = windowElement.offsetTop;
      handle.setPointerCapture(event.pointerId);
      windowElement.style.zIndex = ++highest;
      function move(e) {
        windowElement.style.left = Math.max(0, Math.min(plane.clientWidth - windowElement.offsetWidth, left + e.clientX - startX)) + 'px';
        windowElement.style.top = Math.max(0, top + e.clientY - startY) + 'px';
        plane.style.minHeight = Math.max(plane.clientHeight, windowElement.offsetTop + windowElement.offsetHeight + 80) + 'px';
      }
      function stop() {
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', stop);
        handle.removeEventListener('pointercancel', stop);
        handle.removeEventListener('lostpointercapture', stop);
      }
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', stop);
      handle.addEventListener('pointercancel', stop);
      handle.addEventListener('lostpointercapture', stop);
    });
  }
  function render() {
    plane.querySelectorAll('audio,video').forEach(element => element.pause());
    plane.replaceChildren();
    listeningArtwork.hidden = true;
    const entries = window.LPPP_DIARY.entries.filter(entry => preview || L.visible(entry));
    const height = Math.max(innerHeight * 1.15, entries.length * 240);
    plane.style.minHeight = height + 'px';
    entries.forEach((entry, index) => {
      const article = document.createElement('article');
      article.className = 'diary-window';
      article.dataset.entry = entry.id;
      article.style.zIndex = ++highest;
      const handle = document.createElement('header');
      handle.className = 'window-title';
      handle.append(text('span', (entry.date || entry.year || '') + ' / ' + entry.id));
      const close = document.createElement('button');
      close.type = 'button';
      close.textContent = '×';
      close.setAttribute('aria-label', 'Close ' + (entry.title || entry.id));
      close.onclick = () => {
        article.querySelectorAll('audio,video').forEach(element => element.pause());
        article.remove();
      };
      handle.append(close);
      const content = document.createElement('div');
      content.className = 'entry-content';
      if (entry.title) content.append(text('h2', entry.title));
      if (entry.date) content.append(text('time', entry.date));
      if (entry.artist) content.append(text('small', entry.artist));
      if (entry.artwork) {
        const artwork = media('img', entry.artwork, {alt:entry.title || '', loading:'lazy', decoding:'async'});
        if (artwork) {
          artwork.onclick = () => { article.style.zIndex = ++highest; artwork.style.filter = artwork.style.filter ? '' : 'invert(1) hue-rotate(160deg)'; };
          content.append(artwork);
        }
      }
      if (entry.text) content.append(text('p', entry.text, 'entry-text'));
      if (entry.audio) {
        const audio = media('audio', entry.audio, {controls:true, preload:'none'});
        if (audio) {
          content.append(audio);
          const download = text('a', 'DOWNLOAD');
          download.href = mediaURL(entry.audio);
          download.download = '';
          download.className = 'entry-links';
          content.append(download);
        }
      }
      if (entry.video) {
        const url = L.safeURL(entry.video);
        const externalVideo = url && /(?:youtube\.com|youtu\.be|vimeo\.com)$/.test(new URL(url).hostname.replace(/^www\./, ''));
        if (externalVideo) {
          const link = text('a', 'VIDEO');
          link.href = url;
          link.target = '_blank';
          link.rel = 'noopener';
          content.append(link);
        } else {
          const video = media('video', entry.video, {controls:true, preload:'none', playsInline:true});
          if (video) content.append(video);
        }
      }
      article.append(handle, content);
      plane.append(article);
      article.style.left = random(0, Math.max(0, plane.clientWidth - article.offsetWidth - 12)) + 'px';
      article.style.top = random(5, Math.max(120, height - 380)) + 'px';
      drag(article, handle);
      article.addEventListener('pointerdown', () => { article.style.zIndex = ++highest; });
    });
    requestAnimationFrame(() => {
      const bottoms = [...plane.children].map(element => element.offsetTop + element.offsetHeight + 80);
      plane.style.minHeight = Math.max(height, ...bottoms) + 'px';
    });
  }
  const gifs = ['img/scanning.GIF', 'img/fingerprint.GIF', 'img/DNAcode.GIF', 'img/analysis.gif'];
  function removeFragment(element) {
    element.querySelectorAll('video').forEach(video => {
      video.pause();
      video.removeAttribute('src');
      video.load();
    });
    element.remove();
  }
  function interrupt() {
    if (document.hidden || document.querySelector('dialog[open]')) return;
    while (interruptions.children.length >= 5) removeFragment(interruptions.firstElementChild);
    const box = document.createElement('section');
    box.className = 'glitch-window';
    box.setAttribute('aria-hidden', 'false');
    interruptions.setAttribute('aria-hidden', 'false');
    box.style.left = random(0, 69) + 'vw';
    box.style.top = random(12, 73) + 'vh';
    const label = text('div', Math.random() < .5 ? 'not_responding / 0x820824' : '///////// -32768', 'broken-label');
    box.append(label);
    const choice = Math.random();
    const loops = window.LPPP_CATALOG.loops;
    if (choice < .45 && interruptions.querySelectorAll('video').length < 2 && loops.length) {
      const loop = loops[Math.floor(random(0, loops.length))];
      const video = media('video', loop.file, {muted:true, defaultMuted:true, loop:true, playsInline:true, preload:'none'});
      if (video) {
        box.append(video);
        video.play().catch(() => { if (loop.poster) video.poster = L.safeURL(loop.poster); });
      }
    } else {
      const image = media('img', gifs[Math.floor(random(0, gifs.length))], {alt:'', loading:'lazy'});
      if (image) box.append(image);
    }
    const button = text('button', choice > .8 ? '????????.exe' : '×');
    button.type = 'button';
    button.onclick = () => {
      const dummyURL = L.safeURL(window.LPPP_CATALOG.settings.diaryDummyURL);
      removeFragment(box);
      if (choice > .9 && dummyURL) location.href = L.localURL(window.LPPP_CATALOG.settings.diaryDummyURL);
      else if (choice > .8) L.showASCII();
    };
    box.append(button);
    interruptions.append(box);
    setTimeout(() => removeFragment(box), random(10000, 21000));
  }
  function start() {
    clearInterval(timer);
    if (!reduced && !document.hidden) timer = setInterval(interrupt, 2400);
  }
  document.querySelector('#ascii').onclick = () => L.showASCII();
  plane.addEventListener('play', event => {
    plane.querySelectorAll('audio,video').forEach(element => { if (element !== event.target) element.pause(); });
    const id = event.target.closest('[data-entry]')?.dataset.entry;
    const entry = window.LPPP_DIARY.entries.find(item => item.id === id);
    const artwork = mediaURL(entry?.artwork);
    listeningArtwork.style.backgroundImage = artwork ? 'url(' + JSON.stringify(artwork) + ')' : '';
    listeningArtwork.hidden = !artwork;
  }, true);
  plane.addEventListener('pause', () => {
    if (![...plane.querySelectorAll('audio,video')].some(element => !element.paused)) listeningArtwork.hidden = true;
  }, true);
  addEventListener('resize', () => {
    plane.querySelectorAll('.diary-window').forEach(element => {
      element.style.left = Math.max(0, Math.min(element.offsetLeft, plane.clientWidth - element.offsetWidth)) + 'px';
    });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      interruptions.querySelectorAll('.glitch-window').forEach(removeFragment);
      plane.querySelectorAll('audio,video').forEach(element => element.pause());
    }
    start();
  });
  addEventListener('pagehide', () => {
    clearInterval(timer);
    interruptions.querySelectorAll('.glitch-window').forEach(removeFragment);
    plane.querySelectorAll('audio,video').forEach(element => element.pause());
  });
  addEventListener('pageshow', start);
  addEventListener('lppp:layer', render);
  render();
  start();
  if (!reduced) { interrupt(); interrupt(); }
})();
