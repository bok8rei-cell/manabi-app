// アイコン(PNG)を生成するスクリプト。
// 実行: node scripts/generate-icons.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function makeCrcTable() {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
}
const CRC_TABLE = makeCrcTable();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function hexToRgb(hex) {
  const v = parseInt(hex.replace('#', ''), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function buildPng(size) {
  const bg = hexToRgb('#ff7043');
  const white = [255, 255, 255];
  const radius = Math.round(size * 96 / 512);

  // ページ(本のひらいたページ)の位置（512基準を size にスケール）
  const scale = size / 512;
  const pages = [
    { x0: 96 * scale, x1: 248 * scale, y0: 112 * scale, y1: 400 * scale },
    { x0: 264 * scale, x1: 416 * scale, y0: 112 * scale, y1: 400 * scale }
  ];

  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0; // フィルタなし
    for (let x = 0; x < size; x++) {
      let color = bg;

      // 角丸の外側は背景色のまま塗っておく（透過非対応のためそのまま）
      const inCornerCut = isOutsideRoundedRect(x, y, size, size, radius);
      if (!inCornerCut) {
        for (const p of pages) {
          if (x >= p.x0 && x < p.x1 && y >= p.y0 && y < p.y1) {
            color = white;
            break;
          }
        }
      }

      const offset = y * (size * 3 + 1) + 1 + x * 3;
      raw[offset] = color[0];
      raw[offset + 1] = color[1];
      raw[offset + 2] = color[2];
    }
  }

  const idat = zlib.deflateSync(raw, { level: 9 });

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// 角丸四角形の「外側」かどうか（角の部分のみ判定）
function isOutsideRoundedRect(x, y, w, h, r) {
  const corners = [
    { cx: r, cy: r },
    { cx: w - r, cy: r },
    { cx: r, cy: h - r },
    { cx: w - r, cy: h - r }
  ];
  for (const c of corners) {
    const inCornerBox =
      (x < r || x >= w - r) && (y < r || y >= h - r);
    if (inCornerBox) {
      const dx = x - c.cx;
      const dy = y - c.cy;
      // この角に対応するコーナーボックスのときだけ判定
      const isThisCorner =
        (x < r ? c.cx === r : c.cx === w - r) &&
        (y < r ? c.cy === r : c.cy === h - r);
      if (isThisCorner && dx * dx + dy * dy > r * r) {
        return true;
      }
    }
  }
  return false;
}

const outDir = path.join(__dirname, '..', 'icons');
fs.writeFileSync(path.join(outDir, 'icon-192.png'), buildPng(192));
fs.writeFileSync(path.join(outDir, 'icon-512.png'), buildPng(512));
console.log('icons generated');
