(() => {
  'use strict';
  const root = new URL('../../', document.currentScript.src);
  const params = new URL(location.href).searchParams;
  const key = 'lppp-hidden-layer-v1';
  const read = () => { try { return sessionStorage.getItem(key) === 'deep'; } catch { return false; } };
  const save = value => { try { sessionStorage.setItem(key, value ? 'deep' : 'surface'); } catch {} };
  let deep = params.get('layer') === 'deep' || (params.get('layer') !== 'surface' && read());
  if (params.has('layer')) save(deep);
  const asset = path => new URL(path, root).href;
  const localURL = (path, hidden = deep) => {
    const url = new URL(path, root);
    url.searchParams.set('layer', hidden ? 'deep' : 'surface');
    return url.href;
  };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const safeURL = path => {
    if (!path) return '';
    try { const url = new URL(path, root); return ['http:', 'https:', 'file:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
  };
  function apply() {
    document.documentElement.classList.toggle('is-deep', deep);
    document.documentElement.style.setProperty('--hidden-background', `url("${asset('assets/images/hidden-background.jpg')}")`);
    let theme = document.querySelector('meta[name="theme-color"]');
    if (!theme) { theme = document.createElement('meta'); theme.name = 'theme-color'; document.head.append(theme); }
    theme.content = (deep || document.body?.classList.contains('entry-page')) ? '#000000' : (document.body?.classList.contains('catalog-page') ? '#bdbdbd' : '#800000');
    if (!document.body) return;
    const home = document.body.dataset.page === 'home';
    if (!deep) document.querySelector('[data-exit-layer]')?.closest('li')?.remove();
    if (home && deep && !document.querySelector('[data-exit-layer]')) {
      const li = document.createElement('li'), exit = document.createElement('a');
      exit.href = localURL('index.html', false); exit.textContent = 'EXIT'; exit.dataset.exitLayer = '';
      li.append(exit); document.querySelector('.header > ul')?.append(li);
    }
    document.querySelectorAll('a[href]').forEach(link => {
      if (link.dataset.exitLayer !== undefined || link.closest('.service')) return;
      const raw = link.getAttribute('href'); if (!raw || raw.startsWith('#')) return;
      let url; try { url = new URL(raw, location.href); } catch { return; }
      if (url.origin === root.origin && url.pathname.startsWith(root.pathname) && /(?:\.html|\/)$/i.test(url.pathname)) {
        url.searchParams.set('layer', deep ? 'deep' : 'surface'); link.href = url.href;
      }
    });
  }
  window.LPPP = {
    root, asset, localURL, esc, safeURL,
    get deep() { return deep; },
    visible: item => item.visibility !== 'draft' && (item.visibility !== 'hidden' || deep),
    enter() { deep = true; save(true); location.href = localURL('index.html', true); },
    apply
  };
  apply();
  document.addEventListener('DOMContentLoaded', () => {
    apply();
    let sequence = '';
    document.addEventListener('keydown', event => {
      if (/INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key.length !== 1) return;
      const code = String(window.LPPP_CATALOG.settings.hiddenCode);
      sequence = (sequence + event.key).slice(-code.length);
      if (!deep && sequence === code) window.LPPP.enter();
    });
  });
  // Browser back/forward may restore a page from bfcache without rerunning scripts.
  // The URL of the restored entry is authoritative for the hidden presentation.
  window.addEventListener('pageshow', () => {
    const layer = new URL(location.href).searchParams.get('layer');
    deep = layer === 'deep' || (layer !== 'surface' && read()); save(deep); apply();
    window.dispatchEvent(new CustomEvent('lppp:layer', {detail:{deep}}));
  });
})();
