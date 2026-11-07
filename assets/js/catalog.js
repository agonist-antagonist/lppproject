(() => {
  'use strict';
  const D = window.LPPP_CATALOG, L = window.LPPP, esc = L.esc;
  const type = document.body.dataset.catalog, title = type === 'market' ? 'MARKET' : 'PROCESS';
  const host = document.querySelector('#catalog-view'), overlay = document.querySelector('#catalog-overlay');
  const player = document.querySelector('#audio-player'), audio = player.querySelector('audio');
  let filter = 'ALL', query = '', track = null, returnFocus = null;
  let memo = [];
  try { memo = JSON.parse(localStorage.getItem('lppp-market-memo-v1') || '[]'); if (!Array.isArray(memo)) memo = []; } catch {}
  const items = () => D[type].filter(L.visible);
  const source = path => esc(L.safeURL(path));
  const sampleKeys = ['preview1', 'preview2'];
  const frame = content => `<section class="window"><header class="window-bar"><span class="window-dot"></span><span class="window-title">${title}</span><span></span></header><div class="window-content">${content}</div></section>`;
  const price = item => !item.orderEnabled ? '<span class="corrupt-price">PRICE / ∫˚…æ≤æ“æææ‘≠≥∫∂ß´∑®¥∫∆¨˚</span>' : `¥${esc(item.displayPrice || Number(item.price || 0).toLocaleString('ja-JP'))} / STOCK ${esc(item.stock ?? '—')}`;
  const memoButton = item => `<button type="button" class="memo-button ${memo.includes(item.id) ? 'saved' : ''}" data-memo="${esc(item.id)}" aria-label="Save ${esc(item.title)}" aria-pressed="${memo.includes(item.id)}">+</button>`;
  function render() {
    const categories = type === 'market' ? D.marketCategories : D.processCategories;
    const toolbar = ['ALL', ...categories].map(category => `<button type="button" data-category="${esc(category)}" class="${category === filter ? 'active' : ''}" aria-pressed="${category === filter}">${esc(category)}</button>`).join('');
    const entries = items();
    const rows = type === 'market' ? entries.map(item => `<article class="card" data-record="${esc(item.id)}"><button type="button" class="card-image" data-detail="${esc(item.id)}" aria-label="${esc(item.title)}"><img src="${source(item.images?.[0] || item.image)}" alt="${esc(item.title)}" loading="lazy" decoding="async"></button><div class="card-body"><b>${esc(item.id)}</b><br><button type="button" class="title" data-detail="${esc(item.id)}">${esc(item.title)}</button><p>${price(item)}<br>${item.orderEnabled ? 'ORDER ENABLED' : 'REFERENCE / NOT FOR SALE'}</p>${sampleKeys.some(key => L.safeURL(item[key])) ? `<button type="button" class="market-preview-button" data-listen="${esc(item.id)}">試聴</button>` : ''}${memoButton(item)}</div></article>`).join('') : entries.map(item => `<article class="audio-record" data-record="${esc(item.id)}"><img src="${source(item.image)}" alt="" loading="lazy" decoding="async"><div class="audio-copy"><span>${esc(item.id)} / ${esc(item.category)}</span><button type="button" data-track="${esc(item.id)}">${esc(item.title)}</button><small>${esc(item.description || item.genre)}</small></div><time>${esc(item.duration)} SEC</time></article>`).join('');
    host.innerHTML = frame(`<h1 class="section-title">${title}</h1><input class="goods-search" type="search" aria-label="Search ${title}" placeholder="SEARCH ${title} / CAT.NO. / #TAG" value="${esc(query)}"><div class="toolbar" aria-label="Categories">${toolbar}</div><div class="${type === 'market' ? 'gallery' : 'audio-records'}">${rows}</div><p id="catalog-empty" class="empty-message" hidden>NO CORRESPONDING RECORD.</p>${type === 'process' ? '<p class="home-note">45-SECOND WEB PREVIEWS / FADE IN 1 SEC / FADE OUT 3 SEC.</p>' : ''}`);
    applyFilter(); updateMemo();
    host.querySelector('.goods-search').addEventListener('input', event => { query = event.target.value; applyFilter(); });
    if (type === 'process' && !L.deep && !document.querySelector('.audio-bg')) {
      const bg = document.createElement('div'); bg.className = 'audio-bg';
      bg.style.backgroundImage = `url("${L.asset('assets/pc32/media/images/backgrounds/flower0' + (3 + Math.floor(Math.random() * 3)) + '.jpg')}")`;
      document.body.prepend(bg);
    }
  }
  function applyFilter() {
    let count = 0;
    host.querySelectorAll('[data-record]').forEach(card => {
      const item = D[type].find(entry => entry.id === card.dataset.record);
      const text = [item.id, item.title, item.description, ...(item.tags || [])].join(' ').toLowerCase();
      card.hidden = !(filter === 'ALL' || item.category === filter) || !text.includes(query.trim().toLowerCase());
      if (!card.hidden) count++;
    });
    host.querySelector('#catalog-empty').hidden = count > 0;
    host.querySelectorAll('[data-category]').forEach(button => {
      const active = button.dataset.category === filter; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active));
    });
  }
  function updateMemo() {
    const valid = memo.filter(id => D.market.some(item => item.id === id && L.visible(item)));
    document.querySelector('#memo-toggle b')?.replaceChildren(String(valid.length));
    document.querySelectorAll('[data-memo]').forEach(button => {
      const saved = memo.includes(button.dataset.memo); button.classList.toggle('saved', saved); button.setAttribute('aria-pressed', String(saved));
    });
  }
  function toggleMemo(id) {
    memo = memo.includes(id) ? memo.filter(saved => saved !== id) : [...memo, id];
    try { localStorage.setItem('lppp-market-memo-v1', JSON.stringify(memo)); } catch {}
    updateMemo();
  }
  function closeDialog() {
    const dialog = overlay.querySelector('dialog'); dialog?.querySelectorAll('audio').forEach(element => element.pause()); dialog?.close(); overlay.replaceChildren(); returnFocus?.focus();
  }
  function dialog(content, label) {
    closeDialog(); returnFocus = document.activeElement;
    overlay.innerHTML = `<dialog class="detail-dialog" aria-label="${esc(label)}">${content}</dialog>`;
    const element = overlay.querySelector('dialog'); element.showModal();
    element.querySelectorAll('[data-close]').forEach(button => { button.onclick = closeDialog; });
    element.addEventListener('click', event => { if (event.target === element) { const rect = element.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(); } });
    element.addEventListener('cancel', event => { event.preventDefault(); closeDialog(); });
    return element;
  }
  function detail(id, listen = false) {
    const item = D.market.find(entry => entry.id === id && L.visible(entry)); if (!item) return;
    const element = dialog(`<section class="detail-panel"><header><b>${esc(item.id)}</b><button type="button" data-close aria-label="Close">×</button></header><div class="detail-images">${(item.images || [item.image]).filter(Boolean).map(path => `<img src="${source(path)}" alt="${esc(item.title)}" loading="lazy">`).join('')}</div><div class="detail-copy"><small>${esc(item.category)}</small><h2>${esc(item.title)}</h2><div>${price(item)}</div><p>${esc(item.description || '')}</p><p>${(item.tags || []).map(tag => '#' + esc(tag)).join(' ')}</p>${!item.orderEnabled ? '<b>NOT FOR SALE</b>' : ''}${item.relatedArchive ? `<small>RELATED / ${esc(item.relatedArchive)}</small>` : ''}${item.previewAudio ? `<button type="button" data-preview="${esc(item.previewAudio)}">AUDIO PREVIEW</button>` : ''}${sampleHTML(item)}${memoButton(item)}</div></section>`, item.title);
    for (const sample of element.querySelectorAll('.market-sample')) {
      const media = sample.querySelector('audio');
      if (!media) continue;
      const button = sample.querySelector('[data-sample-play]');
      const status = sample.querySelector('[role="status"]');
      media.addEventListener('playing', () => {
        button.textContent = '一時停止';
        status.textContent = '';
      });
      media.addEventListener('pause', () => { button.textContent = '再生'; });
      media.addEventListener('ended', () => { button.textContent = '再生'; });
      media.addEventListener('error', () => {
        status.textContent = '音源を読み込めませんでした。';
        sample.querySelector('a').hidden = false;
      });
    }
    const firstSample = element.querySelector('[data-sample-play]');
    if (listen && firstSample) {
      firstSample.focus();
      toggleSample(firstSample);
    }
  }
  function toggleSample(button) {
    const sample = button.closest('.market-sample');
    const media = sample.querySelector('audio');
    if (!media.paused) {
      media.pause();
      return;
    }
    media.play().catch(error => {
      if (error.name === 'AbortError' || !sample.isConnected) return;
      sample.querySelector('[role="status"]').textContent = '再生できませんでした。';
      sample.querySelector('a').hidden = false;
    });
  }
  function sampleHTML(item) {
    const samples = sampleKeys.filter(key => L.safeURL(item[key]) || (Number(item.previewSeconds) > 0 && (key === 'preview1' || Number(item.previewSeconds) <= 60))); 
    let html = samples.map((key, index) => {
      const url = L.safeURL(item[key]);
      const label = '試聴 ' + (index + 1) + ' / ' + (Number(item.previewSeconds || 60) / 60) + '分';
      if (!url) return `<div class="market-sample"><small>${esc(label)} ／ 準備中</small></div>`;
      return `<div class="market-sample"><small>${esc(label)}</small>
        <button type="button" class="market-preview-button" data-sample-play aria-label="${esc(label)} 再生・一時停止">再生</button>
        <audio controls preload="none" src="${esc(url)}" aria-label="${esc(label)}"></audio>
        <span role="status"></span><a href="${esc(url)}" target="_blank" rel="noopener" hidden>音源を開く</a>
      </div>`;
    }).join('');
    if (item.bandcampAlbum && /^\d+$/.test(item.bandcampAlbum)) {
      html += '<iframe class="bandcamp-player" title="deed / DEMONSTRATION" loading="lazy" src="https://bandcamp.com/EmbeddedPlayer/album=' + esc(item.bandcampAlbum) + '/size=large/bgcol=ffffff/linkcol=0687f5/artwork=small/transparent=true/" allow="autoplay"></iframe>';
    }
    if (item.bandcampURL && L.safeURL(item.bandcampURL)) html += '<p><a target="_blank" rel="noopener" href="' + esc(L.safeURL(item.bandcampURL)) + '">deed / DEMONSTRATION / Bandcamp</a></p>';
    return html;
  }
  function showMemo() {
    const saved = D.market.filter(item => memo.includes(item.id) && L.visible(item));
    const orderable = saved.filter(item => item.orderEnabled && Number(item.stock) > 0);
    const body = orderable.map(item => `${item.id} — ${item.title}`).join('\n');
    const email = D.settings.contactEmail;
    const mail = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent('Lppproject / ORDER')}&body=${encodeURIComponent(body)}`;
    dialog(`<section class="memo-panel"><header><b>CATALOG MEMO</b><button type="button" data-close aria-label="Close">×</button></header><div class="memo-content">${saved.length ? saved.map(item => `<div class="memo-line"><b>${esc(item.id)}</b><span>${esc(item.title)}${item.orderEnabled ? '' : ' / NOT FOR SALE'}</span><button type="button" data-remove="${esc(item.id)}" aria-label="Remove ${esc(item.title)}">×</button></div>`).join('') : '<p>NO SAVED CATALOG NUMBERS.</p>'}${orderable.length ? `<a class="order-link" href="${esc(mail)}">ORDER / EMAIL</a>` : ''}</div></section>`, 'CATALOG MEMO');
  }
  function play(item) {
    if (!L.visible(item) || !L.safeURL(item.file)) return;
    track = item; player.hidden = false;
    document.querySelector('#audio-player-title').textContent = item.id + ' / ' + item.title;
    document.querySelector('#audio-player-meta').textContent = `${item.category} / ${item.genre || ''} / ${item.duration} SEC PREVIEW`;
    player.querySelector('.player-message').textContent = '';
    if (audio.src !== L.safeURL(item.file)) { audio.src = L.safeURL(item.file); audio.load(); }
    audio.play().catch(() => { player.querySelector('.player-message').textContent = '再生ボタンを押してください。'; });
    document.body.classList.add('has-player');
  }
  function move(delta) {
    const list = D.process.filter(L.visible); if (!list.length) return;
    const index = Math.max(0, list.findIndex(item => item.id === track?.id)); play(list[(index + delta + list.length) % list.length]);
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button) return;
    if (button.dataset.category !== undefined) { filter = button.dataset.category; applyFilter(); }
    else if (button.dataset.detail) detail(button.dataset.detail);
    else if (button.dataset.listen) detail(button.dataset.listen, true);
    else if (button.hasAttribute('data-sample-play')) toggleSample(button);
    else if (button.dataset.memo) toggleMemo(button.dataset.memo);
    else if (button.dataset.track || button.dataset.preview) { const item = D.process.find(entry => entry.id === (button.dataset.track || button.dataset.preview)); if (item) play(item); }
    else if (button.dataset.remove) { toggleMemo(button.dataset.remove); showMemo(); }
  });
  document.querySelector('#memo-toggle')?.addEventListener('click', showMemo);
  player.querySelector('[data-player-close]').onclick = () => { audio.pause(); audio.removeAttribute('src'); audio.load(); player.hidden = true; document.body.classList.remove('has-player'); };
  player.querySelector('[data-collapse]').onclick = event => { const collapsed = player.classList.toggle('collapsed'); event.currentTarget.textContent = collapsed ? '+' : '−'; event.currentTarget.setAttribute('aria-expanded', String(!collapsed)); document.body.classList.toggle('player-collapsed', collapsed); };
  player.querySelector('[data-prev]').onclick = () => move(-1);
  player.querySelector('[data-next]').onclick = () => move(1);
  player.querySelector('[data-toggle]').onclick = () => { if (audio.paused && track) play(track); else audio.pause(); };
  player.querySelector('[data-loop]').onclick = event => { audio.loop = !audio.loop; event.currentTarget.textContent = audio.loop ? 'LOOP: ON' : 'LOOP: OFF'; };
  audio.addEventListener('error', () => { player.querySelector('.player-message').textContent = '音源を読み込めませんでした。'; });
  window.addEventListener('pagehide', () => document.querySelectorAll('audio').forEach(media => media.pause()));
  window.addEventListener('lppp:layer', () => { closeDialog(); render(); if (track && !L.visible(track)) player.querySelector('[data-player-close]').click(); });
  document.addEventListener('play', event => {
    if (event.target.tagName !== 'AUDIO') return;
    document.querySelectorAll('audio').forEach(element => { if (element !== event.target) element.pause(); });
  }, true);
  render();
})();
