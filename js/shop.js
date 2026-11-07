// ===== おしゃれ：コインで ポコの かざりを 買って、じぶんだけの ポコを つくる =====
// 買った かざり（own）と、いま つけている もの（wear：場所ごとに 1つ）を、子どもごとに 保存して どうきする。
// 王冠とマントは ポコクエストの ごほうび専用（ここでは 売らない）。

const SHOP_SLOTS = [
  { key: 'head',  label: 'あたま' },
  { key: 'eyes',  label: 'め' },
  { key: 'cheek', label: 'ほっぺ・くち' },
  { key: 'neck',  label: 'くび' },
  { key: 'body',  label: 'いろ' },
  { key: 'back',  label: 'はいけい' }
];

const SHOP_TIERS = { s: 'ちいさい', n: 'ふつう', r: 'レア', sr: 'スーパーレア' };

// ねだんは ぜんぶで 約18,650コイン。ちいさい 200〜300／ふつう 600〜800／レア 1500〜1800／スーパーレア 5000
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
  { id: 'rainbow',    name: 'にじいろの ポコ',    slot: 'body',  price: 5000, tier: 'sr' }
];

function shopItem(id) { return SHOP_ITEMS.find(it => it.id === id) || null; }

// ---- 保存 ----
function shopKey(name) { return `manabi_shop_${playerTag(name)}`; }

function loadShop(name) {
  const o = readJSON(shopKey(name), null) || {};
  const map = v => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
  return { own: map(o.own), wear: map(o.wear), t: o.t || 0 };
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

function shopHeart(x, y) {
  return `<path transform="translate(${x} ${y}) scale(1.2)" d="M0 2.4 C-4 -0.6 -3.6 -4.2 0 -2.4 C3.6 -4.2 4 -0.6 0 2.4 Z" fill="#FF4D6D"/>`;
}

// g: { rx, ry, cy, eyeY, y0 }（ポコの 大きさ）
const SHOP_DRAW = {
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
  const out = { back: '', defs: '', main: '#5CC9B0', belly: '#B8EBDD', eyes: '', cheek: '', neck: '', head: '' };
  if (!look) return out;
  const draw = (slot) => (look[slot] && SHOP_DRAW[look[slot]]) ? SHOP_DRAW[look[slot]](g) : '';
  out.back = draw('back');
  out.eyes = draw('eyes');
  out.cheek = draw('cheek');
  out.neck = draw('neck');
  out.head = draw('head');
  const body = look.body && SHOP_BODY[look.body];
  if (body) { out.main = body.main; out.belly = body.belly; out.defs = body.defs || ''; }
  return out;
}

// ---- おみせの がめん ----
function renderShop() {
  const root = byId('shop-content');
  root.innerHTML = '';
  const pet = loadPet();
  const realStage = petStage(pet.growth);
  const stage = Math.max(1, realStage);   // 見本は ポコの すがた（たまごの子にも 見せる）
  const shop = loadShop();
  const have = petBalance(pet);

  const hero = el('div', 'shop-hero');
  const pic = el('div', 'shop-pet');
  pic.innerHTML = petSVG(realStage, 'cheer', 120, weeklyPerkStatic());
  hero.appendChild(pic);
  hero.appendChild(el('div', 'zukan-coin', `💰 ${have} コイン`));
  hero.appendChild(el('div', 'pet-note', realStage === 0
    ? 'ポコに うまれたら、かった かざりが つけられるよ'
    : 'すきな かざりを かって、じぶんだけの ポコを つくろう！'));
  root.appendChild(hero);

  SHOP_SLOTS.forEach(sl => {
    const items = SHOP_ITEMS.filter(it => it.slot === sl.key);
    root.appendChild(el('h3', 'section-title', sl.label));
    const grid = el('div', 'shop-grid');
    items.forEach(it => {
      const owned = !!shop.own[it.id];
      const worn = shop.wear[it.slot] === it.id && owned;
      const card = el('div', 'shop-card' + (worn ? ' worn' : '') + (owned ? ' owned' : ''));
      const preview = el('div', 'shop-card-pic');
      preview.innerHTML = petSVG(stage, 'happy', 64, null, { [it.slot]: it.id });
      card.appendChild(preview);
      card.appendChild(el('div', 'shop-card-name', it.name));
      card.appendChild(el('div', 'shop-card-tier tier-' + it.tier, SHOP_TIERS[it.tier]));
      let btn;
      if (!owned) {
        btn = el('button', have >= it.price ? 'main-btn shop-btn' : 'sub-btn shop-btn', `💰 ${it.price}`);
        btn.addEventListener('click', () => {
          const now = petBalance(loadPet());
          if (now < it.price) { showToast(`コインが たりないよ（あと ${it.price - now}コイン）`); return; }
          askConfirm(`「${it.name}」を かう？\n（${it.price}コイン つかいます）\nいま ${now}コイン`, 'かう', 'やめる', () => {
            const r = buyShopItem(it.id);
            if (r === 'ok') { FX.correct(); showToast(`「${it.name}」を かったよ！ つけてみてね`); }
            else if (r === 'poor') showToast('コインが たりないよ');
            renderShop();
          }, { cancelFirst: true });
        });
      } else if (worn) {
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
}
