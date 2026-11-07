(() => {
  'use strict';
  const L = window.LPPP;
  const numbers = new Map(window.LPPP_CATALOG.rooms.filter(L.visible).map(room => [String(room.number), room]));
  const host = document.querySelector('.text-content, .logo p'); if (!host) return;
  const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT), nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  const linked = new Set();
  for (const node of nodes) {
    const regex = /(^|\n)([\t ]*)(\d+)([\t ]*)(?=\r?\n|$)/g;
    let match, start = 0; const fragment = document.createDocumentFragment(); let changed = false;
    while ((match = regex.exec(node.textContent))) {
      const room = numbers.get(match[3]); if (!room || linked.has(room.id)) continue;
      changed = true; linked.add(room.id);
      fragment.append(node.textContent.slice(start, match.index), match[1] + match[2]);
      const link = document.createElement('a');
      link.className = 'text-room-number'; link.textContent = match[3];
      link.href = L.localURL('rooms/index.html?room=' + encodeURIComponent(room.id));
      link.setAttribute('aria-label', match[3]); fragment.append(link, match[4]);
      start = match.index + match[0].length;
    }
    if (changed) { fragment.append(node.textContent.slice(start)); node.replaceWith(fragment); }
  }
})();
