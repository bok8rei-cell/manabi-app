// ===== おしゃれ：コインで ポコの かざりを 買って、じぶんだけの ポコを つくる =====
// 買った かざり（own）と、いま つけている もの（wear：場所ごとに 1つ）を、子どもごとに 保存して どうきする。
// 王冠とマントは ポコクエストの ごほうび専用（ここでは 売らない）。

const SHOP_SLOTS = [
  { key: 'head',  label: 'あたま' },
  { key: 'eyes',  label: 'め' },
  { key: 'cheek', label: 'ほっぺ・くち' },
  { key: 'neck',  label: 'くび' },
  { key: 'body',  label: 'いろ' },
  { key: 'back',  label: 'はいけい' },
  { key: 'aura',  label: 'オーラ' }
];

const SHOP_TIERS = { s: 'ちいさい', n: 'ふつう', r: 'レア', sr: 'スーパーレア', ur: 'でんせつ' };

// ねだん：ちいさい 200〜300／ふつう 600〜800／レア 1500〜1800／スーパーレア 5000／でんせつ 20000（ぜんぶで 約51,550コイン）
const SHOP_ITEMS = [
  { id: 'ribbon',     name: 'リボン',             slot: 'head',  price: 200,  tier: 's' },
  { id: 'flower',     name: 'おはな',             slot: 'head',  price: 250,  tier: 's' },
  { id: 'partyhat',   name: 'パーティぼうし',     slot: 'head',  price: 300,  tier: 's' },
  { id: 'cheeks',     name: 'ほっぺの ハート',    slot: 'cheek', price: 200,  tier: 's' },
  { id: 'glasses',    name: 'まるめがね',         slot: 'eyes',  price: 250,  tier: 's' },
  { id: 'mustache',   name: 'ひげ',               slot: 'cheek', price: 300,  tier: 's' },
  { id: 'scarf',      name: 'スカーフ',           slot: 'neck',  price: 250,  tier: 's' },
  { id: 'bell',       name: 'すずの くびかざり',  slot: 'neck',  price: 300,  tier: 's' },
  { id: 'sunglasses', name: 'サングラス',         slot: 'eyes',  price: 700,  tier: 'n' },
  { id: 'cap',        name: 'やきゅうぼうし',     slot: 'head',  price: 600,  tier: 'n' },
  { id: 'headphones', name: 'ヘッドホン',         slot: 'head',  price: 800,  tier: 'n' },
  { id: 'witch',      name: 'まほうつかいの ぼうし', slot: 'head', price: 800, tier: 'n' },
  { id: 'pink',       name: 'ピンクの ポコ',      slot: 'body',  price: 700,  tier: 'n' },
  { id: 'orange',     name: 'オレンジの ポコ',    slot: 'body',  price: 700,  tier: 'n' },
  { id: 'purple',     name: 'むらさきの ポコ',    slot: 'body',  price: 700,  tier: 'n' },
  { id: 'helmet',     name: 'ぼうけんしゃの ヘルメット', slot: 'head', price: 1500, tier: 'r' },
  { id: 'flowers',    name: 'はなばたけの はいけい', slot: 'back', price: 1500, tier: 'r' },
  { id: 'stars',      name: 'ほしぞらの はいけい', slot: 'back',  price: 1800, tier: 'r' },
  { id: 'sea',        name: 'うみの はいけい',    slot: 'back',  price: 1800, tier: 'r' },
  { id: 'rainbow',    name: 'にじいろの ポコ',    slot: 'body',  price: 5000, tier: 'sr' },
  { id: 'legend',     name: 'でんせつの オーラ',  slot: 'aura',  price: 20000, tier: 'ur' },
  // --- ふやした かざり（あたま／め／くび）---
  { id: 'beret',      name: 'ベレーぼう',         slot: 'head',  price: 250,  tier: 's' },
  { id: 'catears',    name: 'ねこみみ',           slot: 'head',  price: 300,  tier: 's' },
  { id: 'bearears',   name: 'くまみみ',           slot: 'head',  price: 300,  tier: 's' },
  { id: 'bunny',      name: 'うさみみ',           slot: 'head',  price: 600,  tier: 'n' },
  { id: 'horns',      name: 'ドラゴンの つの',    slot: 'head',  price: 700,  tier: 'n' },
  { id: 'halo',       name: 'てんしの わ',        slot: 'head',  price: 1500, tier: 'r' },
  { id: 'swirl',      name: 'ぐるぐるめがね',     slot: 'eyes',  price: 250,  tier: 's' },
  { id: 'shadesround', name: 'まるサングラス',    slot: 'eyes',  price: 600,  tier: 'n' },
  { id: 'shadespink', name: 'ピンクの サングラス', slot: 'eyes', price: 700,  tier: 'n' },
  { id: 'goggle',     name: 'ゴーグル',           slot: 'eyes',  price: 800,  tier: 'n' },
  { id: 'shadesheart', name: 'ハートの サングラス', slot: 'eyes', price: 1500, tier: 'r' },
  { id: 'shadesstar', name: 'ほしの サングラス',  slot: 'eyes',  price: 1500, tier: 'r' },
  { id: 'teardrop',   name: 'ティアドロップ サングラス', slot: 'eyes', price: 1000, tier: 'r' },
  { id: 'starneck',   name: 'ほしの ネックレス',  slot: 'neck',  price: 300,  tier: 's' },
  { id: 'heartneck',  name: 'ハートの ペンダント', slot: 'neck', price: 300,  tier: 's' },
  { id: 'pearl',      name: 'しんじゅの ネックレス', slot: 'neck', price: 700, tier: 'n' },
  { id: 'medal',      name: 'きんメダル',         slot: 'neck',  price: 800,  tier: 'n' },
  { id: 'diamond',    name: 'ダイヤの ネックレス', slot: 'neck', price: 1800, tier: 'r' }
];

function shopItem(id) { return SHOP_ITEMS.find(it => it.id === id) || null; }

// ---- 保存 ----
function shopKey(name) { return `manabi_shop_${playerTag(name)}`; }

function loadShop(name) {
  const o = readJSON(shopKey(name), null) || {};
  const map = v => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
  return { own: map(o.own), wear: map(o.wear), fav: map(o.fav), t: o.t || 0 };
}

function saveShop(o, name) {
  o.t = Date.now();   // どうきで あたらしい方を えらぶため
  writeJSON(shopKey(name), o);
}

function shopOwns(id, name) { return !!loadShop(name).own[id]; }

// いま つけている かざり（場所 → id）。もっていない もの・ふるい idは ぬく
function shopLook(name) {
  const s = loadShop(name);
  const look = {};
  SHOP_SLOTS.forEach(sl => {
    const id = s.wear[sl.key];
    const it = id && shopItem(id);
    if (it && it.slot === sl.key && s.own[id]) look[sl.key] = id;
  });
  return look;
}

// 買う：'ok' | 'owned' | 'poor' | 'none'
function buyShopItem(id, name) {
  const it = shopItem(id);
  if (!it) return 'none';
  const s = loadShop(name);
  if (s.own[id]) return 'owned';
  if (!spendCoins(it.price, name)) return 'poor';
  s.own[id] = 1;
  s.wear[it.slot] = id;   // かったら すぐ つける
  saveShop(s, name);
  return 'ok';
}

function wearShopItem(id, name) {
  const it = shopItem(id);
  const s = loadShop(name);
  if (!it || !s.own[id]) return false;
  s.wear[it.slot] = id;
  saveShop(s, name);
  return true;
}

function takeOffAllShop(name) {
  const s = loadShop(name);
  s.wear = {};
  saveShop(s, name);
}

// 「いつもの」：いま つけている すがたを 1つだけ おぼえておく／それに きがえる
function saveShopFav(name) {
  const s = loadShop(name);
  s.fav = Object.assign({}, shopLook(name));
  saveShop(s, name);
}

function shopFavCount(name) {
  const s = loadShop(name);
  return Object.keys(s.fav).filter(k => s.own[s.fav[k]]).length;
}

function wearShopFav(name) {
  const s = loadShop(name);
  const wear = {};
  Object.keys(s.fav).forEach(k => { const it = shopItem(s.fav[k]); if (it && it.slot === k && s.own[it.id]) wear[k] = it.id; });
  s.wear = wear;
  saveShop(s, name);
}

function takeOffShopSlot(slot, name) {
  const s = loadShop(name);
  delete s.wear[slot];
  saveShop(s, name);
}

// ---- 絵 ----
const SHOP_BODY = {
  pink:    { main: '#FF9EB8', belly: '#FFE0E8' },
  orange:  { main: '#FFA94D', belly: '#FFE3BF' },
  purple:  { main: '#B197FC', belly: '#E5DBFF' },
  rainbow: {
    main: 'url(#pokoRainbow)', belly: '#FFF8E8',
    defs: '<defs><linearGradient id="pokoRainbow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF8A8A"/><stop offset="0.25" stop-color="#FFD66B"/><stop offset="0.5" stop-color="#8EE08E"/><stop offset="0.75" stop-color="#7CC8FF"/><stop offset="1" stop-color="#C79BFF"/></linearGradient></defs>'
  }
};

// 5かくの ほし（中心 cx,cy・はんけい r）
function shopStarPath(cx, cy, r) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const rad = (i % 2 === 0 ? r : r * 0.45);
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    d += (i === 0 ? 'M' : 'L') + (cx + rad * Math.cos(ang)).toFixed(2) + ' ' + (cy + rad * Math.sin(ang)).toFixed(2) + ' ';
  }
  return d + 'Z';
}

// くびの チェーン（左のつけね → 右のつけね。たるませた 線）と、まんなかの 位置
function shopChain(g, color, width) {
  const y = g.cy + g.ry;
  const x0 = 32 - g.rx + 5, x1 = 32 + g.rx - 5, y0 = y - 8, cyc = y - 1;
  return { svg: `<path d="M${x0} ${y0} Q32 ${cyc} ${x1} ${y0}" stroke="${color}" stroke-width="${width}" fill="none" stroke-linecap="round"/>`, midY: (y0 + cyc) / 2, x0, x1, y0, cyc };
}

function shopPearls(g) {
  const c = shopChain(g, 'none', 0);
  let out = '';
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const x = (1 - t) * (1 - t) * c.x0 + 2 * (1 - t) * t * 32 + t * t * c.x1;
    const y = (1 - t) * (1 - t) * c.y0 + 2 * (1 - t) * t * c.cyc + t * t * c.y0;
    out += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="2.2" fill="#FDF2F8" stroke="#D9B8C8" stroke-width="0.7"/>`;
  }
  return out;
}

function shopHeart(x, y) {
  return `<path transform="translate(${x} ${y}) scale(1.2)" d="M0 2.4 C-4 -0.6 -3.6 -4.2 0 -2.4 C3.6 -4.2 4 -0.6 0 2.4 Z" fill="#FF4D6D"/>`;
}

const SHOP_AURA_DEFS = '<defs><radialGradient id="pokoAura"><stop offset="0.4" stop-color="#FFE27A" stop-opacity="0.95"/><stop offset="1" stop-color="#FFB300" stop-opacity="0"/></radialGradient></defs>';

// g: { rx, ry, cy, eyeY, y0 }（ポコの 大きさ）
const SHOP_DRAW = {
  // --- オーラ（でんせつ） ---
  legend: () => {
    let rays = '';
    for (let a = 0; a < 360; a += 30) rays += `<path d="M32 31 L29.8 0 L34.2 0 Z" fill="#FFD95A" opacity="0.85" transform="rotate(${a} 32 31)"/>`;
    const star = (typeof perkStar === 'function') ? (perkStar(8, 12, 5) + perkStar(56, 14, 4.2) + perkStar(10, 50, 4) + perkStar(55, 49, 5)) : '';
    return rays + '<circle cx="32" cy="31" r="29" fill="url(#pokoAura)"/>' + star;
  },
  // --- はいけい ---
  stars: () => '<rect x="0" y="0" width="64" height="60" rx="10" fill="#312E81"/>' +
    '<circle cx="8" cy="8" r="1.2" fill="#fff"/><circle cx="20" cy="5" r="0.9" fill="#fff"/><circle cx="40" cy="6" r="1" fill="#fff"/>' +
    '<circle cx="58" cy="26" r="1" fill="#fff"/><circle cx="6" cy="32" r="1" fill="#fff"/><circle cx="12" cy="50" r="1.2" fill="#fff"/><circle cx="56" cy="50" r="1.1" fill="#fff"/>' +
    '<circle cx="52" cy="11" r="5" fill="#FDE68A"/><circle cx="54.5" cy="9.5" r="4.4" fill="#312E81"/>',
  flowers: () => '<rect x="0" y="0" width="64" height="60" rx="10" fill="#DFF3FF"/>' +
    '<path d="M0 46 Q16 40 32 45 T64 44 L64 60 L0 60 Z" fill="#86D08B"/>' +
    '<circle cx="8" cy="50" r="2" fill="#FF8FB1"/><circle cx="18" cy="53" r="1.8" fill="#FFD43B"/><circle cx="48" cy="52" r="2" fill="#FF8FB1"/><circle cx="57" cy="49" r="1.8" fill="#fff"/><circle cx="40" cy="55" r="1.6" fill="#FFD43B"/>' +
    '<circle cx="54" cy="9" r="5" fill="#FFE08A"/>',
  sea: () => '<rect x="0" y="0" width="64" height="60" rx="10" fill="#CFEFFF"/>' +
    '<path d="M0 44 Q8 40 16 44 T32 44 T48 44 T64 44 L64 60 L0 60 Z" fill="#7CC8F5"/>' +
    '<path d="M0 50 Q8 46 16 50 T32 50 T48 50 T64 50" stroke="#fff" stroke-width="1.2" fill="none" opacity="0.7"/>' +
    '<circle cx="52" cy="10" r="5" fill="#FFE08A"/>',
  // --- ふやした かざり ---
  beret: g => `<ellipse cx="${29}" cy="${g.y0 + 1}" rx="${g.rx - 5}" ry="6" fill="#B91C1C"/><circle cx="27" cy="${g.y0 - 5}" r="1.8" fill="#7F1D1D"/>`,
  catears: g => {
    const l = 32 - g.rx, r = 32 + g.rx;
    return `<path d="M${l + 5} ${g.y0 + 7} L${l + 4} ${g.y0 - 10} L${l + 17} ${g.y0 + 3} Z" fill="#FFF3E0" stroke="#E8D5A8" stroke-width="1"/>` +
      `<path d="M${l + 7} ${g.y0 + 3} L${l + 7} ${g.y0 - 5} L${l + 12} ${g.y0 + 1} Z" fill="#FFB3C6"/>` +
      `<path d="M${r - 5} ${g.y0 + 7} L${r - 4} ${g.y0 - 10} L${r - 17} ${g.y0 + 3} Z" fill="#FFF3E0" stroke="#E8D5A8" stroke-width="1"/>` +
      `<path d="M${r - 7} ${g.y0 + 3} L${r - 7} ${g.y0 - 5} L${r - 12} ${g.y0 + 1} Z" fill="#FFB3C6"/>`;
  },
  bearears: g => `<circle cx="${32 - g.rx * 0.62}" cy="${g.y0 + 3}" r="5.2" fill="#B7835A"/><circle cx="${32 - g.rx * 0.62}" cy="${g.y0 + 3.4}" r="2.6" fill="#E8C39E"/>` +
    `<circle cx="${32 + g.rx * 0.62}" cy="${g.y0 + 3}" r="5.2" fill="#B7835A"/><circle cx="${32 + g.rx * 0.62}" cy="${g.y0 + 3.4}" r="2.6" fill="#E8C39E"/>`,
  bunny: g => {
    const tall = Math.min(10, (g.y0 + 2) / 2 - 0.5);
    const cy = g.y0 + 2 - tall;
    const lx = 32 - g.rx * 0.45, rx = 32 + g.rx * 0.45;
    return `<ellipse cx="${lx}" cy="${cy}" rx="3.6" ry="${tall}" fill="#FFFFFF" stroke="#E8D5A8" stroke-width="1" transform="rotate(-10 ${lx} ${cy + tall})"/>` +
      `<ellipse cx="${lx}" cy="${cy + 1}" rx="1.8" ry="${tall * 0.6}" fill="#FFB3C6" transform="rotate(-10 ${lx} ${cy + tall})"/>` +
      `<ellipse cx="${rx}" cy="${cy}" rx="3.6" ry="${tall}" fill="#FFFFFF" stroke="#E8D5A8" stroke-width="1" transform="rotate(10 ${rx} ${cy + tall})"/>` +
      `<ellipse cx="${rx}" cy="${cy + 1}" rx="1.8" ry="${tall * 0.6}" fill="#FFB3C6" transform="rotate(10 ${rx} ${cy + tall})"/>`;
  },
  horns: g => {
    const lx = 32 - g.rx * 0.45, rx = 32 + g.rx * 0.45;
    return `<path d="M${lx - 3} ${g.y0 + 6} Q${lx - 4.5} ${g.y0 - 5} ${lx + 1} ${g.y0 - 9} Q${lx + 2.5} ${g.y0 - 1} ${lx + 3} ${g.y0 + 6} Z" fill="#F97316" stroke="#C2410C" stroke-width="0.8"/>` +
      `<path d="M${rx + 3} ${g.y0 + 6} Q${rx + 4.5} ${g.y0 - 5} ${rx - 1} ${g.y0 - 9} Q${rx - 2.5} ${g.y0 - 1} ${rx - 3} ${g.y0 + 6} Z" fill="#F97316" stroke="#C2410C" stroke-width="0.8"/>`;
  },
  halo: g => `<ellipse cx="32" cy="${Math.max(4, g.y0 - 5)}" rx="11" ry="3" fill="none" stroke="#FDE68A" stroke-width="4" opacity="0.6"/>` +
    `<ellipse cx="32" cy="${Math.max(4, g.y0 - 5)}" rx="11" ry="3" fill="none" stroke="#FBBF24" stroke-width="2"/>`,
  // --- ふやした かざり（め）---
  swirl: g => `<g fill="rgba(255,255,255,0.3)" stroke="#3B2F2A" stroke-width="1.4"><circle cx="23" cy="${g.eyeY}" r="6.6"/><circle cx="41" cy="${g.eyeY}" r="6.6"/></g>` +
    `<g fill="none" stroke="#3B2F2A" stroke-width="1.1"><circle cx="23" cy="${g.eyeY}" r="3.6"/><circle cx="41" cy="${g.eyeY}" r="3.6"/><circle cx="23" cy="${g.eyeY}" r="1.2"/><circle cx="41" cy="${g.eyeY}" r="1.2"/></g>` +
    `<path d="M29.6 ${g.eyeY} L34.4 ${g.eyeY}" stroke="#3B2F2A" stroke-width="1.4"/>`,
  shadesround: g => `<circle cx="23" cy="${g.eyeY}" r="6.6" fill="#111827"/><circle cx="41" cy="${g.eyeY}" r="6.6" fill="#111827"/>` +
    `<path d="M29.6 ${g.eyeY - 1} L34.4 ${g.eyeY - 1}" stroke="#111827" stroke-width="1.8"/>` +
    `<circle cx="20.6" cy="${g.eyeY - 2.4}" r="1.5" fill="#fff" opacity="0.7"/><circle cx="38.6" cy="${g.eyeY - 2.4}" r="1.5" fill="#fff" opacity="0.7"/>`,
  shadespink: g => `<rect x="16" y="${g.eyeY - 5.5}" width="14" height="10.5" rx="5" fill="#F472B6" fill-opacity="0.82" stroke="#DB2777" stroke-width="1.4"/>` +
    `<rect x="34" y="${g.eyeY - 5.5}" width="14" height="10.5" rx="5" fill="#F472B6" fill-opacity="0.82" stroke="#DB2777" stroke-width="1.4"/>` +
    `<path d="M30 ${g.eyeY - 1} L34 ${g.eyeY - 1}" stroke="#DB2777" stroke-width="1.6"/>` +
    `<path d="M19.5 ${g.eyeY - 2.5} L22.5 ${g.eyeY - 2.5}" stroke="#fff" stroke-width="1.2" opacity="0.8" stroke-linecap="round"/><path d="M37.5 ${g.eyeY - 2.5} L40.5 ${g.eyeY - 2.5}" stroke="#fff" stroke-width="1.2" opacity="0.8" stroke-linecap="round"/>`,
  goggle: g => `<path d="M14 ${g.eyeY} L50 ${g.eyeY}" stroke="#F97316" stroke-width="4.4" stroke-linecap="round"/>` +
    `<circle cx="23" cy="${g.eyeY}" r="6.8" fill="#7DD3FC" fill-opacity="0.6" stroke="#EA580C" stroke-width="2.2"/><circle cx="41" cy="${g.eyeY}" r="6.8" fill="#7DD3FC" fill-opacity="0.6" stroke="#EA580C" stroke-width="2.2"/>` +
    `<path d="M19.5 ${g.eyeY - 3} Q21 ${g.eyeY - 4.5} 23 ${g.eyeY - 4.2}" stroke="#fff" stroke-width="1.2" fill="none" opacity="0.8" stroke-linecap="round"/>`,
  shadesheart: g => `<path transform="translate(23 ${g.eyeY + 0.4}) scale(2)" d="M0 2.4 C-4 -0.6 -3.6 -4.2 0 -2.4 C3.6 -4.2 4 -0.6 0 2.4 Z" fill="#DC2626" stroke="#7F1D1D" stroke-width="0.5"/>` +
    `<path transform="translate(41 ${g.eyeY + 0.4}) scale(2)" d="M0 2.4 C-4 -0.6 -3.6 -4.2 0 -2.4 C3.6 -4.2 4 -0.6 0 2.4 Z" fill="#DC2626" stroke="#7F1D1D" stroke-width="0.5"/>` +
    `<path d="M29.5 ${g.eyeY - 2} L34.5 ${g.eyeY - 2}" stroke="#7F1D1D" stroke-width="1.6"/>` +
    `<circle cx="19.5" cy="${g.eyeY - 2}" r="1.2" fill="#fff" opacity="0.8"/><circle cx="37.5" cy="${g.eyeY - 2}" r="1.2" fill="#fff" opacity="0.8"/>`,
  // ティアドロップ（しずくがた）：うえが ひろく したに すぼむ レンズ、金の フチ、二重の はな あて
  teardrop: g => {
    const y = g.eyeY;
    const lens = (flip) => {
      const X = v => (flip ? 64 - v : v);   // 右がわは 左がわを 左右はんてん
      return `<path d="M${X(15.5)} ${y - 5.5} Q${X(23)} ${y - 9} ${X(30.5)} ${y - 5.5} Q${X(30.5)} ${y + 6.5} ${X(24.5)} ${y + 8.5} Q${X(16.5)} ${y + 6.5} ${X(15.5)} ${y - 5.5} Z" fill="#1F2D2A" stroke="#D4A72C" stroke-width="1.5" stroke-linejoin="round"/>` +
        `<path d="M${X(18.5)} ${y - 4} Q${X(21)} ${y - 5.8} ${X(24)} ${y - 5.5}" stroke="#fff" stroke-width="1.3" fill="none" opacity="0.75" stroke-linecap="round"/>`;
    };
    return lens(false) + lens(true) +
      `<path d="M30.5 ${y - 5} Q32 ${y - 7} 33.5 ${y - 5}" stroke="#D4A72C" stroke-width="1.4" fill="none"/><path d="M30.5 ${y - 2.5} Q32 ${y - 4.2} 33.5 ${y - 2.5}" stroke="#D4A72C" stroke-width="1.2" fill="none"/>`;
  },
  shadesstar: g => `<path d="${shopStarPath(23, g.eyeY + 0.3, 8.2)}" fill="#FBBF24" stroke="#B45309" stroke-width="1"/>` +
    `<path d="${shopStarPath(41, g.eyeY + 0.3, 8.2)}" fill="#FBBF24" stroke="#B45309" stroke-width="1"/>` +
    `<path d="M29.8 ${g.eyeY - 1} L34.2 ${g.eyeY - 1}" stroke="#B45309" stroke-width="1.6"/>`,
  // --- ふやした かざり（くび）---
  starneck: g => { const c = shopChain(g, '#8FA1B8', 1.9); return c.svg + `<path d="${shopStarPath(32, c.midY + 2.2, 3.6)}" fill="#FBBF24" stroke="#B45309" stroke-width="0.7"/>`; },
  heartneck: g => { const c = shopChain(g, '#8FA1B8', 1.9); return c.svg + `<path transform="translate(32 ${c.midY + 2.2}) scale(1.1)" d="M0 2.4 C-4 -0.6 -3.6 -4.2 0 -2.4 C3.6 -4.2 4 -0.6 0 2.4 Z" fill="#EF4444" stroke="#991B1B" stroke-width="0.6"/>`; },
  pearl: g => { const c = shopChain(g, 'none', 0); return shopPearls(g) + `<circle cx="32" cy="${c.midY + 3.2}" r="2.6" fill="#FDF2F8" stroke="#E5C8D6" stroke-width="0.7"/>`; },
  medal: g => { const c = shopChain(g, 'none', 0); return `<path d="M${c.x0 + 3} ${c.y0 - 0.5} L32 ${c.midY + 1.5} L${c.x1 - 3} ${c.y0 - 0.5}" stroke="#3B82F6" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<circle cx="32" cy="${c.midY + 4}" r="4.3" fill="#FBBF24" stroke="#B45309" stroke-width="0.9"/><path d="${shopStarPath(32, c.midY + 4, 2.4)}" fill="#fff" opacity="0.85"/>`; },
  diamond: g => { const c = shopChain(g, '#9CA3AF', 1.9); const y = c.midY + 1.5; return c.svg +
    `<path d="M32 ${y} L36 ${y + 3} L32 ${y + 8} L28 ${y + 3} Z" fill="#67E8F9" stroke="#0891B2" stroke-width="0.8"/><path d="M28 ${y + 3} L36 ${y + 3}" stroke="#fff" stroke-width="0.7" opacity="0.8"/>` +
    `<path d="M39 ${y - 1} L40 ${y + 1} L42 ${y + 2} L40 ${y + 3} L39 ${y + 5} L38 ${y + 3} L36 ${y + 2} L38 ${y + 1} Z" fill="#fff" opacity="0.9"/>`; },
  // --- あたま ---
  ribbon: g => `<g transform="translate(${32 + g.rx * 0.5} ${g.y0 + 4})"><path d="M0 0 L-8 -5 L-8 5 Z" fill="#FF6F91"/><path d="M0 0 L8 -5 L8 5 Z" fill="#FF6F91"/><circle r="2.6" fill="#E0446C"/></g>`,
  flower: g => `<g transform="translate(${32 - g.rx * 0.5} ${g.y0 + 4})">` +
    '<circle cx="0" cy="-3.4" r="2.4" fill="#FFB3C6"/><circle cx="3.2" cy="-1" r="2.4" fill="#FFB3C6"/><circle cx="2" cy="2.8" r="2.4" fill="#FFB3C6"/><circle cx="-2" cy="2.8" r="2.4" fill="#FFB3C6"/><circle cx="-3.2" cy="-1" r="2.4" fill="#FFB3C6"/>' +
    '<circle r="2" fill="#FFD43B"/></g>',
  partyhat: g => {
    const b = g.y0 + 3, top = Math.max(3, g.y0 - 13);
    return `<path d="M23 ${b} L41 ${b} L32 ${top} Z" fill="#A78BFA" stroke="#7C5CE0" stroke-width="1"/>` +
      `<path d="M26 ${b - 4} L38 ${b - 4}" stroke="#FDE68A" stroke-width="1.6"/><path d="M28.5 ${b - 8} L35.5 ${b - 8}" stroke="#FDE68A" stroke-width="1.6"/>` +
      `<circle cx="32" cy="${top}" r="2.3" fill="#FFD43B"/>`;
  },
  cap: g => {
    const base = Math.min(g.y0 + 7, g.cy - 10);
    return `<path d="M${32 - g.rx + 4} ${base} Q${32 - g.rx + 4} ${g.y0 - 6} 32 ${g.y0 - 6} Q${32 + g.rx - 4} ${g.y0 - 6} ${32 + g.rx - 4} ${base} Z" fill="#3B82F6"/>` +
      `<ellipse cx="${32 + g.rx * 0.45}" cy="${base}" rx="11" ry="2.8" fill="#2563EB"/>` +
      `<circle cx="32" cy="${g.y0 - 5}" r="1.6" fill="#fff"/>`;
  },
  headphones: g => `<path d="M${32 - g.rx + 1} ${g.cy - 1} Q${32 - g.rx - 1} ${g.y0 - 5} 32 ${g.y0 - 5} Q${32 + g.rx + 1} ${g.y0 - 5} ${32 + g.rx - 1} ${g.cy - 1}" stroke="#4B5563" stroke-width="2.4" fill="none" stroke-linecap="round"/>` +
    `<rect x="${32 - g.rx - 3}" y="${g.cy - 6}" width="6" height="11" rx="3" fill="#EF4444"/><rect x="${32 + g.rx - 3}" y="${g.cy - 6}" width="6" height="11" rx="3" fill="#EF4444"/>`,
  witch: g => {
    const top = Math.max(2, g.y0 - 17);
    return `<ellipse cx="32" cy="${g.y0 + 4}" rx="${g.rx + 1}" ry="3.5" fill="#5B21B6"/>` +
      `<path d="M24 ${g.y0 + 4} L32 ${top} L40 ${g.y0 + 4} Z" fill="#7C3AED"/>` +
      `<rect x="26" y="${g.y0 - 0.5}" width="12" height="3" fill="#FBBF24"/>`;
  },
  helmet: g => {
    const base = g.cy - 10;
    return `<path d="M${32 - g.rx + 1} ${base} Q${32 - g.rx + 1} ${g.y0 - 6} 32 ${g.y0 - 6} Q${32 + g.rx - 1} ${g.y0 - 6} ${32 + g.rx - 1} ${base} Z" fill="#9CA3AF" stroke="#6B7280" stroke-width="1"/>` +
      `<path d="M32 ${g.y0 - 6} L32 ${base}" stroke="#F5B21B" stroke-width="3"/>` +
      `<circle cx="32" cy="${g.y0 - 1}" r="2" fill="#E5484D"/>`;
  },
  // --- め ---
  glasses: g => '<g fill="rgba(255,255,255,0.18)" stroke="#3B2F2A" stroke-width="1.6">' +
    `<circle cx="23" cy="${g.eyeY}" r="6.6"/><circle cx="41" cy="${g.eyeY}" r="6.6"/></g>` +
    `<path d="M29.6 ${g.eyeY} L34.4 ${g.eyeY}" stroke="#3B2F2A" stroke-width="1.6"/>`,
  sunglasses: g => `<rect x="16" y="${g.eyeY - 5}" width="14" height="9.5" rx="4" fill="#1F2937"/><rect x="34" y="${g.eyeY - 5}" width="14" height="9.5" rx="4" fill="#1F2937"/>` +
    `<path d="M30 ${g.eyeY - 1} L34 ${g.eyeY - 1}" stroke="#1F2937" stroke-width="1.8"/>` +
    `<path d="M19 ${g.eyeY - 2.5} L22 ${g.eyeY - 2.5}" stroke="#fff" stroke-width="1.2" opacity="0.7" stroke-linecap="round"/><path d="M37 ${g.eyeY - 2.5} L40 ${g.eyeY - 2.5}" stroke="#fff" stroke-width="1.2" opacity="0.7" stroke-linecap="round"/>`,
  // --- ほっぺ・くち ---
  cheeks: g => shopHeart(32 - g.rx + 8, g.cy + 3) + shopHeart(32 + g.rx - 8, g.cy + 3),
  mustache: g => `<path d="M32 ${g.cy + 2} C28 ${g.cy - 1} 22 ${g.cy + 1} 22 ${g.cy + 4} C26 ${g.cy + 3} 30 ${g.cy + 4} 32 ${g.cy + 2.5} C34 ${g.cy + 4} 38 ${g.cy + 3} 42 ${g.cy + 4} C42 ${g.cy + 1} 36 ${g.cy - 1} 32 ${g.cy + 2} Z" fill="#5B3A29"/>`,
  // --- くび ---
  scarf: g => {
    const y = g.cy + g.ry;
    return `<path d="M${32 - g.rx + 4} ${y - 8} Q32 ${y - 1} ${32 + g.rx - 4} ${y - 8} L${32 + g.rx - 5} ${y - 3} Q32 ${y + 3} ${32 - g.rx + 5} ${y - 3} Z" fill="#F59E0B"/>` +
      `<path d="M${32 + g.rx - 10} ${y - 4} L${32 + g.rx - 6} ${y + 2} L${32 + g.rx - 12} ${y + 1} Z" fill="#D97706"/>`;
  },
  bell: g => {
    const y = g.cy + g.ry;
    return `<path d="M${32 - g.rx + 5} ${y - 8} Q32 ${y - 1} ${32 + g.rx - 5} ${y - 8}" stroke="#E5484D" stroke-width="2.6" fill="none" stroke-linecap="round"/>` +
      `<circle cx="32" cy="${y - 3.4}" r="3" fill="#FBBF24" stroke="#B45309" stroke-width="0.8"/><path d="M32 ${y - 2.6} L32 ${y - 1}" stroke="#B45309" stroke-width="0.9"/>`;
  }
};

// look（場所 → id）から、ポコの 各ぶぶんの 絵を つくる
function shopDraw(look, g) {
  const out = { back: '', aura: '', defs: '', main: '#5CC9B0', belly: '#B8EBDD', eyes: '', cheek: '', neck: '', head: '' };
  if (!look) return out;
  const draw = (slot) => (look[slot] && SHOP_DRAW[look[slot]]) ? SHOP_DRAW[look[slot]](g) : '';
  out.back = draw('back');
  out.aura = draw('aura');
  if (look.aura) out.defs += SHOP_AURA_DEFS;
  out.eyes = draw('eyes');
  out.cheek = draw('cheek');
  out.neck = draw('neck');
  out.head = draw('head');
  const body = look.body && SHOP_BODY[look.body];
  if (body) { out.main = body.main; out.belly = body.belly; out.defs += body.defs || ''; }
  return out;
}

// ---- おしゃれの がめん：「きがえ」と「おみせ」 ----
let shopMode = null;   // 'dress'（きがえ）| 'store'（おみせ）

function shopOwnedCount() { return Object.keys(loadShop().own).filter(id => shopItem(id)).length; }

// ポコを おおきく 見る（ホームと おなじ すがた）
function showPetBig() {
  const old = byId('petbig');
  if (old) old.remove();
  const pet = loadPet();
  const size = Math.min(340, Math.max(220, window.innerWidth - 40));
  const ov = el('div', 'petbig');
  ov.id = 'petbig';
  const pic = el('div', 'petbig-pic');
  pic.innerHTML = petSVG(petStage(pet.growth), 'cheer', size);
  ov.appendChild(pic);
  ov.appendChild(el('div', 'petbig-name', PET_STAGES[petStage(pet.growth)].name));
  ov.appendChild(el('div', 'petbig-hint', 'どこかを タップすると もどるよ'));
  ov.addEventListener('click', () => ov.remove());
  document.body.appendChild(ov);
}

function renderShop() {
  const root = byId('shop-content');
  root.innerHTML = '';
  const pet = loadPet();
  const realStage = petStage(pet.growth);
  const stage = Math.max(1, realStage);   // 見本は ポコの すがた（たまごの子にも 見せる）
  const shop = loadShop();
  const have = petBalance(pet);
  const owned = shopOwnedCount();
  if (shopMode === null) shopMode = owned > 0 ? 'dress' : 'store';
  const mode = shopMode;

  // きりかえ
  const sw = el('div', 'shop-switch');
  [['dress', `👗 きがえ（${owned}こ）`], ['store', '🛍️ おみせ']].forEach(([key, label]) => {
    const b = el('button', 'shop-switch-btn' + (mode === key ? ' active' : ''), label);
    b.addEventListener('click', () => { shopMode = key; renderShop(); });
    sw.appendChild(b);
  });
  root.appendChild(sw);

  // ポコ（タップで おおきく）
  const hero = el('div', 'shop-hero');
  const pic = el('button', 'shop-pet');
  pic.setAttribute('aria-label', 'ポコを おおきく 見る');
  pic.innerHTML = petSVG(realStage, 'cheer', mode === 'dress' ? 170 : 120);
  pic.addEventListener('click', showPetBig);
  hero.appendChild(pic);
  hero.appendChild(el('div', 'shop-zoom', '🔍 タップで おおきく'));
  hero.appendChild(el('div', 'zukan-coin', `💰 ${have} コイン`));
  if (realStage === 0) hero.appendChild(el('div', 'pet-note', 'ポコに うまれたら、かった かざりが つけられるよ'));
  root.appendChild(hero);

  if (mode === 'dress') renderDressRoom(root, shop, stage);
  else renderStore(root, shop, stage, have);
}

// きがえ：もっている かざりだけ。つけたり はずしたり
function renderDressRoom(root, shop, stage) {
  const worn = Object.keys(shopLook()).length;
  const tools = el('div', 'shop-tools');
  const favN = shopFavCount();
  const bFav = el('button', 'sub-btn', '⭐ いつもの に きがえる');
  bFav.disabled = favN === 0;
  bFav.addEventListener('click', () => { wearShopFav(); showToast('「いつもの」に きがえたよ！'); renderShop(); });
  const bSave = el('button', 'sub-btn', '💾 いまの すがたを「いつもの」に する');
  bSave.disabled = worn === 0;
  bSave.addEventListener('click', () => {
    askConfirm(favN > 0 ? '「いつもの」を いまの すがたに かえる？' : '「いつもの」に おぼえておく？', 'おぼえる', 'やめる', () => { saveShopFav(); showToast('「いつもの」に おぼえたよ！'); renderShop(); }, { cancelFirst: true });
  });
  const bOff = el('button', 'sub-btn', 'ぜんぶ はずす');
  bOff.disabled = worn === 0;
  bOff.addEventListener('click', () => { takeOffAllShop(); renderShop(); });
  [bFav, bSave, bOff].forEach(b => tools.appendChild(b));
  root.appendChild(tools);

  let any = false;
  SHOP_SLOTS.forEach(sl => {
    const items = SHOP_ITEMS.filter(it => it.slot === sl.key && shop.own[it.id]);
    if (items.length === 0) return;
    any = true;
    root.appendChild(el('h3', 'section-title', sl.label));
    const grid = el('div', 'shop-grid');
    items.forEach(it => {
      const isWorn = shop.wear[it.slot] === it.id;
      const card = el('div', 'shop-card owned' + (isWorn ? ' worn' : ''));
      const preview = el('div', 'shop-card-pic');
      preview.innerHTML = petSVG(stage, 'happy', 64, null, { [it.slot]: it.id });
      card.appendChild(preview);
      card.appendChild(el('div', 'shop-card-name', it.name));
      let btn;
      if (isWorn) {
        btn = el('button', 'sub-btn shop-btn', 'はずす');
        btn.addEventListener('click', () => { takeOffShopSlot(it.slot); renderShop(); });
      } else {
        btn = el('button', 'main-btn shop-btn', 'つける');
        btn.addEventListener('click', () => { wearShopItem(it.id); renderShop(); });
      }
      card.appendChild(btn);
      grid.appendChild(card);
    });
    root.appendChild(grid);
  });

  if (!any) {
    const empty = el('div', 'panel');
    empty.appendChild(el('div', 'report-empty', 'まだ かざりが ないよ。「おみせ」で コインで かってみよう！'));
    const go = el('button', 'main-btn wide', '🛍️ おみせへ');
    go.addEventListener('click', () => { shopMode = 'store'; renderShop(); });
    empty.appendChild(go);
    root.appendChild(empty);
  }
}

// おみせ：まだ もっていない かざり。かうと「きがえ」に はいる
function renderStore(root, shop, stage, have) {
  let any = false;
  SHOP_SLOTS.forEach(sl => {
    const items = SHOP_ITEMS.filter(it => it.slot === sl.key && !shop.own[it.id]);
    if (items.length === 0) return;
    any = true;
    root.appendChild(el('h3', 'section-title', sl.label));
    const grid = el('div', 'shop-grid');
    items.forEach(it => {
      const card = el('div', 'shop-card');
      const preview = el('div', 'shop-card-pic');
      preview.innerHTML = petSVG(stage, 'happy', 64, null, { [it.slot]: it.id });
      card.appendChild(preview);
      card.appendChild(el('div', 'shop-card-name', it.name));
      card.appendChild(el('div', 'shop-card-tier tier-' + it.tier, SHOP_TIERS[it.tier]));
      const btn = el('button', have >= it.price ? 'main-btn shop-btn' : 'sub-btn shop-btn', `💰 ${it.price}`);
      btn.addEventListener('click', () => {
        const now = petBalance(loadPet());
        if (now < it.price) { showToast(`コインが たりないよ（あと ${it.price - now}コイン）`); return; }
        askConfirm(`「${it.name}」を かう？\n（${it.price}コイン つかいます）\nいま ${now}コイン`, 'かう', 'やめる', () => {
          const r = buyShopItem(it.id);
          if (r === 'ok') { FX.correct(); showToast(`「${it.name}」を かったよ！ つけたよ。「きがえ」で かえられるよ`); }
          else if (r === 'poor') showToast('コインが たりないよ');
          renderShop();
        }, { cancelFirst: true });
      });
      card.appendChild(btn);
      grid.appendChild(card);
    });
    root.appendChild(grid);
  });
  if (!any) root.appendChild(el('div', 'panel', '🎉 ぜんぶ かったよ！ すごい！「きがえ」で たのしんでね'));
}
