// ===== ポコ（育てるキャラ）・コイン・バッジ =====

// ポコは「毎日つづけること」で そだつ。たくさん やっても、すぐには進化しない（やりすぎても、やめても よい）。
// そだちポイント：その日はじめて べんきょうした +1／その日 15もん せいかいした +1／きょうのミッションぜんぶ +1
// （1日さいだい3ポイント。毎日10もん くらいなら、ポコまで 約1週間、ポコっちまで 約1か月、ポコまるまで 約3か月、ポコキングまで 約8か月）
const PET_STAGES = [
  { min: 0,   name: 'ポコの たまご' },
  { min: 8,   name: 'ポコ' },
  { min: 40,  name: 'ポコっち' },
  { min: 120, name: 'ポコまる' },
  { min: 300, name: 'ポコキング' }
];
const GROWTH_AMOUNT_TARGET = 15;   // この数 せいかいした日は、そだちポイント +1

function petKey(name) { return `manabi_pet_${playerTag(name)}`; }

function loadPet(name) {
  const p = Object.assign({ xp: 0, coins: 0, spent: 0, perfects: 0, missions: 0, cleared: 0 }, readJSON(petKey(name), null) || {});
  // 前の育ち方（せいかいした数で進化）からの引きつぎ：ポコのすぐ手前から、あらためて そだてる
  if (typeof p.growth !== 'number') p.growth = Math.min(Math.floor((p.xp || 0) / 15), PET_STAGES[1].min - 1);
  if (!p.growthDay || typeof p.growthDay !== 'object') p.growthDay = { date: '', base: false, amount: false, mission: false, c: 0 };
  return p;
}

// いま つかえる コイン（もらった合計 － つかった合計）
function petBalance(p) { return Math.max(0, (p.coins || 0) - (p.spent || 0)); }

// コインを つかう。たりなければ false
function spendCoins(n, name) {
  const p = loadPet(name);
  if (petBalance(p) < n) return false;
  p.spent = (p.spent || 0) + n;
  writeJSON(petKey(name), p);
  return true;
}

function petStage(growth) {
  let stage = 0;
  PET_STAGES.forEach((s, i) => { if (growth >= s.min) stage = i; });
  return stage;
}

// 次の進化までの進み具合（pct: 0〜100, need: あと何ポイント, have/span: いまの段階での進み）
function petProgress(growth) {
  const stage = petStage(growth);
  const next = PET_STAGES[stage + 1];
  if (!next) return { stage, pct: 100, need: 0, have: 0, span: 0 };
  const cur = PET_STAGES[stage];
  return { stage, pct: Math.round(((growth - cur.min) / (next.min - cur.min)) * 100), need: next.min - growth, have: growth - cur.min, span: next.min - cur.min };
}

// ごほうびを加算する。進化したかどうかも返す。
function awardPet({ xp = 0, coins = 0, perfect = false, mission = false, cleared = 0 }) {
  const p = loadPet();
  const before = petStage(p.growth);
  p.xp += xp;                       // xp：これまでの せいかい数（バッジ用。そのまま たまる）
  p.coins += coins;
  if (perfect) p.perfects += 1;
  if (mission) p.missions += 1;
  p.cleared += cleared;

  // そだちポイント：その日はじめて +1／15もん せいかい +1／ミッションぜんぶ +1
  const today = localDateStr();
  if (p.growthDay.date !== today) p.growthDay = { date: today, base: false, amount: false, mission: false, c: 0 };
  const day = p.growthDay;
  let gain = 0;
  if (!day.base) { day.base = true; gain += 1; }
  day.c += xp;
  if (!day.amount && day.c >= GROWTH_AMOUNT_TARGET) { day.amount = true; gain += 1; }
  if (mission && !day.mission) { day.mission = true; gain += 1; }
  p.growth += gain;
  writeJSON(petKey(), p);

  const after = petStage(p.growth);
  return { pet: p, before, after, levelUp: after > before, gain };
}

// ポコの絵。stage: 0=たまご 1〜4=せいちょう / mood: happy | cheer | think
// 家族ミッションを たっせいした つぎの1しゅうかん：ひかり・キラキラ・ちょうネクタイ（1位の子は 王冠も）
function perkStar(x, y, r) {
  const k = r * 0.28;
  return `<path d="M${x} ${y - r} L${x + k} ${y - k} L${x + r} ${y} L${x + k} ${y + k} L${x} ${y + r} L${x - k} ${y + k} L${x - r} ${y} L${x - k} ${y - k} Z" fill="#FFD43B"/>`;
}

// look：おしゃれの かざり（場所 → id）。省くと いまの子が つけているもの、null で なし
function petSVG(stage, mood = 'happy', size = 64, perk, look) {
  if (perk === undefined) perk = (typeof weeklyPerk === 'function') ? weeklyPerk() : null;
  if (look === undefined) look = (typeof shopLook === 'function') ? shopLook() : null;
  // とくべつな すがたの 1しゅうかんは、ポコが 1だん しんかした すがたで 見える（ポコキングは そのまま）。
  // ほんとうの 育ち具合（growth）は かわらない。ずかん・しんかの ひょうじは noEvolve で、ほんとうの すがたを 見せる
  if (perk && !perk.noEvolve && stage < 4) stage += 1;
  const w = size;
  const h = Math.round(size * 0.94);
  const open = (inner) =>
    `<svg width="${w}" height="${h}" viewBox="0 0 64 60" role="img" aria-label="マスコットのポコ" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

  const glow = perk ? '<ellipse cx="32" cy="33" rx="30" ry="27" fill="#FFE7A0" opacity="0.6"/>' : '';
  const sparkles = perk ? perkStar(6, 10, 5) + perkStar(58, 12, 4) + perkStar(7, 48, 3.5) + perkStar(57, 46, 4.5) : '';
  const crownAt = (b) => `<path d="M20 ${b} L22 ${b - 12} L27 ${b - 5} L32 ${b - 14} L37 ${b - 5} L42 ${b - 12} L44 ${b} Z" fill="#F5B21B" stroke="#C98A00" stroke-width="1.2"/>` +
    `<circle cx="22" cy="${b - 12}" r="1.8" fill="#E5484D"/><circle cx="32" cy="${b - 14}" r="2.1" fill="#E5484D"/><circle cx="42" cy="${b - 12}" r="1.8" fill="#E5484D"/>`;

  if (stage === 0) {
    return open(
      glow +
      '<ellipse cx="32" cy="34" rx="19" ry="23" fill="#FFF3D6" stroke="#E8D5A8" stroke-width="2"/>' +
      '<circle cx="25" cy="28" r="3.2" fill="#B8EBDD"/><circle cx="38" cy="38" r="4" fill="#B8EBDD"/><circle cx="30" cy="45" r="2.4" fill="#B8EBDD"/>' +
      '<path d="M22 22 L28 26 L32 20 L37 26 L42 22" stroke="#E8D5A8" stroke-width="2" fill="none" stroke-linejoin="round"/>' +
      sparkles + (perk && perk.crown ? crownAt(16) : '')
    );
  }

  const rx = [0, 20, 23, 25, 26][stage];
  const ry = [0, 16, 19, 21, 22][stage];
  const cy = 60 - ry - 3;
  const eyeY = cy - 4;
  const deco = (typeof shopDraw === 'function') ? shopDraw(look, { rx, ry, cy, eyeY, y0: cy - ry }) : { back: '', aura: '', defs: '', main: '#5CC9B0', belly: '#B8EBDD', eyes: '', cheek: '', neck: '', head: '' };
  let parts = deco.defs + deco.back + deco.aura + glow;
  if (perk && perk.cape) {   // ウラボスを たおした つぎの1しゅうかん：マント（からだの うしろ）
    parts += `<path d="M${32 - rx + 3} ${cy - 3} Q${32 - rx - 7} ${cy + ry} ${32 - rx + 3} ${cy + ry + 2} L${32 + rx - 3} ${cy + ry + 2} Q${32 + rx + 7} ${cy + ry} ${32 + rx - 3} ${cy - 3} Z" fill="#D63B4F" stroke="#A92639" stroke-width="1"/>`;
  }
  if (stage >= 2) {
    parts += `<path d="M${32 - rx + 6} ${cy - ry + 6} L${32 - rx + 8} ${cy - ry - 7} L${32 - rx + 17} ${cy - ry + 2} Z" fill="${deco.main}"/>`;
    parts += `<path d="M${32 + rx - 6} ${cy - ry + 6} L${32 + rx - 8} ${cy - ry - 7} L${32 + rx - 17} ${cy - ry + 2} Z" fill="${deco.main}"/>`;
  }
  parts += `<ellipse cx="32" cy="${cy}" rx="${rx}" ry="${ry}" fill="${deco.main}"/>`;
  if (stage >= 2) parts += `<ellipse cx="32" cy="${cy + 6}" rx="${rx - 9}" ry="${ry - 9}" fill="${deco.belly}"/>`;
  if (stage >= 3) {
    parts += `<circle cx="${32 - rx + 8}" cy="${cy + 3}" r="3" fill="#FFB3A1"/><circle cx="${32 + rx - 8}" cy="${cy + 3}" r="3" fill="#FFB3A1"/>`;
  }
  if (stage >= 4) {
    parts += `<path d="M22 ${cy - ry + 3} L24 ${cy - ry - 8} L28 ${cy - ry - 2} L32 ${cy - ry - 10} L36 ${cy - ry - 2} L40 ${cy - ry - 8} L42 ${cy - ry + 3} Z" fill="#F5B21B" stroke="#C98A00" stroke-width="1"/>`;
  }
  const eyeDx = 9;
  parts += `<circle cx="${32 - eyeDx}" cy="${eyeY}" r="4.6" fill="#fff"/><circle cx="${32 + eyeDx}" cy="${eyeY}" r="4.6" fill="#fff"/>`;
  parts += `<circle cx="${32 - eyeDx + 1}" cy="${eyeY + 1}" r="2.3" fill="#3B2F2A"/><circle cx="${32 + eyeDx + 1}" cy="${eyeY + 1}" r="2.3" fill="#3B2F2A"/>`;
  const my = cy + 5;
  if (mood === 'cheer') {
    parts += `<path d="M25 ${my} Q32 ${my + 11} 39 ${my} Z" fill="#8A2E1C"/>`;
  } else if (mood === 'think') {
    parts += `<path d="M27 ${my + 3} L37 ${my + 3}" stroke="#3B2F2A" stroke-width="2.2" stroke-linecap="round"/>`;
  } else {
    parts += `<path d="M26 ${my} Q32 ${my + 7} 38 ${my}" stroke="#3B2F2A" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  }
  parts += deco.cheek + deco.eyes + deco.neck + deco.head;   // おしゃれの かざり
  if (perk) {
    const by = cy + ry - 2;
    parts += `<path d="M32 ${by} L23 ${by - 5} L23 ${by + 5} Z" fill="#FF6F91"/><path d="M32 ${by} L41 ${by - 5} L41 ${by + 5} Z" fill="#FF6F91"/><circle cx="32" cy="${by}" r="2.6" fill="#E0446C"/>`;
    parts += sparkles;
    if (perk.crown) parts += crownAt(cy - ry + 3);
  }
  return open(parts);
}

// ---- バッジ ----
function playerBestStreak() {
  return Math.max(loadDayStreak().best, currentDayStreak());
}

function computeBadges() {
  const p = loadPet();
  const best = playerBestStreak();
  return [
    { icon: '🌱', label: 'はじめの いっぽ',   hint: 'はじめて せいかいする',   got: p.xp >= 1 },
    { icon: '🔥', label: '3日れんぞく',       hint: '3日つづけて べんきょう',  got: best >= 3 },
    { icon: '🌟', label: '7日れんぞく',       hint: '7日つづけて べんきょう',  got: best >= 7 },
    { icon: '👑', label: '30日れんぞく',      hint: '30日つづけて べんきょう', got: best >= 30 },
    { icon: '💯', label: '100もん せいかい',  hint: 'ぜんぶで 100もん',        got: p.xp >= 100 },
    { icon: '🏅', label: '500もん せいかい',  hint: 'ぜんぶで 500もん',        got: p.xp >= 500 },
    { icon: '🎯', label: 'パーフェクト',      hint: '5もん以上で ぜんぶ せいかい', got: p.perfects >= 1 },
    { icon: '📅', label: 'ミッション 5かい',  hint: 'きょうのミッションを5回',  got: p.missions >= 5 },
    { icon: '💪', label: 'にがて そつぎょう', hint: 'にがてを 10もん クリア',   got: p.cleared >= 10 }
  ];
}
