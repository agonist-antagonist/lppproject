(() => {
  'use strict';
  const clone = value => JSON.parse(JSON.stringify(value));
  const original = clone(window.LPPP_DIARY.entries);
  const form = document.querySelector('#diary-form');
  const records = document.querySelector('#entries');
  const status = document.querySelector('#status');
  const mediaFields = [['audio','音源','audio/*'],['artwork','アートワーク','image/*'],['video','動画','video/mp4,video/webm,video/quicktime']];
  let entries = clone(original);
  let assets = new Map();
  let selected = entries[0]?.id;
  let database;
  let dirty = false;
  let busy = false;
  const previewURLs = [];
  const message = (text, error = false) => {
    status.textContent = text;
    status.classList.toggle('error', error);
  };
  const uid = () => {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  };
  const current = () => entries.find(entry => entry.id === selected);
  const value = name => form.elements.namedItem(name).value;
  function setBusy(state) {
    busy = state;
    document.querySelectorAll('button,input,textarea,select').forEach(element => { element.disabled = state; });
  }
  function list() {
    records.replaceChildren(...entries.map(entry => {
      const option = document.createElement('option');
      option.value = entry.id;
      option.textContent = (entry.date || entry.year || '') + ' / ' + (entry.title || entry.id);
      option.selected = entry.id === selected;
      return option;
    }));
  }
  function capture() {
    const entry = current();
    if (!entry) return;
    for (const name of ['date','title','text','artist','visibility','audio','artwork','video']) entry[name] = value(name).trim();
  }
  function render() {
    const entry = current();
    form.hidden = !entry;
    document.querySelector('#delete-entry').disabled = !entry;
    list();
    if (!entry) return;
    for (const name of ['date','title','text','artist','visibility']) form.elements.namedItem(name).value = entry[name] || '';
    const host = document.querySelector('#media-fields');
    host.replaceChildren();
    for (const [name, labelText, accept] of mediaFields) {
      const section = document.createElement('div');
      section.className = 'media-field';
      const label = document.createElement('label');
      label.textContent = labelText + ' / パス・URL';
      const path = document.createElement('input');
      path.type = 'text';
      path.name = name;
      path.value = entry[name] || '';
      label.append(path);
      const uploadLabel = document.createElement('label');
      uploadLabel.textContent = labelText + 'のファイルを選ぶ';
      const upload = document.createElement('input');
      upload.type = 'file';
      upload.accept = accept;
      upload.onchange = () => attach(name, upload.files[0]);
      uploadLabel.append(upload);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'media-remove';
      remove.textContent = labelText + 'を外す';
      remove.onclick = () => { path.value = ''; capture(); dirty = true; };
      section.append(label, uploadLabel, remove);
      host.append(section);
    }
  }
  async function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('lppp-diary-editor-v1', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('drafts');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('別の編集画面を閉じてください。'));
    });
  }
  async function storedDraft() {
    return new Promise((resolve, reject) => {
      const request = database.transaction('drafts').objectStore('drafts').get('current');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function persist() {
    if (!database) throw new Error('端末内に保存できません。更新ZIPを書き出して保管してください。');
    const referenced = new Set(entries.flatMap(entry => mediaFields.map(([name]) => entry[name]).filter(Boolean)));
    const savedAssets = [...assets].filter(([path]) => referenced.has(path));
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('drafts', 'readwrite');
      transaction.objectStore('drafts').put({entries:clone(entries), assets:savedAssets}, 'current');
      transaction.oncomplete = () => { assets = new Map(savedAssets); dirty = false; resolve(); };
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error('下書きの保存を完了できませんでした。'));
    });
  }
  function validate(incoming) {
    if (!Array.isArray(incoming) || incoming.length > 3000) throw new Error('DIARYの記録データを確認してください。');
    const ids = new Set();
    for (const entry of incoming) {
      if (!entry || typeof entry.id !== 'string' || !entry.id || ids.has(entry.id)) throw new Error('記録IDが空欄または重複しています。');
      ids.add(entry.id);
      if (!['public','hidden','draft'].includes(entry.visibility)) throw new Error('表示範囲を確認してください。');
      for (const key of ['date','year','title','text','artist','audio','artwork','video']) {
        if (entry[key] != null && typeof entry[key] !== 'string') throw new Error('記録の書式を確認してください。');
      }
      for (const [name] of mediaFields) if (entry[name] && !window.LPPP.safeURL(entry[name])) throw new Error('素材にはサイト内のパスかhttps URLを使ってください。');
    }
  }
  async function imageForWeb(file) {
    if (file.type === 'image/gif') return {blob:file, extension:'gif'};
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', .92));
      if (!blob) throw new Error('画像を変換できませんでした。');
      return {blob, extension:blob.type === 'image/webp' ? 'webp' : 'png'};
    } finally { URL.revokeObjectURL(url); }
  }
  async function attach(name, file) {
    if (!file || busy || !current()) return;
    capture();
    const entry = current();
    setBusy(true);
    try {
      if (file.size > 50 * 1024 * 1024) throw new Error('1ファイル50MB以内の素材を選んでください。');
      let extension = file.name.split('.').pop().toLowerCase();
      const permitted = {audio:['mp3','m4a','aac','wav','ogg','opus','flac'],video:['mp4','webm','mov'],artwork:['jpg','jpeg','png','gif','webp','avif','heic','heif']};
      if (!permitted[name].includes(extension)) throw new Error('この種類の素材を選べません。別のファイル形式を使ってください。');
      let blob = file;
      if (name === 'artwork') ({blob, extension} = await imageForWeb(file));
      const path = 'assets/uploads/diary-' + uid() + '.' + extension;
      const referenced = new Set(entries.flatMap(item => mediaFields.map(([field]) => field === name && item === entry ? '' : item[field])));
      const total = [...assets].filter(([key]) => referenced.has(key)).reduce((sum, [,asset]) => sum + asset.size, 0) + blob.size;
      if (total > 150 * 1024 * 1024) throw new Error('選択素材の合計が150MBを超えています。動画を外部URLにするなどして軽量化してください。');
      assets.set(path, blob);
      entry[name] = path;
      dirty = true;
      try { await persist(); message(file.name + ' を下書きに追加しました。'); }
      catch (error) { message(error.message, true); }
    } catch (error) { message(error.message, true); }
    finally { setBusy(false); render(); }
  }
  function download(blob, name) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  form.addEventListener('input', () => { dirty = true; });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    capture();
    setBusy(true);
    try { validate(entries); await persist(); list(); message('この端末に下書きを保存しました。公開するには更新ZIPを書き出してください。'); }
    catch (error) { message(error.message, true); }
    finally { setBusy(false); }
  });
  records.onchange = () => { capture(); selected = records.value; render(); dirty = true; };
  document.querySelector('#new-entry').onclick = () => {
    capture();
    const now = new Date();
    const date = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0,10);
    const entry = {id:'DIARY-' + uid(),date,title:'',text:'',artist:'',audio:'',artwork:'',video:'',visibility:'public'};
    entries.unshift(entry);
    selected = entry.id;
    render();
    dirty = true;
    form.elements.namedItem('title').focus();
  };
  document.querySelector('#delete-entry').onclick = async () => {
    if (!current() || !confirm('この記録を削除しますか？公開サイトには更新ZIPを反映した後で適用されます。')) return;
    entries = entries.filter(entry => entry.id !== selected);
    selected = entries[0]?.id;
    dirty = true;
    render();
    setBusy(true);
    try { await persist(); message('記録を下書きから削除しました。'); }
    catch (error) { message(error.message, true); }
    finally { setBusy(false); render(); }
  };
  document.querySelector('#published-data').onclick = async () => {
    if (!confirm('この端末の下書きを公開データに置き換えますか？先に更新ZIPを書き出すと素材も保存できます。')) return;
    entries = clone(original);
    assets = new Map();
    selected = entries[0]?.id;
    dirty = true;
    render();
    try { await persist(); message('配布・公開されているDIARYデータを読み込みました。'); }
    catch (error) { message(error.message, true); }
  };
  document.querySelector('#export-diary').onclick = async () => {
    if (busy) return;
    capture();
    setBusy(true);
    try {
      validate(entries);
      const files = new Map();
      const data = 'window.LPPP_DIARY = ' + JSON.stringify({version:1,entries}, null, 2) + ';\n';
      files.set('data/diary.js', new Blob([data], {type:'text/javascript;charset=utf-8'}));
      for (const entry of entries) for (const [name] of mediaFields) {
        const path = entry[name];
        if (assets.has(path)) files.set(path, assets.get(path));
      }
      const zip = await window.DiaryZip.write(files);
      download(zip, 'LPPP_DIARY_UPDATE_' + new Date().toISOString().slice(0,10) + '.zip');
      let storageMessage = '';
      try { await persist(); } catch { storageMessage = '\n端末内の保存は利用できません。書き出したZIPを保管してください。'; }
      dirty = false;
      message('更新ZIPを書き出しました。展開したdataとassetsをサイトへ上書きし、GitHubへアップロードしてください。' + storageMessage);
    } catch (error) { message(error.message, true); }
    finally { setBusy(false); render(); }
  };
  document.querySelector('#import-diary').onchange = async event => {
    const file = event.target.files[0];
    if (!file || busy) return;
    if (dirty && !confirm('入力中の下書きを読み込むZIPの内容に置き換えますか？')) { event.target.value = ''; return; }
    setBusy(true);
    try {
      const files = await window.DiaryZip.read(file);
      const text = await files.get('data/diary.js').text();
      const parsed = JSON.parse(text.replace(/^\s*window\.LPPP_DIARY\s*=\s*/, '').replace(/;\s*$/, ''));
      validate(parsed.entries);
      const importedAssets = new Map();
      for (const [path, blob] of files) {
        if (path === 'data/diary.js') continue;
        if (!/^assets\/uploads\/[a-zA-Z0-9_.-]+$/.test(path)) throw new Error('素材のファイル名を確認してください。');
        importedAssets.set(path, blob);
      }
      entries = parsed.entries;
      assets = importedAssets;
      selected = entries[0]?.id;
      dirty = true;
      try { await persist(); message('更新ZIPから記録と素材を読み込みました。'); }
      catch (error) { message(error.message, true); }
    } catch (error) { message(error.message, true); }
    finally { event.target.value = ''; setBusy(false); render(); }
  };
  document.querySelector('#preview-diary').onclick = () => {
    capture();
    try {
      validate(entries);
      previewURLs.splice(0).forEach(url => URL.revokeObjectURL(url));
      const draft = clone(entries);
      for (const entry of draft) {
        for (const [name] of mediaFields) {
          if (!assets.has(entry[name])) continue;
          const url = URL.createObjectURL(assets.get(entry[name]));
          previewURLs.push(url);
          entry[name] = url;
        }
      }
      sessionStorage.setItem('lppp-diary-preview-v1', JSON.stringify(draft));
      const url = new URL(window.LPPP.localURL('diary/index.html'));
      url.searchParams.set('preview', '1');
      window.open(url.href, '_blank');
      message('下書きのプレビューを開きました。素材を表示する間はこの編集画面も開いておいてください。');
    } catch (error) { message(error.message, true); }
  };
  addEventListener('beforeunload', event => { if (dirty || busy) { event.preventDefault(); event.returnValue = ''; } });
  setBusy(true);
  openDatabase().then(async result => {
    database = result;
    const draft = await storedDraft();
    if (draft) {
      validate(draft.entries);
      entries = draft.entries;
      assets = new Map(draft.assets);
      selected = entries[0]?.id;
      message('この端末に保存してある下書きを復元しました。');
    } else message('公開データを読み込みました。');
  }).catch(error => message('端末内の保存を利用できません。更新ZIPで保管できます。 ' + error.message, true))
    .finally(() => { setBusy(false); render(); });
})();
