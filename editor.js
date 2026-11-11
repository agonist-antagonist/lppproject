(() => {
  'use strict';
  const clone = value => JSON.parse(JSON.stringify(value));
  const original = clone(window.LPPP_CATALOG), draftKey = 'lppp-catalog-draft-v2';
  let data = clone(original), kind = 'market', selected = data.market[0]?.id, dirty = false;
  const $ = selector => document.querySelector(selector), fields = $('#fields'), form = $('#record-form');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const csvColumns = ['kind','id','title','category','visibility','year','genre','description','file','image','images','duration','tags','price','displayPrice','stock','orderEnabled','saleType','previewAudio','preview1','preview2','previewSeconds','bandcampURL','bandcampAlbum','number','externalURL','loopId','poster','hasAudio'];
  const status = (message, error = false) => { $('#status').textContent = message; $('#status').classList.toggle('error', error); };
  const definitions = () => ({
    process:[['id','作品ID'],['title','タイトル'],['category','分類','select',data.processCategories],['visibility','公開状態','select',['public','hidden','draft']],['year','制作年'],['genre','音楽ジャンル'],['description','説明','textarea'],['file','音源ファイルの場所'],['image','画像ファイルの場所'],['duration','長さ（秒）','number'],['tags','タグ（ | で区切る）']],
    market:[['id','作品ID'],['title','タイトル'],['category','分類','select',data.marketCategories],['visibility','公開状態','select',['public','hidden','draft']],['description','説明','textarea'],['images','画像ファイルの場所（1行に1枚）','textarea'],['price','価格（数値）','number'],['displayPrice','価格の表示文字'],['stock','在庫','number'],['orderEnabled','注文を受け付ける','checkbox'],['saleType','販売区分'],['previewAudio','既存Process作品IDで試聴（旧形式）'],['preview1','試聴1の音源パス'],['preview2','試聴2の音源パス'],['previewSeconds','試聴の長さ（秒）','number'],['bandcampURL','BandcampのURL'],['bandcampAlbum','BandcampのアルバムID'],['tags','タグ（ | で区切る）']],
    rooms:[['id','小部屋ID'],['number','Textの番号'],['externalURL','外部リンクURL（空欄なら小部屋）'],['title','タイトル（空欄なら表示しません）'],['loopId','使う動画','select',data.loops.map(x=>x.id)],['visibility','公開状態','select',['public','hidden','draft']]],
    loops:[['id','動画ID'],['file','動画ファイルの場所'],['poster','静止画ファイルの場所'],['duration','長さ（秒）','number'],['hasAudio','音声あり','checkbox']],
    settings:[['hiddenCode','隠し階層の入口コード'],['contactEmail','注文メールの宛先']]
  })[kind];
  const current = () => kind === 'settings' ? data.settings : data[kind].find(x => x.id === selected);
  function validate(catalog) {
    if (!catalog || !catalog.settings || !Array.isArray(catalog.processCategories) || !Array.isArray(catalog.marketCategories)) throw new Error('Lppproject形式のデータを選んでください。');
    if (!String(catalog.settings.hiddenCode || '').trim()) throw new Error('入口コードが空欄です。');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(catalog.settings.contactEmail || '')) throw new Error('メールアドレスを確認してください。');
    for (const section of ['process','market','rooms','loops']) {
      if (!Array.isArray(catalog[section])) throw new Error(section + ' の一覧がありません。');
      const ids = new Set(), numbers = new Set();
      for (const item of catalog[section]) {
        if (!item.id || ids.has(item.id)) throw new Error(section + ' のIDが空欄または重複しています。'); ids.add(item.id);
        if (['process','market'].includes(section) && !(section === 'process' ? catalog.processCategories : catalog.marketCategories).includes(item.category)) throw new Error(item.id + ' の分類を確認してください。');
        if (section !== 'loops' && !['public','hidden','draft'].includes(item.visibility)) throw new Error(item.id + ' の公開状態を確認してください。');
        if (section === 'rooms') {
          if (!/^\d+(?:-\d+)?$/.test(String(item.number)) || numbers.has(String(item.number))) throw new Error('Textの番号が空欄・数字以外・重複のいずれかです。'); numbers.add(String(item.number));
          if (item.externalURL && !/^https?:\/\/\S+$/i.test(item.externalURL)) throw new Error(item.id + ' の外部リンクはhttpかhttpsのURLを使ってください。');
          if (!catalog.loops.some(loop => loop.id === item.loopId)) throw new Error(item.id + ' の動画IDが見つかりません。');
        }
        for (const key of ['file','image','poster',...(section === 'market' ? ['images'] : [])]) {
          const values = Array.isArray(item[key]) ? item[key] : [item[key]];
          for (const path of values.filter(Boolean)) if (/^[\w+.-]+:/.test(path) && !/^https?:\/\//i.test(path)) throw new Error(item.id + ' のファイルパスは相対パスかhttps URLを使ってください。');
        }
        for (const key of ['duration','price','stock','previewSeconds']) if (item[key] != null && item[key] !== '' && (!Number.isFinite(Number(item[key])) || Number(item[key]) < 0)) throw new Error(item.id + ' の ' + key + ' は0以上の数値を入れてください。');
      }
    }
  }
  function list() {
    const search = $('#record-search').value.toLowerCase();
    $('#records').innerHTML = kind === 'settings' ? '<option value="settings">設定</option>' : data[kind].filter(x => [x.id,x.title,x.number].join(' ').toLowerCase().includes(search)).map(x => `<option value="${esc(x.id)}" ${x.id === selected ? 'selected' : ''}>${esc(x.number ? x.number+' / ' : '')}${esc(x.id)} — ${esc(x.title || x.loopId || '')}</option>`).join('');
    for (const id of ['add-record','duplicate-record','delete-record']) $('#'+id).disabled = kind === 'settings';
  }
  const basicMarketFields = new Set(['title','category','price','stock','orderEnabled','visibility','description','images']);
  function show() {
    const item = current(); dirty = false;
    $('#export-data').disabled = !item;
    const renderField = ([key,label,type,options]) => {
      const value = Array.isArray(item[key]) ? item[key].join(key === 'images' ? '\n' : ' | ') : (item[key] ?? '');
      const input = type === 'textarea' ? `<textarea name="${key}">${esc(value)}</textarea>` : type === 'select' ? `<select name="${key}">${options.map(v => `<option value="${esc(v)}" ${v === value ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select>` : `<input name="${key}" type="${type || 'text'}" ${type === 'checkbox' ? (item[key] ? 'checked' : '') : `value="${esc(value)}"`} ${type === 'number' ? 'min="0" step="any"' : ''} ${key === 'id' || key === 'hiddenCode' ? 'required' : ''}>`;
      return `<label class="${type === 'textarea' ? 'wide' : ''} ${type === 'checkbox' ? 'checkbox' : ''}"><span>${label}</span>${input}${key === 'visibility' ? '<span class="hint">public：通常表示 / hidden：隠し階層 / draft：非表示</span>' : ''}</label>`;
    };
    const entries = definitions();
    if (!item) fields.innerHTML = '<p>追加ボタンから登録できます。</p>';
    else if (kind === 'market') {
      const basic = entries.filter(([key]) => basicMarketFields.has(key));
      const advanced = entries.filter(([key]) => !basicMarketFields.has(key));
      fields.innerHTML = basic.map(renderField).join('') +
        '<details class="market-advanced"><summary>試聴・その他の設定</summary><div>' +
        advanced.map(renderField).join('') + '</div></details>';
    } else fields.innerHTML = entries.map(renderField).join('');
  }
  function draft() {
    try { localStorage.setItem(draftKey, JSON.stringify(data)); $('#restore-draft').hidden = false; } catch { status('ブラウザへの保存ができません。更新データを書き出して保存してください。', true); return; }
    status('項目を下書きに保存しました。サイトへの反映には更新データの書き出しが必要です。');
  }
  function save() {
    if (!current()) return true;
    const backup = clone(data), item = current(), oldID = selected;
    const values = new FormData(form);
    for (const [key,,type] of definitions()) {
      const value = String(values.get(key) ?? '').trim();
      if (['preview1','preview2','previewSeconds','bandcampURL','bandcampAlbum'].includes(key) && !Object.hasOwn(item, key) && value === '') continue;
      item[key] = type === 'checkbox' ? values.has(key) : key === 'images' ? value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean) : key === 'tags' ? value.split('|').map(x=>x.trim()).filter(Boolean) : type === 'number' ? (value === '' ? null : Number(value)) : value;
    }
    if (kind === 'market') {
      const previous = backup.market.find(entry => entry.id === oldID);
      if (Number(item.price) !== Number(previous.price) && item.displayPrice === (previous.displayPrice ?? '')) {
        item.displayPrice = '';
        form.elements.displayPrice.value = '';
      }
    }
    try { validate(data); } catch (error) { data = backup; selected = oldID; status(error.message, true); return false; }
    if (kind !== 'settings') selected = item.id;
    dirty = false; list(); draft(); return true;
  }
  function beforeChange() { return !dirty || save(); }
  form.addEventListener('input', () => { dirty = true; });
  form.addEventListener('change', () => { dirty = true; });
  form.addEventListener('submit', event => { event.preventDefault(); save(); });
  $('#kind').onchange = event => { if (!beforeChange()) { event.target.value = kind; return; } kind = event.target.value; selected = kind === 'settings' ? 'settings' : data[kind][0]?.id; $('#record-search').value=''; list(); show(); };
  $('#records').onchange = event => { const next=event.target.value; if (!beforeChange()) { event.target.value=selected; return; } selected = next; show(); };
  $('#record-search').oninput = list;
  function unique(section) { const prefix = {process:'LPP-A-',market:'LPP-G-',rooms:'room-',loops:'loop-'}[section]; let n = data[section].length + 1; while (data[section].some(x => x.id === prefix+n)) n++; return prefix+n; }
  function add(copy) {
    if (!beforeChange()) return;
    const section = kind;
    const item = copy && current() ? clone(current()) : section === 'process' ? {title:'',category:'DEMO',visibility:'draft',duration:45,tags:[]} : section === 'market' ? {title:'',category:'ARTWORK',visibility:'draft',images:[],tags:[],orderEnabled:false,stock:0} : section === 'rooms' ? {title:'',number:String(Math.max(0,...data.rooms.map(x=>Number(x.number)).filter(Number.isFinite))+1),loopId:data.loops[0]?.id || '',visibility:'draft'} : {file:'',poster:'',duration:0,hasAudio:false};
    item.id = unique(section);
    if (copy && section === 'rooms') item.number = String(Math.max(0,...data.rooms.map(x=>Number(x.number)).filter(Number.isFinite))+1);
    data[section].push(item); selected = item.id; $('#record-search').value = ''; list(); show(); draft();
  }
  $('#add-record').onclick = () => add(false); $('#duplicate-record').onclick = () => add(true);
  $('#delete-record').onclick = () => {
    if (!current() || !confirm('この項目を台帳から削除しますか？')) return;
    if (kind === 'loops' && data.rooms.some(room => room.loopId === selected)) { status('小部屋で使用中の動画です。先に小部屋の割り当てを変更してください。', true); return; }
    data[kind] = data[kind].filter(x => x.id !== selected); selected = data[kind][0]?.id; list(); show(); draft();
  };
  const download = (name, text, mime) => { const blob = new Blob([text], {type:mime}), url = URL.createObjectURL(blob), link=document.createElement('a'); link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);status(name+' を書き出しました。'); };
  function exportData(kind) {
    if (!save()) return;
    try { validate(data); } catch (error) { status(error.message,true); return; }
    if (kind === 'js') download('catalog.js', 'window.LPPP_CATALOG = '+JSON.stringify(data,null,2)+';\n','text/javascript;charset=utf-8');
    else if (kind === 'json') download('LPPP_catalog_backup.json',JSON.stringify(data,null,2),'application/json;charset=utf-8');
    else {
      const quote = value => '"'+String(value ?? '').replace(/"/g,'""')+'"';
      const rows = [csvColumns, ...['process','market','rooms','loops'].flatMap(section => data[section].map(item => csvColumns.map(column => column === 'kind' ? section : Array.isArray(item[column]) ? item[column].join('|') : item[column] ?? '')))];
      download('LPPP_CATALOG.csv','\ufeff'+rows.map(row=>row.map(quote).join(',')).join('\r\n'),'text/csv;charset=utf-8');
    }
  }
  $('#export-data').onclick=()=>exportData('js');$('#export-json').onclick=()=>exportData('json');$('#export-csv').onclick=()=>exportData('csv');
  function parseCSV(text) {
    const rows=[];let row=[],cell='',quoted=false;
    for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x!==''))rows.push(row);row=[];cell='';}else cell+=c;}
    if(quoted)throw new Error('CSVの引用符が閉じていません。');row.push(cell);if(row.some(x=>x!==''))rows.push(row);return rows;
  }
  function fromCSV(text) {
    const rows=parseCSV(text.replace(/^\ufeff/,'')),headers=rows.shift();if(!headers?.includes('kind')||!headers.includes('id'))throw new Error('この編集画面から書き出したCSVを使用してください。');
    const result=clone(data);for(const section of ['process','market','rooms','loops'])result[section]=[];
    for(const row of rows){const record=Object.fromEntries(headers.map((key,i)=>[key,row[i]??''])),section=record.kind;if(!['process','market','rooms','loops'].includes(section))throw new Error('CSVのkindを確認してください。');const item=clone(data[section].find(x=>x.id===record.id)||{});
      for(const key of headers){if(key==='kind')continue;let value=record[key];if(['tags','images'].includes(key))value=value?value.split('|').map(x=>x.trim()).filter(Boolean):[];else if(['orderEnabled','hasAudio'].includes(key))value=value==='true'||value==='1';else if(['price','stock','duration','previewSeconds'].includes(key))value=value===''?null:Number(value);item[key]=value;}result[section].push(item);
    }return result;
  }
  $('#import-file').onchange=async event=>{
    const file=event.target.files[0];if(!file)return;
    try{let text=await file.text(),incoming;if(file.name.toLowerCase().endsWith('.csv'))incoming=fromCSV(text);else{ text=text.replace(/^\ufeff/,'').replace(/^\s*window\.LPPP_CATALOG\s*=\s*/,'').replace(/;\s*$/,''); incoming=JSON.parse(text); } validate(incoming);data=incoming;kind=$('#kind').value;selected=kind==='settings'?'settings':data[kind][0]?.id;list();show();draft();status(file.name+' を読み込みました。');}catch(error){status(error.message,true);}event.target.value='';
  };
  try { $('#restore-draft').hidden = !localStorage.getItem(draftKey); } catch {}
  $('#restore-draft').onclick=()=>{try{const incoming=JSON.parse(localStorage.getItem(draftKey));validate(incoming);data=incoming;selected=kind==='settings'?'settings':data[kind][0]?.id;list();show();status('下書きを復元しました。');}catch(error){status(error.message,true);}};
  $('#reset-data').onclick=()=>{if(!confirm('配布時のデータに戻しますか？ブラウザの下書きも削除します。'))return;data=clone(original);try{localStorage.removeItem(draftKey);}catch{}$('#restore-draft').hidden=true;selected=kind==='settings'?'settings':data[kind][0]?.id;list();show();status('配布時のデータに戻しました。');};
  window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
  list();show();status('データを読み込みました。');
})();
