// ===== ポコの へや =====
// コインで かべがみ・ゆか・まど・かざり・かぐ・すみの もの・おもちゃを 買って、ポコの へやを かざる。
// 場所（スロット）は 7つで、1つの 場所に 1こ おける。買った もの・おいた ものは おしゃれと おなじ `manabi_shop_{なまえ}` に のこす（own / wear）。
// へやの 絵は 160×110。かべ 0〜72／ゆか 72〜110。ポコは まんなか（x=53〜107, したが y≈92）に たつ。

const ROOM_SLOTS = [
  { key: 'wall',   label: 'かべがみ',   def: 'wall_cream' },
  { key: 'floor',  label: 'ゆか',       def: 'floor_wood' },
  { key: 'window', label: 'まど',       def: null },
  { key: 'poster', label: 'かべの かざり', def: null },
  { key: 'furn',   label: 'かぐ',       def: null },
  { key: 'corner', label: 'すみの もの', def: null },
  { key: 'toy',    label: 'おもちゃ',   def: null }
];

function isRoomSlot(key) { return ROOM_SLOTS.some(s => s.key === key); }

// ねだん：ちいさい 100〜300／ふつう 400〜800／レア 900〜1800／スーパーレア 2000〜
const ROOM_ITEMS = [
  // かべがみ
  { id: 'wall_cream',  name: 'クリームの かべ',   slot: 'wall',   price: 0,    tier: 's' },
  { id: 'wall_pink',   name: 'ピンクの かべ',     slot: 'wall',   price: 300,  tier: 's' },
  { id: 'wall_blue',   name: 'みずいろの かべ',   slot: 'wall',   price: 300,  tier: 's' },
  { id: 'wall_stripe', name: 'ストライプの かべ', slot: 'wall',   price: 500,  tier: 'n' },
  { id: 'wall_wood',   name: 'もくめの かべ',     slot: 'wall',   price: 700,  tier: 'n' },
  { id: 'wall_star',   name: 'ほしぞらの かべ',   slot: 'wall',   price: 900,  tier: 'r' },
  { id: 'wall_sea',    name: 'うみの かべ',       slot: 'wall',   price: 1500, tier: 'r' },
  { id: 'wall_space',  name: 'うちゅうの かべ',   slot: 'wall',   price: 2000, tier: 'sr' },
  // ゆか
  { id: 'floor_wood',  name: 'フローリング',     slot: 'floor',  price: 0,    tier: 's' },
  { id: 'floor_carpet', name: 'あかい カーペット', slot: 'floor', price: 300,  tier: 's' },
  { id: 'floor_tile',  name: 'チェックの ゆか',   slot: 'floor',  price: 400,  tier: 'n' },
  { id: 'floor_grass', name: 'しばふの ゆか',     slot: 'floor',  price: 600,  tier: 'n' },
  { id: 'floor_cloud', name: 'くもの ゆか',       slot: 'floor',  price: 1500, tier: 'r' },
  // まど
  { id: 'window_day',   name: 'あおぞらの まど',   slot: 'window', price: 300,  tier: 's' },
  { id: 'window_night', name: 'よぞらの まど',     slot: 'window', price: 400,  tier: 'n' },
  { id: 'window_round', name: 'まるい まど',       slot: 'window', price: 600,  tier: 'n' },
  { id: 'window_curtain', name: 'カーテンの まど', slot: 'window', price: 800,  tier: 'n' },
  // かべの かざり
  { id: 'poster_frame', name: 'ハートの え',       slot: 'poster', price: 250,  tier: 's' },
  { id: 'poster_clock', name: 'かべどけい',       slot: 'poster', price: 300,  tier: 's' },
  { id: 'poster_flags', name: 'はたの かざり',     slot: 'poster', price: 400,  tier: 'n' },
  { id: 'poster_star',  name: 'ほしの ポスター',   slot: 'poster', price: 600,  tier: 'n' },
  // かぐ
  { id: 'furn_sofa',   name: 'ソファ',             slot: 'furn',   price: 700,  tier: 'n' },
  { id: 'furn_desk',   name: 'つくえと ランプ',    slot: 'furn',   price: 600,  tier: 'n' },
  { id: 'furn_bed',    name: 'ふかふかの ベッド',  slot: 'furn',   price: 800,  tier: 'n' },
  { id: 'furn_shelf',  name: 'ほんだな',           slot: 'furn',   price: 900,  tier: 'r' },
  { id: 'furn_tent',   name: 'あかい テント',      slot: 'furn',   price: 1200, tier: 'r' },
  { id: 'furn_piano',  name: 'ピアノ',             slot: 'furn',   price: 1800, tier: 'r' },
  // すみの もの
  { id: 'corner_cactus', name: 'サボテン',         slot: 'corner', price: 200,  tier: 's' },
  { id: 'corner_plant',  name: 'かんようしょくぶつ', slot: 'corner', price: 250, tier: 's' },
  { id: 'corner_lamp',   name: 'フロアランプ',     slot: 'corner', price: 300,  tier: 's' },
  { id: 'corner_teddy',  name: 'くまの ぬいぐるみ', slot: 'corner', price: 500, tier: 'n' },
  { id: 'corner_globe',  name: 'ちきゅうぎ',       slot: 'corner', price: 600,  tier: 'n' },
  { id: 'corner_fish',   name: 'きんぎょばち',     slot: 'corner', price: 700,  tier: 'n' },
  { id: 'corner_tree',   name: 'おおきな き',      slot: 'corner', price: 900,  tier: 'r' },
  { id: 'corner_trophy', name: 'トロフィーだな',   slot: 'corner', price: 1500, tier: 'r' },
  // おもちゃ
  { id: 'toy_ball',    name: 'ボール',             slot: 'toy',    price: 150,  tier: 's' },
  { id: 'toy_cookie',  name: 'クッキーの おさら',  slot: 'toy',    price: 150,  tier: 's' },
  { id: 'toy_cushion', name: 'クッション',         slot: 'toy',    price: 200,  tier: 's' },
  { id: 'toy_blocks',  name: 'つみき',             slot: 'toy',    price: 250,  tier: 's' },
  { id: 'toy_car',     name: 'ミニカー',           slot: 'toy',    price: 300,  tier: 's' }
];

function roomItem(id) { return ROOM_ITEMS.find(it => it.id === id) || null; }

// ---- 絵（へやの なかの 座標で かく）----
const ROOM_DRAW = {
  // かべがみ（0,0 〜 160,72）
  wall_cream:  () => '<rect x="0" y="0" width="160" height="72" fill="#FFF1D6"/><rect x="0" y="66" width="160" height="6" fill="#F3DDB4"/>',
  wall_pink:   () => '<rect x="0" y="0" width="160" height="72" fill="#FFD9E6"/><rect x="0" y="66" width="160" height="6" fill="#F5B8CE"/>',
  wall_blue:   () => '<rect x="0" y="0" width="160" height="72" fill="#D6EBFF"/><rect x="0" y="66" width="160" height="6" fill="#AFD3F5"/>',
  wall_stripe: () => { let s = '<rect x="0" y="0" width="160" height="72" fill="#FFFFFF"/>'; for (let x = 0; x < 160; x += 20) s += `<rect x="${x}" y="0" width="10" height="72" fill="#CDE7FF"/>`; return s + '<rect x="0" y="66" width="160" height="6" fill="#9FC8EE"/>'; },
  wall_wood:   () => { let s = '<rect x="0" y="0" width="160" height="72" fill="#E8C39E"/>'; for (let y = 12; y < 72; y += 12) s += `<path d="M0 ${y} H160" stroke="#C99B6B" stroke-width="1"/>`; return s + '<rect x="0" y="66" width="160" height="6" fill="#B7835A"/>'; },
  wall_star:   () => '<rect x="0" y="0" width="160" height="72" fill="#312E81"/>' + [[12, 10], [34, 26], [60, 8], [88, 30], [118, 12], [146, 24], [20, 52], [70, 50], [130, 54]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#fff"/>`).join('') + '<rect x="0" y="66" width="160" height="6" fill="#1E1B4B"/>',
  wall_sea:    () => '<rect x="0" y="0" width="160" height="72" fill="#CFEFFF"/><path d="M0 44 Q10 38 20 44 T40 44 T60 44 T80 44 T100 44 T120 44 T140 44 T160 44 V72 H0 Z" fill="#7CC8F5"/><path d="M0 54 Q10 48 20 54 T40 54 T60 54 T80 54 T100 54 T120 54 T140 54 T160 54" stroke="#fff" stroke-width="1.2" fill="none" opacity="0.7"/><rect x="0" y="66" width="160" height="6" fill="#5AAAD8"/>',
  wall_space:  () => '<rect x="0" y="0" width="160" height="72" fill="#1E1B4B"/><circle cx="130" cy="20" r="9" fill="#F59F00"/><ellipse cx="130" cy="20" rx="14" ry="3" fill="none" stroke="#FFD43B" stroke-width="1.2"/><circle cx="30" cy="48" r="5" fill="#74C0FC"/>' + [[10, 10], [50, 22], [76, 8], [100, 40], [148, 52], [60, 56]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="#fff"/>`).join('') + '<rect x="0" y="66" width="160" height="6" fill="#14123A"/>',
  // ゆか（0,72 〜 160,110）
  floor_wood:   () => { let s = '<rect x="0" y="72" width="160" height="38" fill="#D9A86C"/>'; for (let y = 82; y < 110; y += 10) s += `<path d="M0 ${y} H160" stroke="#C48F52" stroke-width="1"/>`; return s; },
  floor_carpet: () => '<rect x="0" y="72" width="160" height="38" fill="#E57373"/><rect x="6" y="78" width="148" height="26" fill="none" stroke="#FFCDD2" stroke-width="2"/>',
  floor_tile:   () => { let s = '<rect x="0" y="72" width="160" height="38" fill="#FFFFFF"/>'; for (let i = 0; i < 16; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2 === 0) s += `<rect x="${i * 10}" y="${72 + j * 10}" width="10" height="10" fill="#CBD5E1"/>`; return s; },
  floor_grass:  () => '<rect x="0" y="72" width="160" height="38" fill="#7CCB7C"/>' + [[10, 84], [40, 96], [74, 82], [110, 100], [140, 88], [26, 104]].map(([x, y]) => `<path d="M${x} ${y} l-2 -5 M${x} ${y} l2 -5 M${x} ${y} l0 -6" stroke="#4CAF50" stroke-width="1.2"/>`).join(''),
  floor_cloud:  () => '<rect x="0" y="72" width="160" height="38" fill="#CFE8FF"/>' + [[24, 90, 12], [70, 98, 14], [118, 88, 12], [146, 102, 10]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${x + r * 0.9}" cy="${y + 2}" r="${r * 0.8}" fill="#fff"/>`).join(''),
  // まど（14〜58, 12〜50）
  window_day:   () => '<rect x="14" y="12" width="44" height="38" rx="2" fill="#BFE6FF" stroke="#8B5A2B" stroke-width="3"/><circle cx="46" cy="24" r="5" fill="#FFE08A"/><path d="M14 22 q14 -6 22 4 q8 -8 22 -2 V50 H14 Z" fill="#fff" opacity="0.5"/><path d="M36 12 V50 M14 31 H58" stroke="#8B5A2B" stroke-width="2.4"/>',
  window_night: () => '<rect x="14" y="12" width="44" height="38" rx="2" fill="#1E2A6B" stroke="#8B5A2B" stroke-width="3"/><circle cx="46" cy="24" r="6" fill="#FFE08A"/><circle cx="49" cy="22" r="5.4" fill="#1E2A6B"/><circle cx="24" cy="22" r="1.1" fill="#fff"/><circle cx="30" cy="38" r="1.1" fill="#fff"/><circle cx="42" cy="40" r="1.1" fill="#fff"/><path d="M36 12 V50 M14 31 H58" stroke="#8B5A2B" stroke-width="2.4"/>',
  window_round: () => '<circle cx="36" cy="31" r="19" fill="#BFE6FF" stroke="#8B5A2B" stroke-width="3.4"/><path d="M36 12 V50 M17 31 H55" stroke="#8B5A2B" stroke-width="2.2"/><path d="M22 40 q8 -8 14 0 q8 -6 14 2 V48 H22 Z" fill="#9AD98A" opacity="0.8"/>',
  window_curtain: () => '<rect x="16" y="14" width="40" height="34" rx="2" fill="#BFE6FF" stroke="#8B5A2B" stroke-width="2.6"/><path d="M36 14 V48" stroke="#8B5A2B" stroke-width="2"/><path d="M12 12 Q22 24 18 50 H12 Z" fill="#F48FB1"/><path d="M60 12 Q50 24 54 50 H60 Z" fill="#F48FB1"/><rect x="10" y="10" width="52" height="3" rx="1.5" fill="#8B5A2B"/>',
  // かべの かざり（100〜146, 12〜46）
  poster_frame: () => '<rect x="104" y="14" width="34" height="28" rx="2" fill="#FFF8E1" stroke="#8B5A2B" stroke-width="2.6"/><path d="M121 36 C108 27 112 20 121 25 C130 20 134 27 121 36 Z" fill="#F06595"/>',
  poster_clock: () => '<circle cx="121" cy="28" r="14" fill="#FFFFFF" stroke="#8B5A2B" stroke-width="3"/><path d="M121 28 V19 M121 28 L128 31" stroke="#333" stroke-width="2" stroke-linecap="round"/><circle cx="121" cy="28" r="1.4" fill="#333"/>',
  poster_flags: () => '<path d="M96 14 Q121 30 146 14" stroke="#8B5A2B" stroke-width="1.2" fill="none"/>' + [[104, 19, '#EF5350'], [114, 24, '#FFD43B'], [124, 26, '#4DA3FF'], [134, 24, '#66BB6A']].map(([x, y, c]) => `<path d="M${x} ${y} h8 l-4 9 Z" fill="${c}"/>`).join(''),
  poster_star:  () => '<rect x="104" y="14" width="34" height="30" rx="2" fill="#312E81"/>' + ((typeof perkStar === 'function') ? perkStar(121, 29, 10, '#FFD43B') : '') + '<circle cx="110" cy="20" r="1" fill="#fff"/><circle cx="132" cy="38" r="1" fill="#fff"/>',
  // かぐ（6〜56, たては ゆか の うえ）
  furn_sofa:  () => '<rect x="8" y="62" width="46" height="22" rx="6" fill="#4DA3FF"/><rect x="4" y="68" width="10" height="24" rx="5" fill="#2F80E0"/><rect x="48" y="68" width="10" height="24" rx="5" fill="#2F80E0"/><rect x="12" y="76" width="38" height="16" rx="4" fill="#6BB6FF"/><rect x="8" y="92" width="3" height="4" fill="#5D4037"/><rect x="51" y="92" width="3" height="4" fill="#5D4037"/>',
  furn_desk:  () => '<rect x="8" y="74" width="46" height="5" rx="1.5" fill="#B7835A"/><rect x="11" y="79" width="4" height="18" fill="#8B5A2B"/><rect x="47" y="79" width="4" height="18" fill="#8B5A2B"/><path d="M40 74 V62 L46 56" stroke="#555" stroke-width="2" fill="none"/><path d="M42 54 L52 54 L49 62 L45 62 Z" fill="#FFD43B"/><rect x="14" y="68" width="12" height="6" fill="#FF8A65"/>',
  furn_bed:   () => '<rect x="6" y="76" width="50" height="16" rx="3" fill="#FFB74D"/><rect x="6" y="64" width="6" height="30" rx="2" fill="#8B5A2B"/><rect x="50" y="70" width="6" height="24" rx="2" fill="#8B5A2B"/><rect x="12" y="72" width="16" height="9" rx="4" fill="#fff"/><rect x="12" y="78" width="40" height="12" rx="3" fill="#F48FB1"/>',
  furn_shelf: () => '<rect x="10" y="48" width="40" height="48" rx="2" fill="#B7835A" stroke="#8B5A2B" stroke-width="1.4"/><path d="M10 64 H50 M10 80 H50" stroke="#8B5A2B" stroke-width="1.6"/>' + [[14, 50, 5, '#EF5350'], [20, 52, 5, '#4DA3FF'], [26, 50, 4, '#FFD43B'], [14, 66, 6, '#66BB6A'], [22, 68, 5, '#AB47BC'], [14, 82, 5, '#FF8A65'], [28, 84, 6, '#26A69A']].map(([x, y, w, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${y < 64 ? 14 : (y < 80 ? 12 : 12)}" fill="${c}"/>`).join(''),
  furn_tent:  () => '<path d="M6 96 L30 52 L54 96 Z" fill="#EF5350"/><path d="M30 52 L30 96" stroke="#C62828" stroke-width="1.4"/><path d="M22 96 L30 76 L38 96 Z" fill="#7F1D1D"/><circle cx="30" cy="52" r="2" fill="#FFD43B"/>',
  furn_piano: () => '<rect x="6" y="64" width="50" height="22" rx="3" fill="#2B2B2B"/><rect x="8" y="76" width="46" height="10" fill="#fff"/>' + [14, 22, 30, 38, 46].map(x => `<rect x="${x}" y="76" width="3.4" height="6" fill="#2B2B2B"/>`).join('') + '<rect x="10" y="86" width="4" height="12" fill="#2B2B2B"/><rect x="48" y="86" width="4" height="12" fill="#2B2B2B"/>',
  // すみの もの（118〜152）
  corner_cactus: () => '<rect x="128" y="86" width="14" height="12" rx="2" fill="#E57373"/><rect x="132" y="66" width="7" height="22" rx="3.5" fill="#43A047"/><rect x="126" y="74" width="6" height="4" rx="2" fill="#43A047"/><rect x="139" y="70" width="6" height="4" rx="2" fill="#43A047"/>',
  corner_plant:  () => '<rect x="126" y="84" width="18" height="14" rx="3" fill="#B7835A"/><path d="M135 84 Q120 70 124 58 Q134 66 135 84 Z M135 84 Q150 70 146 58 Q136 66 135 84 Z M135 84 Q135 62 135 52 Q140 66 135 84 Z" fill="#43A047"/>',
  corner_lamp:   () => '<rect x="134" y="62" width="3" height="34" fill="#8B5A2B"/><rect x="128" y="94" width="15" height="4" rx="2" fill="#8B5A2B"/><path d="M126 62 L145 62 L141 50 L130 50 Z" fill="#FFD43B"/>',
  corner_teddy:  () => '<circle cx="135" cy="92" r="9" fill="#B7835A"/><circle cx="135" cy="78" r="7" fill="#B7835A"/><circle cx="129" cy="72" r="2.6" fill="#B7835A"/><circle cx="141" cy="72" r="2.6" fill="#B7835A"/><circle cx="132.6" cy="77" r="1" fill="#333"/><circle cx="137.4" cy="77" r="1" fill="#333"/><ellipse cx="135" cy="80.6" rx="2.6" ry="1.8" fill="#E8C39E"/>',
  corner_globe:  () => '<circle cx="135" cy="76" r="12" fill="#4DA3FF"/><path d="M128 72 q4 -4 8 0 q2 5 -3 7 q-4 -1 -5 -7 Z M138 80 q4 -2 6 2 q-2 4 -6 2 Z" fill="#66BB6A"/><path d="M135 88 V96 M127 98 H143" stroke="#8B5A2B" stroke-width="2.4" stroke-linecap="round"/>',
  corner_fish:   () => '<rect x="124" y="86" width="22" height="12" fill="#8B5A2B"/><circle cx="135" cy="76" r="11" fill="#BFE6FF" stroke="#8EC9F0" stroke-width="1.4"/><ellipse cx="135" cy="78" rx="5" ry="3" fill="#FF8A65"/><path d="M140 78 l5 -3 v6 Z" fill="#FF8A65"/><path d="M129 84 q6 -3 12 0 v-2 h-12 Z" fill="#7CC8F5" opacity="0.7"/>',
  corner_tree:   () => '<rect x="132" y="70" width="6" height="28" fill="#8B5A2B"/><circle cx="135" cy="58" r="16" fill="#43A047"/><circle cx="124" cy="68" r="9" fill="#4CAF50"/><circle cx="146" cy="68" r="9" fill="#4CAF50"/><circle cx="130" cy="54" r="2.4" fill="#EF5350"/><circle cx="141" cy="62" r="2.4" fill="#EF5350"/>',
  corner_trophy: () => '<rect x="122" y="56" width="26" height="42" rx="2" fill="#B7835A" stroke="#8B5A2B" stroke-width="1.4"/><rect x="125" y="59" width="20" height="36" fill="#E3F2FD"/><path d="M125 77 H145" stroke="#8B5A2B" stroke-width="1.4"/><path d="M131 64 H139 Q139 71 135 72 Q131 71 131 64 Z" fill="#F5B21B"/><rect x="134" y="72" width="2" height="3" fill="#C98A00"/><circle cx="131" cy="86" r="3.6" fill="#E53935"/><circle cx="139" cy="86" r="3.6" fill="#1E88E5"/>',
  // おもちゃ（ポコの みぎまえ）
  toy_ball:    () => '<circle cx="104" cy="98" r="6" fill="#EF5350"/><path d="M98 98 Q104 93 110 98 Q104 103 98 98 Z" fill="#fff" opacity="0.8"/>',
  toy_cookie:  () => '<ellipse cx="104" cy="100" rx="11" ry="3.6" fill="#fff" stroke="#CBD5E1" stroke-width="1"/><circle cx="100" cy="98" r="3" fill="#C98A45"/><circle cx="107" cy="98.5" r="3" fill="#C98A45"/><circle cx="99" cy="97.6" r="0.6" fill="#5D4037"/><circle cx="108" cy="98" r="0.6" fill="#5D4037"/>',
  toy_cushion: () => '<rect x="94" y="94" width="20" height="10" rx="5" fill="#F48FB1"/><circle cx="104" cy="99" r="1.4" fill="#C2185B"/>',
  toy_blocks:  () => '<rect x="94" y="96" width="9" height="9" fill="#EF5350"/><rect x="104" y="96" width="9" height="9" fill="#4DA3FF"/><rect x="99" y="87" width="9" height="9" fill="#FFD43B"/>',
  toy_car:     () => '<rect x="92" y="96" width="22" height="7" rx="2.4" fill="#4DA3FF"/><path d="M96 96 L99 90 H107 L110 96 Z" fill="#74C0FC"/><circle cx="98" cy="104" r="3" fill="#333"/><circle cx="108" cy="104" r="3" fill="#333"/>'
};

// ---- へやの 絵 ----
// pet：ポコの 絵（petSVG の 文字列）を まんなかに おく。wear：場所 → id（なければ もとの かべ・ゆか）
function roomSVG(wear, w, petSvg) {
  const h = Math.round(w * 110 / 160);
  const pick = (slot) => {
    const id = wear[slot];
    const it = id && roomItem(id);
    if (it && it.slot === slot) return id;
    const def = ROOM_SLOTS.find(s => s.key === slot).def;
    return def;
  };
  let inner = '';
  ['wall', 'floor', 'window', 'poster', 'furn', 'corner'].forEach(slot => {
    const id = pick(slot);
    if (id && ROOM_DRAW[id]) inner += ROOM_DRAW[id]();
  });
  if (petSvg) inner += petSvg.replace(/^<svg [^>]*>/, '<svg x="53" y="41" width="54" height="51" viewBox="0 0 64 60" xmlns="http://www.w3.org/2000/svg">');
  const toy = pick('toy');
  if (toy && ROOM_DRAW[toy]) inner += ROOM_DRAW[toy]();
  return `<svg width="${w}" height="${h}" viewBox="0 0 160 110" role="img" aria-label="ポコの へや" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="110" rx="8" fill="#fff"/>${inner}</svg>`;
}

// ---- 買う・おく ----
function roomOwns(it, shop) { return it.price === 0 || !!shop.own[it.id]; }

function buyRoomItem(id, name) {
  const it = roomItem(id);
  if (!it) return 'none';
  const s = loadShop(name);
  if (roomOwns(it, s)) return 'owned';
  if (!spendCoins(it.price, name)) return 'poor';
  s.own[id] = 1;
  s.wear[it.slot] = id;
  saveShop(s, name);
  return 'ok';
}

function placeRoomItem(id, name) {
  const it = roomItem(id);
  const s = loadShop(name);
  if (!it || !roomOwns(it, s)) return false;
  s.wear[it.slot] = id;
  saveShop(s, name);
  return true;
}

function removeRoomItem(slot, name) {
  const s = loadShop(name);
  delete s.wear[slot];
  saveShop(s, name);
}

// しょうひん（ポコの いまの すがた つきの へや）
function roomWear(shop) {
  const w = {};
  ROOM_SLOTS.forEach(sl => { const id = shop.wear[sl.key]; const it = id && roomItem(id); if (it && it.slot === sl.key && roomOwns(it, shop)) w[sl.key] = id; });
  return w;
}

function roomPlacedCount(shop) { const w = roomWear(shop); return Object.keys(w).filter(k => k !== 'wall' && k !== 'floor').length; }

// ---- 画面（おしゃれ → 🏠 へや）----
function renderRoomView(root) {
  const shop = loadShop();
  const have = petBalance(loadPet());
  const pet = loadPet();
  const stage = petStage(pet.growth);
  const size = Math.min(420, Math.max(280, window.innerWidth - 40));

  const hero = el('div', 'shop-hero room-hero');
  const pic = el('div', 'room-pic');
  pic.innerHTML = roomSVG(roomWear(shop), size, petSVG(stage, 'happy', 54));
  hero.appendChild(pic);
  hero.appendChild(el('div', 'zukan-coin', `💰 ${have} コイン`));
  hero.appendChild(el('div', 'pet-note', 'かった ものを「おく」と、ポコの へやに かざられるよ'));
  root.appendChild(hero);

  ROOM_SLOTS.forEach(sl => {
    root.appendChild(el('h3', 'section-title', sl.label));
    const grid = el('div', 'shop-grid');
    ROOM_ITEMS.filter(it => it.slot === sl.key).forEach(it => {
      const owned = roomOwns(it, shop);
      const placed = shop.wear[sl.key] === it.id || (!shop.wear[sl.key] && sl.def === it.id);
      const card = el('div', 'shop-card' + (owned ? ' owned' : '') + (placed ? ' worn' : ''));
      const preview = el('div', 'shop-card-pic room-card-pic');
      preview.innerHTML = roomSVG({ [sl.key]: it.id }, 124, null);
      card.appendChild(preview);
      card.appendChild(el('div', 'shop-card-name', it.name));
      if (!owned) card.appendChild(el('div', 'shop-card-tier tier-' + it.tier, SHOP_TIERS[it.tier]));
      let btn;
      if (owned) {
        if (placed) {
          btn = el('button', 'sub-btn shop-btn', sl.def ? 'もとに もどす' : 'はずす');
          btn.disabled = sl.def === it.id;   // もとの かべ・ゆかは そのまま
          btn.addEventListener('click', () => { removeRoomItem(sl.key); renderShop(); });
        } else {
          btn = el('button', 'main-btn shop-btn', 'おく');
          btn.addEventListener('click', () => { placeRoomItem(it.id); renderShop(); });
        }
      } else {
        btn = el('button', have >= it.price ? 'main-btn shop-btn' : 'sub-btn shop-btn', `💰 ${it.price}`);
        btn.addEventListener('click', () => {
          const now = petBalance(loadPet());
          if (now < it.price) { showToast(`コインが たりないよ（あと ${it.price - now}コイン）`); return; }
          askConfirm(`「${it.name}」を かう？\n（${it.price}コイン つかいます）\nいま ${now}コイン`, 'かう', 'やめる', () => {
            const r = buyRoomItem(it.id);
            if (r === 'ok') { FX.correct(); showToast(`「${it.name}」を かったよ！ へやに おいたよ`); }
            else if (r === 'poor') showToast('コインが たりないよ');
            renderShop();
          }, { cancelFirst: true });
        });
      }
      card.appendChild(btn);
      grid.appendChild(card);
    });
    root.appendChild(grid);
  });
}
