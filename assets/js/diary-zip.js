(() => {
  'use strict';
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let value = i;
    for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
    table[i] = value;
  }
  function crc32(bytes) {
    let result = 0xffffffff;
    for (const byte of bytes) result = (result >>> 8) ^ table[(result ^ byte) & 255];
    return (result ^ 0xffffffff) >>> 0;
  }
  function header(size) {
    const bytes = new Uint8Array(size);
    return {bytes, view:new DataView(bytes.buffer)};
  }
  async function write(files) {
    const parts = [];
    const directory = [];
    let offset = 0;
    for (const [path, blob] of files) {
      const name = encoder.encode(path);
      const bytes = new Uint8Array(await blob.arrayBuffer());
      const crc = crc32(bytes);
      const local = header(30);
      local.view.setUint32(0, 0x04034b50, true);
      local.view.setUint16(4, 20, true);
      local.view.setUint16(6, 0x800, true);
      local.view.setUint16(12, 33, true);
      local.view.setUint32(14, crc, true);
      local.view.setUint32(18, bytes.length, true);
      local.view.setUint32(22, bytes.length, true);
      local.view.setUint16(26, name.length, true);
      parts.push(local.bytes, name, bytes);
      const central = header(46);
      central.view.setUint32(0, 0x02014b50, true);
      central.view.setUint16(4, 20, true);
      central.view.setUint16(6, 20, true);
      central.view.setUint16(8, 0x800, true);
      central.view.setUint16(14, 33, true);
      central.view.setUint32(16, crc, true);
      central.view.setUint32(20, bytes.length, true);
      central.view.setUint32(24, bytes.length, true);
      central.view.setUint16(28, name.length, true);
      central.view.setUint32(42, offset, true);
      directory.push(central.bytes, name);
      offset += 30 + name.length + bytes.length;
    }
    const directorySize = directory.reduce((sum, bytes) => sum + bytes.length, 0);
    const end = header(22);
    end.view.setUint32(0, 0x06054b50, true);
    end.view.setUint16(8, files.size, true);
    end.view.setUint16(10, files.size, true);
    end.view.setUint32(12, directorySize, true);
    end.view.setUint32(16, offset, true);
    return new Blob([...parts, ...directory, end.bytes], {type:'application/zip'});
  }
  async function read(file) {
    if (file.size > 200 * 1024 * 1024) throw new Error('読み込みは200MB以内の更新ZIPを選んでください。');
    const bytes = new Uint8Array(await file.arrayBuffer());
    const view = new DataView(bytes.buffer);
    const files = new Map();
    let offset = 0;
    while (offset + 30 <= bytes.length && view.getUint32(offset, true) === 0x04034b50) {
      if (view.getUint16(offset + 8, true) !== 0 || (view.getUint16(offset + 6, true) & 8)) throw new Error('DIARY編集画面から書き出した更新ZIPを使用してください。');
      const size = view.getUint32(offset + 18, true);
      const nameLength = view.getUint16(offset + 26, true);
      const extraLength = view.getUint16(offset + 28, true);
      const path = decoder.decode(bytes.slice(offset + 30, offset + 30 + nameLength));
      const start = offset + 30 + nameLength + extraLength;
      if (start + size > bytes.length) throw new Error('ZIPファイルが途中で切れています。');
      const data = bytes.slice(start, start + size);
      if (crc32(data) !== view.getUint32(offset + 14, true)) throw new Error('ZIPの内容を読み取れませんでした。');
      if (files.has(path)) throw new Error('ZIP内のファイル名が重複しています。');
      files.set(path, new Blob([data]));
      offset = start + size;
    }
    if (!files.has('data/diary.js')) throw new Error('DIARYの更新データがありません。');
    return files;
  }
  window.DiaryZip = {write, read};
})();
