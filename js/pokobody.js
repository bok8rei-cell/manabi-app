// ===== ポコの からだ（ポコまる・ポコキングから）と、ようふく・くつ・もちもの =====
// ポコまる(3だんかい目)・ポコキング(4だんかい目)は、あたまの したに からだ・うで・あしが つく。
// からだに つける かざり：ふく（outfit）・くつ（shoes）・もちもの（hand）。ポコっち までは まだ からだが ないので つけられない。
// 絵は 64×60 の えの なかで、からだは 下のほうに かく（あたまは 小さく して うえに のせる）。
//   からだ：よこ 24〜40、たて 33〜48　　あし：46〜56　　右手（もちもの）：(47.7, 34.7)

const POKO_BODY_SLOTS = ['outfit', 'shoes', 'hand'];
function slotNeedsBody(slot) { return POKO_BODY_SLOTS.includes(slot); }

// えらべる 場所（あたま・め・ほっぺ・くち・くび の あとに ならべる）
(function addBodySlots() {
  const at = SHOP_SLOTS.findIndex(s => s.key === 'neck') + 1;
  SHOP_SLOTS.splice(at, 0,
    { key: 'outfit', label: 'ふく', body: true },
    { key: 'shoes', label: 'くつ', body: true },
    { key: 'hand', label: 'もちもの', body: true });
})();

// ---- ふく・くつ・もちもの の 一らん ----
SHOP_ITEMS.push(
  // ふく
  { id: 'tee_red',    name: 'あかい Tシャツ',     slot: 'outfit', price: 300,  tier: 's' },
  { id: 'tee_blue',   name: 'あおい Tシャツ',     slot: 'outfit', price: 300,  tier: 's' },
  { id: 'tee_yellow', name: 'ほしの Tシャツ',     slot: 'outfit', price: 300,  tier: 's' },
  { id: 'border',     name: 'ボーダーの ふく',    slot: 'outfit', price: 600,  tier: 'n' },
  { id: 'overalls',   name: 'オーバーオール',     slot: 'outfit', price: 700,  tier: 'n' },
  { id: 'hoodie',     name: 'みどりの パーカー',  slot: 'outfit', price: 800,  tier: 'n' },
  { id: 'dress',      name: 'ピンクの ワンピース', slot: 'outfit', price: 800, tier: 'n' },
  { id: 'sailor',     name: 'セーラーふく',       slot: 'outfit', price: 1500, tier: 'r' },
  { id: 'gakuran',    name: 'がくらん',           slot: 'outfit', price: 1500, tier: 'r' },
  { id: 'kimono',     name: 'さくらの きもの',    slot: 'outfit', price: 1800, tier: 'r' },
  { id: 'ninja',      name: 'にんじゃの ふく',    slot: 'outfit', price: 1800, tier: 'r' },
  { id: 'hero',       name: 'ヒーローの ふく',    slot: 'outfit', price: 1800, tier: 'r' },
  { id: 'royalrobe',  name: 'おうさまの ローブ',  slot: 'outfit', price: 5000, tier: 'sr' },
  // くつ
  { id: 'sneakers',   name: 'スニーカー',         slot: 'shoes',  price: 250,  tier: 's' },
  { id: 'boots',      name: 'ブーツ',             slot: 'shoes',  price: 300,  tier: 's' },
  { id: 'rainboots',  name: 'きいろい ながぐつ',  slot: 'shoes',  price: 600,  tier: 'n' },
  { id: 'geta',       name: 'げた',               slot: 'shoes',  price: 700,  tier: 'n' },
  { id: 'skates',     name: 'スケートぐつ',       slot: 'shoes',  price: 1500, tier: 'r' },
  // もちもの
  { id: 'balloon',    name: 'ふうせん',           slot: 'hand',   price: 250,  tier: 's' },
  { id: 'icecream',   name: 'アイスクリーム',     slot: 'hand',   price: 300,  tier: 's' },
  { id: 'flag',       name: 'はた',               slot: 'hand',   price: 300,  tier: 's' },
  { id: 'umbrella',   name: 'きいろい かさ',      slot: 'hand',   price: 800,  tier: 'n' },
  { id: 'wand',       name: 'まほうの つえ',      slot: 'hand',   price: 800,  tier: 'n' },
  { id: 'sword',      name: 'ゆうしゃの けん',    slot: 'hand',   price: 1500, tier: 'r' },
  { id: 'trophy',     name: 'きんの トロフィー',  slot: 'hand',   price: 1800, tier: 'r' }
);

// ---- からだ（ぜんぶ ポコの いろ・おなかの いろに あわせる）----
// 右手に もちものが あるときは、右うでを よこへ あげる。cheer（よろこび）のときは りょううでを あげる
function pokoBodySVG(deco, mood, hasHand) {
  const m = deco.main, b = deco.belly;
  const stroke = 'stroke="rgba(0,0,0,0.12)" stroke-width="0.6"';
  let s = '';
  // あし
  s += `<rect x="26" y="45" width="5.2" height="10" rx="2.4" fill="${m}" ${stroke}/>`;
  s += `<rect x="32.8" y="45" width="5.2" height="10" rx="2.4" fill="${m}" ${stroke}/>`;
  if (!deco.shoes) s += `<ellipse cx="28.2" cy="55.8" rx="4.6" ry="2.5" fill="${m}" ${stroke}/><ellipse cx="35.8" cy="55.8" rx="4.6" ry="2.5" fill="${m}" ${stroke}/>`;
  // からだ
  s += `<rect x="24" y="32" width="16" height="16.5" rx="7.5" fill="${m}" ${stroke}/>`;
  s += `<ellipse cx="32" cy="41.5" rx="5.3" ry="5.8" fill="${b}"/>`;
  // うで
  const up = mood === 'cheer' && !hasHand;
  const arm = (side) => {   // side = -1（ひだり）／+1（みぎ）
    const cx = 32 + side * 10.6;
    if (hasHand && side === 1) return `<ellipse cx="44.3" cy="39" rx="2.8" ry="6" transform="rotate(40 44.3 39)" fill="${m}" ${stroke}/>`;
    if (up) return `<ellipse cx="${32 + side * 11.4}" cy="33" rx="2.8" ry="6" transform="rotate(${side * 32} ${32 + side * 11.4} 33)" fill="${m}" ${stroke}/>`;
    return `<ellipse cx="${cx}" cy="40.5" rx="2.8" ry="6" transform="rotate(${-side * 14} ${cx} 40.5)" fill="${m}" ${stroke}/>`;
  };
  s += arm(-1) + arm(1);
  s += deco.outfit + deco.shoes;
  return s;
}

// ---- ふくの え（からだの うえに かさねる）----
const _pbTee = (c, sleeve) => `<path d="M24.3 36 Q24.3 32.6 28 32.6 L36 32.6 Q39.7 32.6 39.7 36 L39.7 44.5 Q39.7 46.5 37.2 46.5 L26.8 46.5 Q24.3 46.5 24.3 44.5 Z" fill="${c}"/>` +
  `<ellipse cx="22.6" cy="36.8" rx="3.1" ry="2.7" fill="${sleeve || c}"/><ellipse cx="41.4" cy="36.8" rx="3.1" ry="2.7" fill="${sleeve || c}"/>`;

Object.assign(SHOP_DRAW, {
  tee_red:    () => _pbTee('#EF5350'),
  tee_blue:   () => _pbTee('#4DA3FF'),
  tee_yellow: () => _pbTee('#FFD43B') + perkStar(32, 39.5, 3.6, '#F59F00'),
  border:     () => _pbTee('#FFFFFF', '#FFFFFF') + '<path d="M24.5 36 H39.5 M24.5 39 H39.5 M24.5 42 H39.5 M24.5 45 H39.5" stroke="#2F4B8A" stroke-width="1.3"/><path d="M19.6 36.4 H25.6 M38.4 36.4 H44.4" stroke="#2F4B8A" stroke-width="1.3"/>',
  overalls:   () => _pbTee('#EF5350') + '<path d="M26 39 L38 39 L38.8 47.5 Q38.8 48.6 37.5 48.6 L26.5 48.6 Q25.2 48.6 25.2 47.5 Z" fill="#3B6FD4"/><path d="M27.4 39 L28.6 33.2 M36.6 39 L35.4 33.2" stroke="#3B6FD4" stroke-width="1.8" stroke-linecap="round"/><circle cx="27.8" cy="38.6" r="0.9" fill="#FFD43B"/><circle cx="36.2" cy="38.6" r="0.9" fill="#FFD43B"/><path d="M29.5 43 H34.5 V46.4 H29.5 Z" fill="#2F58B5"/>',
  hoodie:     () => '<ellipse cx="32" cy="33.4" rx="8.4" ry="2.9" fill="#4CAF5B"/>' + _pbTee('#6BCB77') + '<path d="M28 41 H36 L35.2 45.4 H28.8 Z" fill="#58B566"/><path d="M30 33.6 V38.6 M34 33.6 V38.6" stroke="#fff" stroke-width="1" stroke-linecap="round"/>',
  dress:      () => '<path d="M26 34 Q32 31.6 38 34 L41.2 49.4 Q32 51.6 22.8 49.4 Z" fill="#FF8FB1"/><ellipse cx="22.6" cy="36.8" rx="3" ry="2.6" fill="#FF8FB1"/><ellipse cx="41.4" cy="36.8" rx="3" ry="2.6" fill="#FF8FB1"/><circle cx="28" cy="43" r="1.1" fill="#fff"/><circle cx="34" cy="46" r="1.1" fill="#fff"/><circle cx="37" cy="41" r="1.1" fill="#fff"/><circle cx="30.5" cy="48" r="1" fill="#fff"/><path d="M26.6 41.6 H37.4" stroke="#E8588C" stroke-width="1.2"/>',
  sailor:     () => _pbTee('#FFFFFF') + '<path d="M27.5 32.8 L32 41 L36.5 32.8 L34.6 32.6 L32 37 L29.4 32.6 Z" fill="#1E3A8A"/><path d="M32 40.2 L29.4 38.4 L29.4 42.2 Z M32 40.2 L34.6 38.4 L34.6 42.2 Z" fill="#E53935"/><circle cx="32" cy="40.2" r="1" fill="#C62828"/>',
  gakuran:    () => _pbTee('#1F2937') + '<circle cx="32" cy="36.4" r="0.9" fill="#FFC107"/><circle cx="32" cy="40" r="0.9" fill="#FFC107"/><circle cx="32" cy="43.6" r="0.9" fill="#FFC107"/><path d="M32 33 V46.4" stroke="#0F172A" stroke-width="0.6"/><path d="M28.6 33 H35.4" stroke="#FFC107" stroke-width="1"/>',
  kimono:     () => '<path d="M24.4 35 Q32 31.4 39.6 35 L40.8 49.4 Q32 51.6 23.2 49.4 Z" fill="#B197FC"/><ellipse cx="22.6" cy="36.8" rx="3.2" ry="2.8" fill="#B197FC"/><ellipse cx="41.4" cy="36.8" rx="3.2" ry="2.8" fill="#B197FC"/><path d="M29 32.8 L32 40.4 L35 32.8" stroke="#fff" stroke-width="1.5" fill="none" stroke-linejoin="round"/><rect x="24" y="41.4" width="16" height="3.6" fill="#FFB300"/><circle cx="27" cy="47.6" r="1" fill="#FFB3C6"/><circle cx="36.5" cy="47.2" r="1" fill="#FFB3C6"/><circle cx="32" cy="48.6" r="0.9" fill="#FFB3C6"/>',
  ninja:      () => _pbTee('#374151') + '<rect x="24.3" y="42.4" width="15.4" height="2.4" fill="#E53935"/><path d="M39.6 43.2 L43.4 46.6 L41.4 47.6 Z" fill="#E53935"/>',
  hero:       () => _pbTee('#E53935', '#E53935') + perkStar(32, 38.6, 3.8, '#FFD43B') + '<rect x="24.3" y="43.4" width="15.4" height="2.2" fill="#FFD43B"/>',
  royalrobe:  () => _pbTee('#C62828') + '<ellipse cx="32" cy="33.8" rx="8.6" ry="2.9" fill="#FFFFFF"/><circle cx="27.6" cy="33.8" r="0.7" fill="#333"/><circle cx="32" cy="35" r="0.7" fill="#333"/><circle cx="36.4" cy="33.8" r="0.7" fill="#333"/><path d="M32 34.6 V46.4" stroke="#FFFFFF" stroke-width="2.4"/><rect x="24.3" y="42" width="15.4" height="2.2" fill="#F5B21B"/><circle cx="32" cy="43.1" r="1.4" fill="#E53935" stroke="#C98A00" stroke-width="0.5"/>',
  // --- くつ（あしの うえに かさねる）---
  sneakers:   () => '<ellipse cx="28" cy="55.6" rx="5.2" ry="2.8" fill="#FFFFFF" stroke="#9CA3AF" stroke-width="0.7"/><ellipse cx="36" cy="55.6" rx="5.2" ry="2.8" fill="#FFFFFF" stroke="#9CA3AF" stroke-width="0.7"/><path d="M23.4 55.8 H32 M32 55.8 H40.6" stroke="#E53935" stroke-width="1.3"/>',
  boots:      () => '<path d="M25.4 50 H31.8 V54.2 Q34 54.6 33.8 56.8 H24.4 Q23.6 56.8 24.2 54.4 Z" fill="#8B5A2B"/><path d="M32.2 50 H38.6 V54.2 Q40.8 54.6 40.6 56.8 H31.2 Q30.4 56.8 31 54.4 Z" fill="#8B5A2B"/><rect x="25.4" y="50" width="6.4" height="1.4" fill="#6B3F18"/><rect x="32.2" y="50" width="6.4" height="1.4" fill="#6B3F18"/>',
  rainboots:  () => '<path d="M25.2 49 H31.8 V54.2 Q34.2 54.6 34 57 H24 Q23.2 57 24 54.4 Z" fill="#FFD43B" stroke="#E8A800" stroke-width="0.6"/><path d="M32.2 49 H38.8 V54.2 Q41.2 54.6 41 57 H31 Q30.2 57 31 54.4 Z" fill="#FFD43B" stroke="#E8A800" stroke-width="0.6"/>',
  geta:       () => '<rect x="23.6" y="55.4" width="9.2" height="2.2" rx="0.8" fill="#B7835A"/><rect x="31.2" y="55.4" width="9.2" height="2.2" rx="0.8" fill="#B7835A"/><rect x="25" y="57.6" width="1.6" height="1.6" fill="#8B5A2B"/><rect x="29.6" y="57.6" width="1.6" height="1.6" fill="#8B5A2B"/><rect x="32.8" y="57.6" width="1.6" height="1.6" fill="#8B5A2B"/><rect x="37.4" y="57.6" width="1.6" height="1.6" fill="#8B5A2B"/><path d="M28.2 55.4 L25.6 53.4 M28.2 55.4 L30.8 53.4 M35.8 55.4 L33.2 53.4 M35.8 55.4 L38.4 53.4" stroke="#E53935" stroke-width="1.1" stroke-linecap="round"/>',
  skates:     () => '<path d="M25 50 H31.8 V54.4 Q34 54.8 33.8 56.4 H24 Q23.4 56.4 24 54.6 Z" fill="#FFFFFF" stroke="#9CA3AF" stroke-width="0.6"/><path d="M32.2 50 H39 V54.4 Q41.2 54.8 41 56.4 H31.2 Q30.6 56.4 31.2 54.6 Z" fill="#FFFFFF" stroke="#9CA3AF" stroke-width="0.6"/><path d="M23 58 H34.4 M30.2 58 H41.6" stroke="#90A4AE" stroke-width="1.3" stroke-linecap="round"/><path d="M25 56.4 V58 M33 56.4 V58 M32.2 56.4 V58 M40 56.4 V58" stroke="#90A4AE" stroke-width="0.8"/>',
  // --- もちもの（右手 = 47.7, 34.7）---
  balloon:    () => '<path d="M47.7 34.5 Q49.5 28 48.8 22.6" stroke="#9CA3AF" stroke-width="0.7" fill="none"/><ellipse cx="48.8" cy="17.4" rx="4.8" ry="5.7" fill="#EF5350" stroke="#C62828" stroke-width="0.6"/><ellipse cx="47" cy="15.2" rx="1.2" ry="1.8" fill="#FFFFFF" opacity="0.65"/><path d="M48.8 23.2 L47.8 24.6 L49.8 24.6 Z" fill="#C62828"/>',
  icecream:   () => '<path d="M45.2 34.2 L50.2 34.2 L47.7 43.2 Z" fill="#E8B26A" stroke="#B7835A" stroke-width="0.5"/><path d="M46.6 35.4 L48.6 40.6 M48.8 35.4 L46.8 40.6" stroke="#B7835A" stroke-width="0.4"/><circle cx="47.7" cy="31.6" r="3.6" fill="#FF9EB8"/><circle cx="47.7" cy="28.4" r="2.8" fill="#FFF3D6"/><circle cx="47.7" cy="25.9" r="0.9" fill="#E53935"/>',
  flag:       () => '<rect x="47.2" y="20" width="1" height="16" fill="#8B5A2B"/><path d="M48.2 20.4 L57 23.6 L48.2 27 Z" fill="#E53935"/>' + perkStar(51.4, 23.6, 1.7, '#FFFFFF'),
  umbrella:   () => '<path d="M47.7 36 V25" stroke="#8B5A2B" stroke-width="1"/><path d="M39.6 26 Q47.7 15.4 55.8 26 Q53.2 24.2 51.2 26 Q49.4 24.2 47.7 26 Q46 24.2 44.2 26 Q42.2 24.2 39.6 26 Z" fill="#FFD43B" stroke="#E8A800" stroke-width="0.7"/><path d="M47.7 16.6 V26" stroke="#E8A800" stroke-width="0.6"/>',
  wand:       () => '<path d="M47.4 35.4 L52 24" stroke="#8B5A2B" stroke-width="1.5" stroke-linecap="round"/>' + perkStar(52.6, 21.6, 4, '#FFD43B') + '<circle cx="57" cy="26" r="0.8" fill="#FFD43B"/><circle cx="48.6" cy="19" r="0.8" fill="#FFB3C6"/>',
  sword:      () => '<rect x="46.9" y="18" width="1.7" height="15.6" rx="0.6" fill="#CFD8DC" stroke="#90A4AE" stroke-width="0.5"/><path d="M46.9 18 L47.75 15.8 L48.6 18 Z" fill="#CFD8DC"/><rect x="44.6" y="33.2" width="6.3" height="1.7" rx="0.6" fill="#B7835A"/><rect x="47.1" y="34.9" width="1.3" height="3" fill="#8B5A2B"/>',
  trophy:     () => '<path d="M44.2 22.6 H51.2 Q51.2 29.6 47.7 30.4 Q44.2 29.6 44.2 22.6 Z" fill="#F5B21B" stroke="#C98A00" stroke-width="0.7"/><path d="M44.2 24 Q41 24 41.4 26.6 Q41.8 28 44.4 28 M51.2 24 Q54.4 24 54 26.6 Q53.6 28 51 28" stroke="#C98A00" stroke-width="0.8" fill="none"/><rect x="47.1" y="30.2" width="1.3" height="3.4" fill="#C98A00"/><rect x="44.8" y="33.4" width="5.8" height="1.8" rx="0.6" fill="#F5B21B" stroke="#C98A00" stroke-width="0.5"/>'
});
