// ===== ポコ（育てるキャラ）・コイン・バッジ =====

// ポコは「毎日つづけること」で そだつ。たくさん やっても、すぐには進化しない（やりすぎても、やめても よい）。
// そだちポイント：その日はじめて べんきょうした +1／その日 15もん せいかいした +1／きょうのミッションぜんぶ +1
// ＋「ポコの ごはん」（300コイン＝+1・1日2かい・3つ そろえたあと）と、ポコクエストの ラスボス（+5）。れんぞく日数も「3つ そろった日」だけ（js/bonus.js）
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
  if (typeof petPaid === 'function') petPaid(p);   // もらった ボーナスの きろく（js/bonus.js）
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

// ごほうびを加算する。進化したかどうかも返す。levelKey：昇段したとき（教科・学年・レベル）の しるし。
function awardPet({ xp = 0, coins = 0, perfect = false, mission = false, cleared = 0, levelKey = '' }) {
  const p = loadPet();
  const before = petStage(p.growth);
  const paid = petPaid(p);
  const bonuses = [];   // 画面に 見せる ボーナス：{ label, coins }
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

  // そだちポイント 3つ そろった日だけ、れんぞく日数に かぞえる（ボーナスも ここで）
  if (day.base && day.amount && day.mission && !day.counted) {
    day.counted = true;
    const st = touchDayStreak();
    Object.keys(STREAK_BONUS).map(Number).sort((a, b) => a - b).forEach(m => {
      const k = String(m);
      if (st.count >= m && !paid.streak.includes(k)) {
        paid.streak.push(k);
        p.coins += STREAK_BONUS[m];
        bonuses.push({ label: `${m}日れんぞく ボーナス`, coins: STREAK_BONUS[m] });
      }
    });
  }
  // 昇段ボーナス（教科・学年・レベルごとに 1かい）
  if (levelKey && !paid.level.includes(levelKey)) {
    paid.level.push(levelKey);
    p.coins += LEVEL_BONUS;
    bonuses.push({ label: 'しょうだん ボーナス', coins: LEVEL_BONUS });
  }
  writeJSON(petKey(), p);
  // バッジの ボーナス（いままで もっていた バッジにも、1かいだけ）
  const bb = settleBadgeBonus();
  if (bb.coins > 0) bonuses.push({ label: `あたらしい バッジ ${bb.labels.length}こ`, coins: bb.coins });

  const fresh = loadPet();
  const after = petStage(fresh.growth);
  return { pet: fresh, before, after, levelUp: after > before, gain, bonuses };
}

// ポコの絵。stage: 0=たまご 1〜4=せいちょう / mood: happy | cheer | think
// opts：{ noEvolve: true } なら「きらきらポコ」を つけていても 1だん しんかした すがたに しない（ずかん・けっか画面用）
// look：おしゃれの かざり（場所 → id）。省くと いまの子が つけているもの、null で なし
function perkStar(x, y, r, fill) {
  const k = r * 0.28;
  return `<path d="M${x} ${y - r} L${x + k} ${y - k} L${x + r} ${y} L${x + k} ${y + k} L${x} ${y + r} L${x - k} ${y + k} L${x - r} ${y} L${x - k} ${y - k} Z" fill="${fill || '#FFD43B'}"/>`;
}

let petSvgSeq = 0;
function petSVG(stage, mood = 'happy', size = 64, opts, look) {
  if (look === undefined) look = (typeof shopLook === 'function') ? shopLook() : null;
  // 「きらきらポコ」（ポコクエストの プレゼント）を つけている間は、1だん しんかした すがたで 見える（ポコキングは そのまま）。
  // ほんとうの 育ち具合（growth）は かわらない
  const realStage = stage;   // ほんとうの 育ち（からだが つくのは、ほんとうに ポコまる・ポコキングに そだったときだけ）
  if (look && look.shine && !(opts && opts.noEvolve) && stage < 4) stage += 1;
  const withBody = realStage >= 3 && typeof pokoBodySVG === 'function';   // きらきらポコで 見かけが しんかしても、からだは まだ つかない
  const w = size;
  const h = Math.round(size * 0.94);
  const uid = ++petSvgSeq;   // この 絵だけの ばんごう
  const open = (inner) =>
    `<svg width="${w}" height="${h}" viewBox="0 0 64 60" role="img" aria-label="マスコットのポコ" xmlns="http://www.w3.org/2000/svg">${inner.replace(/pokoRainbow|pokoAura/g, m => m + '_' + uid)}</svg>`;

  if (stage === 0) {
    return open(
      '<ellipse cx="32" cy="34" rx="19" ry="23" fill="#FFF3D6" stroke="#E8D5A8" stroke-width="2"/>' +
      '<circle cx="25" cy="28" r="3.2" fill="#B8EBDD"/><circle cx="38" cy="38" r="4" fill="#B8EBDD"/><circle cx="30" cy="45" r="2.4" fill="#B8EBDD"/>' +
      '<path d="M22 22 L28 26 L32 20 L37 26 L42 22" stroke="#E8D5A8" stroke-width="2" fill="none" stroke-linejoin="round"/>'
    );
  }

  const rx = [0, 20, 23, 25, 26][stage];
  const ry = [0, 16, 19, 21, 22][stage];
  const cy = 60 - ry - 3;
  const eyeY = cy - 4;
  const g = { rx, ry, cy, eyeY, y0: cy - ry };
  if (withBody) g.bodyG = { rx: 15, ry: 13, cy: 40, y0: 27 };   // マント・つばさは からだに あわせる
  const deco = (typeof shopDraw === 'function') ? shopDraw(look, g) : { back: '', aura: '', glow: '', wing: '', cape: '', defs: '', main: '#5CC9B0', belly: '#B8EBDD', eyes: '', cheek: '', mouth: '', neck: '', head: '', bow: '', sparkles: '', crown: '', outfit: '', shoes: '', hand: '' };
  const bg = deco.defs + deco.back + deco.aura + deco.glow;
  let parts = '';
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
  parts += deco.cheek + deco.mouth + deco.eyes + deco.neck + deco.head;   // おしゃれの かざり

  if (!withBody) {
    return open(bg + deco.wing + deco.cape + parts + deco.bow + deco.sparkles + deco.crown);   // プレゼント（きらきら・王冠）
  }
  // からだ つき：あたまを 小さく して 上に のせ、したに からだ・うで・あしを かく
  const S = stage === 4 ? 0.64 : 0.67;
  const ty = stage === 4 ? -1 : -1.5;
  const headG = `<g transform="translate(${(32 * (1 - S)).toFixed(2)} ${ty}) scale(${S})">${parts}${deco.bow}${deco.crown}</g>`;
  return open(bg + deco.wing + deco.cape + pokoBodySVG(deco, mood, !!deco.hand) + headG + deco.hand + deco.sparkles);
}

// ---- バッジ ----
function playerBestStreak() {
  return Math.max(loadDayStreak().best, currentDayStreak());
}

// 「ちょうむずかしい」に 1つでも 上がったか
function reachedSuperLevel() {
  const prefix = `manabi_diff_${playerTag()}_`;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.indexOf(prefix) === 0 && localStorage.getItem(k) === '3') return true;
  }
  return false;
}

// 教科ごとの せいかい数（ぜんぶの 学年を あわせて）
function subjectCorrectTotal(subject) {
  const head = `manabi_progress_${playerTag()}_g`;   // 名前の 記号を 気にしなくて よい よう、文字の まえと うしろで しらべる
  const tail = `_${subject}`;
  let n = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.indexOf(head) === 0 && k.endsWith(tail) && /^\d+$/.test(k.slice(head.length, k.length - tail.length))) { try { n += (JSON.parse(localStorage.getItem(k)) || {}).correct || 0; } catch (e) { /* 無視 */ } }
  }
  return n;
}

// 「ちょうむずかしい」に 上がった 教科・学年の 数
function superLevelCount() {
  const prefix = `manabi_diff_${playerTag()}_`;
  let n = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.indexOf(prefix) === 0 && localStorage.getItem(k) === '3') n++;
  }
  return n;
}

function computeBadges() {
  const p = loadPet();
  const best = playerBestStreak();
  const owned = (typeof shopOwnedCount === 'function') ? shopOwnedCount() : 0;
  return [
    { icon: '🌱', label: 'はじめの いっぽ',   hint: 'はじめて せいかいする',   got: p.xp >= 1 },
    { icon: '🔥', label: '3日れんぞく',       hint: '3日つづけて べんきょう',  got: best >= 3 },
    { icon: '🌟', label: '7日れんぞく',       hint: '7日つづけて べんきょう',  got: best >= 7 },
    { icon: '👑', label: '30日れんぞく',      hint: '30日つづけて べんきょう', got: best >= 30 },
    { icon: '💯', label: '100もん せいかい',  hint: 'ぜんぶで 100もん',        got: p.xp >= 100 },
    { icon: '🏅', label: '500もん せいかい',  hint: 'ぜんぶで 500もん',        got: p.xp >= 500 },
    { icon: '🎯', label: 'パーフェクト',      hint: '5もん以上で ぜんぶ せいかい', got: p.perfects >= 1 },
    { icon: '📅', label: 'ミッション 5かい',  hint: 'きょうのミッションを5回',  got: p.missions >= 5 },
    { icon: '💪', label: 'にがて そつぎょう', hint: 'にがてを 10もん クリア',   got: p.cleared >= 10 },
    // ---- ふやした バッジ（つぎの もくひょう）----
    { icon: '🥈', label: '1000もん せいかい', hint: 'ぜんぶで 1000もん',        got: p.xp >= 1000 },
    { icon: '🥇', label: '3000もん せいかい', hint: 'ぜんぶで 3000もん',        got: p.xp >= 3000 },
    { icon: '✨', label: '14日れんぞく',      hint: '14日つづけて べんきょう',  got: best >= 14 },
    { icon: '🎖️', label: 'パーフェクト 10かい', hint: 'パーフェクトを 10回',   got: p.perfects >= 10 },
    { icon: '📆', label: 'ミッション 30かい', hint: 'きょうのミッションを30回', got: p.missions >= 30 },
    { icon: '🦾', label: 'にがて めいじん',   hint: 'にがてを 50もん クリア',   got: p.cleared >= 50 },
    { icon: '🛍️', label: 'おしゃれさん',      hint: 'おしゃれを 10こ もつ',     got: owned >= 10 },
    { icon: '🐾', label: 'ポコまるに しんか', hint: 'ポコまる いじょうに そだてる', got: petStage(p.growth) >= 3 },
    { icon: '🔥', label: 'ちょうむずかしい',  hint: '「ちょうむずかしい」に すすむ', got: reachedSuperLevel() },
    // ---- さらに ふやした バッジ（たかい もくひょう）----
    { icon: '💎', label: '5000もん せいかい',  hint: 'ぜんぶで 5000もん',        got: p.xp >= 5000 },
    { icon: '🏆', label: '10000もん せいかい', hint: 'ぜんぶで 10000もん',       got: p.xp >= 10000 },
    { icon: '🌈', label: '50日れんぞく',       hint: '50日つづけて べんきょう',  got: best >= 50 },
    { icon: '🎆', label: 'パーフェクト 30かい', hint: 'パーフェクトを 30回',     got: p.perfects >= 30 },
    { icon: '🔢', label: 'さんすう はかせ',    hint: 'さんすうを 1000もん せいかい', got: subjectCorrectTotal('math') >= 1000 },
    { icon: '✏️', label: 'こくご はかせ',      hint: 'こくごを 1000もん せいかい', got: subjectCorrectTotal('kanji') >= 1000 },
    { icon: '🔤', label: 'えいご はかせ',      hint: 'えいごを 1000もん せいかい', got: subjectCorrectTotal('eigo') >= 1000 },
    { icon: '🐲', label: 'ポコキングに しんか', hint: 'ポコキングまで そだてる', got: petStage(p.growth) >= 4 },
    { icon: '🔥', label: 'ちょうむずかしい 3つ', hint: '「ちょうむずかしい」に 3つ すすむ', got: superLevelCount() >= 3 }
  ];
}
