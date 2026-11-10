// ===== ポコクエスト（家族ミッション）：土曜〜金曜の1週間で、みんなで 1000もん（ヒントなしの せいかい）=====
// 達成したら、つぎの1週間、3人とも ポコが「とくべつな すがた」に。
// その週に いちばん せいかいが 多かった子には、さらに 王冠。
// 数えかた：ヒントを つかわずに 自力で せいかいした数（1人ずつ、週ごとに保存。あいことばの同期で 3人ぶんが あつまる）

const WEEKLY_GOAL = 1000;
const WEEKLY_START = '2026-11-07';   // さいしょの週の はじまり（土）。これより前は 数えない
// この日から ポコクエストを おやすみする（しばらく ようすを 見る）。もういちど はじめる ときは、この 日付を ずっと あとに するか '' に する
const WEEKLY_PAUSE_FROM = '2026-11-14';
const WEEKLY_KEEP = 60;              // 保存する週の数（ウラボスキラーの かずを 数えるため ながめに）

// その日をふくむ週の はじまり（土曜日）の日付
function weekStartOf(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dow = new Date(y, m - 1, d).getDay();   // 日0 月1 … 土6
  return addDaysStr(dateStr, -((dow + 1) % 7));
}

function weekKey(name) { return `manabi_week_${playerTag(name)}`; }

function loadWeekCounts(name) {
  const o = readJSON(weekKey(name), {});
  return o && typeof o === 'object' && !Array.isArray(o) ? o : {};
}

// ヒントなしで せいかいしたとき 1つ ふやす
function addWeeklyCorrect() {
  const w = weekStartOf(localDateStr());
  if (w < WEEKLY_START) return;
  if (WEEKLY_PAUSE_FROM && w >= WEEKLY_PAUSE_FROM) return;   // おやすみ中は かぞえない
  const o = loadWeekCounts();
  o[w] = (o[w] || 0) + 1;
  const keys = Object.keys(o).sort();
  while (keys.length > WEEKLY_KEEP) delete o[keys.shift()];
  writeJSON(weekKey(), o);
}

function weeklyPlayers() {
  const names = loadPlayerNames().map(n => String(n).trim()).filter(Boolean);
  const cur = (state.playerName || '').trim();
  if (cur && !names.includes(cur)) names.push(cur);
  return names;
}

// その週の ひとりずつの数と ごうけい
function weekTally(weekStart) {
  const rows = weeklyPlayers().map(name => ({ name, n: loadWeekCounts(name)[weekStart] || 0 }));
  rows.sort((a, b) => b.n - a.n);
  return { rows, total: rows.reduce((s, r) => s + r.n, 0) };
}

// いまの週のようす
function weeklyStatus() {
  const start = weekStartOf(localDateStr());
  const end = addDaysStr(start, 6);
  const started = start >= WEEKLY_START;
  const t = started ? weekTally(start) : { rows: weeklyPlayers().map(name => ({ name, n: 0 })), total: 0 };
  const me = (state.playerName || '').trim();
  const mine = (t.rows.find(r => r.name === me) || { n: 0 }).n;
  const bi = started ? bossInfo(start, t.total) : bossInfo(WEEKLY_START, 0);
  return {
    paused: !!(WEEKLY_PAUSE_FROM && start >= WEEKLY_PAUSE_FROM),
    start, end, started, rows: t.rows, total: t.total, mine, goal: WEEKLY_GOAL,
    left: Math.max(0, WEEKLY_GOAL - t.total), achieved: t.total >= WEEKLY_GOAL,
    boss: started ? bi.boss : null, revealed: bi.revealed, defeated: bi.defeated, hpLeft: bi.hpLeft,
    last: started ? bi.last : null, lastRevealed: bi.lastRevealed, lastDefeated: bi.lastDefeated, lastHpLeft: bi.lastHpLeft
  };
}

// ===== クエストごとの いろ（プレゼントは まいかい ちがう いろ。8しゅうで ひとまわり）=====
const QUEST_COLORS = [
  { name: 'きん',     main: '#F5B21B', dark: '#C98A00', gem: '#E5484D', tint: '#FFE7A0' },
  { name: 'ぎん',     main: '#D1D5DB', dark: '#6B7280', gem: '#3B82F6', tint: '#E5E7EB' },
  { name: 'あか',     main: '#F87171', dark: '#991B1B', gem: '#FDE047', tint: '#FECACA' },
  { name: 'あお',     main: '#60A5FA', dark: '#1D4ED8', gem: '#FDE047', tint: '#BFDBFE' },
  { name: 'みどり',   main: '#4ADE80', dark: '#15803D', gem: '#FB7185', tint: '#BBF7D0' },
  { name: 'ピンク',   main: '#F9A8D4', dark: '#BE185D', gem: '#FDE047', tint: '#FBCFE8' },
  { name: 'むらさき', main: '#C4B5FD', dark: '#6D28D9', gem: '#FDE047', tint: '#DDD6FE' },
  { name: 'オレンジ', main: '#FDBA74', dark: '#C2410C', gem: '#3B82F6', tint: '#FED7AA' }
];

function questNumber(weekStart) {
  if (weekStart < WEEKLY_START) return 1;
  return weekIndex(weekStart) - weekIndex(WEEKLY_START) + 1;
}

function questColor(n) {
  const len = QUEST_COLORS.length;
  return QUEST_COLORS[(((n - 1) % len) + len) % len];
}

// ===== ウラボス：1000もん たっせいの あと、とつぜん あらわれる（ひみつ）=====
// ウラボス HP 500（＝1000もんの あと、さらに 500もん）。たおすと マントの プレゼント、「ウラボスキラー」の しょうごう。
// ラスボス：ウラボスを たおすと あらわれる。ごうけい 3000もん（あと 1500もん）。たおすと つばさの プレゼント、「ラスボスキラー」。
// さいしょの週は かならず あらわれる。そのあとは 2週に1回くらい（週ごとに きまる。どの たんまつでも おなじ）
const BOSS_HP = 500;
const LAST_BOSS_TOTAL = 3000;                    // ラスボスを たおす ごうけいの もんだい数
const LAST_BOSS_HP = LAST_BOSS_TOTAL - (WEEKLY_GOAL + BOSS_HP);
const BOSSES = [
  { name: 'ウラ・ドラゴン', emoji: '🐉' },
  { name: 'ウラ・ゴースト', emoji: '👻' },
  { name: 'ウラ・ロボ', emoji: '🤖' },
  { name: 'ウラ・クラーケン', emoji: '🐙' },
  { name: 'ウラ・まおう', emoji: '👿' },
  { name: 'ウラ・ゴーレム', emoji: '🗿' },
  { name: 'ウラ・ティラノ', emoji: '🦖' }
];
const LAST_BOSSES = [
  { name: 'ブラック・ドラゴン', emoji: '🐲' },
  { name: 'ダーク・ゴースト', emoji: '💀' },
  { name: 'デス・ロボ', emoji: '👾' },
  { name: 'だいおう クラーケン', emoji: '🦑' },
  { name: 'だいまおう', emoji: '😈' },
  { name: 'キング・ゴーレム', emoji: '🗿' },
  { name: 'ティラノ・キング', emoji: '🦖' }
];

function weekIndex(weekStart) {
  const [y, m, d] = weekStart.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 604800000);
}

// その週に ウラボスが いるか（いなければ null）
function weekBoss(weekStart) {
  if (weekStart < WEEKLY_START) return null;
  const first = weekStart === WEEKLY_START;
  const n = weekIndex(weekStart);
  if (!first && ((Math.imul(n, 2654435761) >>> 16) & 1) !== 0) return null;
  const idx = first ? 0 : (Math.imul(n, 40503) >>> 8) % BOSSES.length;
  return Object.assign({ hp: BOSS_HP, idx }, BOSSES[idx]);
}

// その週に ラスボスが いるか（ウラボスが いる週だけ）
function weekLastBoss(weekStart) {
  const boss = weekBoss(weekStart);
  if (!boss) return null;
  return Object.assign({ hp: LAST_BOSS_HP }, LAST_BOSSES[boss.idx % LAST_BOSSES.length]);
}

// いまの週の ボスの ようす（まだ あらわれていなければ revealed=false）
function bossInfo(start, total) {
  const boss = weekBoss(start);
  if (!boss) return { boss: null, revealed: false, defeated: false, hpLeft: 0, last: null, lastRevealed: false, lastDefeated: false, lastHpLeft: 0 };
  const last = weekLastBoss(start);
  const damage = Math.min(boss.hp, Math.max(0, total - WEEKLY_GOAL));
  const defeated = total >= WEEKLY_GOAL + boss.hp;
  const lastDamage = Math.min(last.hp, Math.max(0, total - (WEEKLY_GOAL + boss.hp)));
  return {
    boss, revealed: total >= WEEKLY_GOAL, defeated, hpLeft: boss.hp - damage,
    last, lastRevealed: defeated, lastDefeated: total >= LAST_BOSS_TOTAL, lastHpLeft: last.hp - lastDamage
  };
}

// これまでに たおした ウラボス／ラスボス
function bossHistory() {
  const out = [];
  const today = weekStartOf(localDateStr());
  for (let ws = WEEKLY_START; ws <= today; ws = addDaysStr(ws, 7)) {
    const boss = weekBoss(ws);
    if (boss && weekTally(ws).total >= WEEKLY_GOAL + boss.hp) out.push({ week: ws, name: boss.name, emoji: boss.emoji });
  }
  return out;
}

function lastBossHistory() {
  const out = [];
  const today = weekStartOf(localDateStr());
  for (let ws = WEEKLY_START; ws <= today; ws = addDaysStr(ws, 7)) {
    const last = weekLastBoss(ws);
    if (last && weekTally(ws).total >= LAST_BOSS_TOTAL) out.push({ week: ws, name: last.name, emoji: last.emoji });
  }
  return out;
}

// ===== プレゼント：もらったら ずっと「きがえ」で つけはずし できる =====
//  きらきらポコ … 1000もん たっせい（みんな）／マント … ウラボスを たおした（みんな）／つばさ … ラスボスを たおした（みんな）
//  おうかん … その週の せいかい 1い（その子だけ。週が おわってから）
// いろは クエストごとに ちがう（同じものは 手に はいらない）
function weekEndPassed(weekStart) {   // その週が おわって、そのあと この たんまつが どうきしたか
  const code = (typeof getActiveSyncCode === 'function') ? getActiveSyncCode() : '';
  if (!code) return true;
  const last = Date.parse(localStorage.getItem('manabi_lastsync') || '');
  const [y, m, d] = addDaysStr(weekStart, 7).split('-').map(Number);
  return Number.isFinite(last) && last >= new Date(y, m - 1, d).getTime();
}

// プレゼントを わたして、いまの子に あたらしく とどいた id の 一覧を かえす
let lastQuestNotes = [];   // いまの子に とどいた コイン・そだちポイントの おしらせ
function grantQuestGifts() {
  const me = (state.playerName || '').trim();
  lastQuestNotes = [];
  const today = weekStartOf(localDateStr());
  const players = weeklyPlayers();
  const got = [];
  const give = (id, names) => names.forEach(nm => { if (grantShopItem(id, nm) && nm === me) got.push(id); });
  // コイン・そだちポイントの ボーナス（みんなに。1人 1かいずつ）
  const bonus = (key, coins, growth, label, names) => names.forEach(nm => { if (payQuestBonus(nm, key, coins, growth) && nm === me) lastQuestNotes.push(label); });
  for (let ws = WEEKLY_START; ws <= today && !(WEEKLY_PAUSE_FROM && ws >= WEEKLY_PAUSE_FROM); ws = addDaysStr(ws, 7)) {
    const t = weekTally(ws);
    const n = questNumber(ws);
    const boss = weekBoss(ws), last = weekLastBoss(ws);
    if (t.total >= WEEKLY_GOAL) { give(`shine:${n}`, players); bonus(`${n}:goal`, QUEST_BONUS, 0, `たっせい ボーナス +${QUEST_BONUS}コイン`, players); }
    if (boss && t.total >= WEEKLY_GOAL + boss.hp) { give(`cape:${n}`, players); bonus(`${n}:boss`, QUEST_BONUS, 0, `ウラボス げきは ボーナス +${QUEST_BONUS}コイン`, players); }
    if (last && t.total >= LAST_BOSS_TOTAL) { give(`wing:${n}`, players); bonus(`${n}:last`, QUEST_BONUS, LAST_BOSS_GROWTH, `ラスボス げきは ボーナス +${QUEST_BONUS}コイン と そだちポイント +${LAST_BOSS_GROWTH}`, players); }
    if (ws < today && t.total >= WEEKLY_GOAL && weekEndPassed(ws)) {
      const top = t.rows.length ? t.rows[0].n : 0;
      if (top > 0) give(`crown:${n}`, t.rows.filter(r => r.n === top).map(r => r.name));
    }
  }
  return got;
}

function announceGifts(ids) {
  const names = ids.map(id => (shopItem(id) || {}).name).filter(Boolean);
  const notes = lastQuestNotes.splice(0);
  if (names.length === 0 && notes.length === 0) return false;
  setTimeout(() => askConfirm(
    `🎁 ポコクエストの プレゼントが とどいたよ！\n\n${names.concat(notes).join('\n')}${names.length ? '\n\n「おしゃれ」の「きがえ」で ずっと つけられるよ！' : ''}`,
    'おしゃれへ', 'あとで', () => { shopMode = 'dress'; showTab('shop'); }), 500);
  return true;
}

// とうじょう・げきは の えんしゅつ（この たんまつ・この子で 1かいだけ。1かいに ひとつずつ）
function checkBossReveal(w) {
  if (!w.started || !w.boss || !w.revealed) return;
  const key = `manabi_bossseen_${playerTag()}_${w.start}`;
  const seen = localStorage.getItem(key) || '';
  const steps = [
    { f: 'a', ok: w.revealed,
      text: `…ゴゴゴゴ…\n\n${w.boss.emoji} ウラボス「${w.boss.name}」が あらわれた！\n\nみんなで ${w.boss.hp}ダメージ あたえて たおせ！\n（せいかい 1もん ＝ 1ダメージ）` },
    { f: 'd', ok: w.defeated,
      text: `🎉 ${w.boss.emoji} ${w.boss.name}を たおした！！\nみんなの ちからだ！\nごほうびに マントを プレゼント！\nさらに ${QUEST_BONUS}コインも！\n「ウラボスキラー」の しょうごうも ゲット！` },
    { f: 'l', ok: w.lastRevealed,
      text: `…ゴゴゴゴゴゴ…\n\n${w.last ? w.last.emoji : ''} ラスボス「${w.last ? w.last.name : ''}」が あらわれた！！\n\nここまで きた きみたちなら たおせる！\nあと ${w.last ? w.last.hp : 0}ダメージ！（ごうけい ${LAST_BOSS_TOTAL}もん）` },
    { f: 'z', ok: w.lastDefeated,
      text: `🎉🎉 ラスボス ${w.last ? w.last.emoji : ''} ${w.last ? w.last.name : ''}を たおした！！\nでんせつの ゆうしゃだ！\nごほうびに つばさを プレゼント！\nさらに ${QUEST_BONUS}コインと\nそだちポイント +${LAST_BOSS_GROWTH}も！\n「ラスボスキラー」の しょうごうも ゲット！` }
  ];
  // 見ていない えんしゅつが いくつか たまっていたら、いちばん あたらしい 1つだけ 見せる（ぜんぶ 見たことに する）
  const pending = steps.filter(s => s.ok && seen.indexOf(s.f) < 0);
  if (pending.length === 0) return;
  const step = pending[pending.length - 1];
  try { localStorage.setItem(key, seen + pending.map(s => s.f).join('')); } catch (e) { /* 無視 */ }
  setTimeout(() => askConfirm(step.text, 'おう！', 'あとで', () => {}), 400);
}

// ホームの ボスの パネル（ラスボスが あらわれたら ラスボスを 見せる）
function appendBossPanel(card, w) {
  if (!w.boss || !w.revealed) return;
  const isLast = !!(w.last && w.lastRevealed);
  const b = isLast ? w.last : w.boss;
  const done = isLast ? w.lastDefeated : w.defeated;
  const hpLeft = isLast ? w.lastHpLeft : w.hpLeft;
  const panel = el('div', 'boss-panel' + (isLast ? ' last' : '') + (done ? ' defeated' : ''));
  const head = el('div', 'boss-head');
  head.appendChild(el('span', 'boss-emoji', b.emoji));
  head.appendChild(el('span', 'boss-name', `${isLast ? 'ラスボス' : 'ウラボス'} ${b.name}`));
  panel.appendChild(head);
  if (isLast) panel.appendChild(el('div', 'boss-sub', `✓ ウラボス ${w.boss.name} は たおしたよ`));
  if (done) {
    panel.appendChild(el('div', 'boss-note', '🎉 ラスボスを たおした！ つばさを プレゼント！'));
  } else {
    panel.appendChild(el('div', 'boss-hp-text', `HP ${hpLeft} / ${b.hp}`));
    const bar = el('div', 'boss-bar');
    const fill = el('div', 'boss-fill');
    fill.style.width = `${Math.round((hpLeft / b.hp) * 100)}%`;
    bar.appendChild(fill);
    panel.appendChild(bar);
    panel.appendChild(el('div', 'boss-note', `せいかい 1もん ＝ 1ダメージ！ みんなで たおそう（${mdLabel(addDaysStr(w.start, 6))}まで）`));
  }
  card.appendChild(panel);
}

// しょうごう（たおした ウラボス・ラスボスの かず）
function appendBossTitle(card) {
  const hist = bossHistory();
  if (hist.length > 0) card.appendChild(el('div', 'boss-title', `🏅 ウラボスキラー（${hist.length}たい）　${hist.map(h => h.emoji).join('')}`));
  const lh = lastBossHistory();
  if (lh.length > 0) card.appendChild(el('div', 'boss-title', `🏅 ラスボスキラー（${lh.length}たい）　${lh.map(h => h.emoji).join('')}`));
}

// おうちの人の画面：ポコクエストの ようす（ボスの ネタバレつき。子どもには ひみつ）
function appendFamilyParent(root) {
  const w = weeklyStatus();
  const panel = el('div', 'panel');
  panel.appendChild(el('h3', null, '🏆 ポコクエスト'));
  if (w.paused) {
    panel.appendChild(el('div', 'report-line', '🌙 いまは おやすみ中です（11/14から。ようすを 見て また はじめます）'));
    const h1 = bossHistory(), h2 = lastBossHistory();
    if (h1.length) panel.appendChild(el('div', 'report-line', `🏅 たおした ウラボス：${h1.length}たい ${h1.map(h => h.emoji + h.name).join('、')}`));
    if (h2.length) panel.appendChild(el('div', 'report-line', `🏅 たおした ラスボス：${h2.length}たい ${h2.map(h => h.emoji + h.name).join('、')}`));
    root.appendChild(panel);
    return;
  }
  if (!w.started) {
    panel.appendChild(el('div', 'report-line', `${mdLabel(WEEKLY_START)}（土）から スタート`));
    root.appendChild(panel);
    return;
  }
  const n = questNumber(w.start), color = questColor(n);
  panel.appendChild(el('div', 'report-line', `だい${n}かい（${color.name}）${mdLabel(w.start)}〜${mdLabel(w.end)}：みんなで ${w.total} / ${w.goal} もん（あと ${w.left}）`));
  w.rows.forEach(r => panel.appendChild(el('div', 'report-line', `　${r.name}：${r.n}もん`)));
  const boss = weekBoss(w.start), last = weekLastBoss(w.start);
  panel.appendChild(el('div', 'report-line', boss
    ? `🤫 ボス（子どもには ひみつ）：この週は ${boss.emoji} ${boss.name}（${w.goal}もんで とうじょう・ごうけい ${w.goal + boss.hp}で げきは）→ ${last.emoji} ラスボス ${last.name}（ごうけい ${LAST_BOSS_TOTAL}で げきは）が でます`
    : '🤫 ボス（子どもには ひみつ）：この週は でません'));
  panel.appendChild(el('div', 'report-line', `🎁 プレゼント：きらきらポコ＝${w.goal}もん／マント＝ウラボス／つばさ＝ラスボス／おうかん＝週の 1い（その子だけ）。「きがえ」で ずっと つけられます。いろは まいかい ちがいます`));
  const hist = bossHistory(), lh = lastBossHistory();
  if (hist.length) panel.appendChild(el('div', 'report-line', `🏅 たおした ウラボス：${hist.length}たい ${hist.map(h => h.emoji + h.name).join('、')}`));
  if (lh.length) panel.appendChild(el('div', 'report-line', `🏅 たおした ラスボス：${lh.length}たい ${lh.map(h => h.emoji + h.name).join('、')}`));
  root.appendChild(panel);
}

// ずかんや しんかの ひょうじ用：「きらきらポコ」でも 1だん しんかした すがたに しない
function weeklyPerkStatic() {
  return { noEvolve: true };
}

function mdLabel(dateStr) {
  const [, m, d] = dateStr.split('-').map(Number);
  return `${m}/${d}`;
}

// 勉強中の画面の、小さな ひょうじ
function updateWeekChip() {
  const chip = byId('quiz-week');
  if (!chip) return;
  const w = weeklyStatus();
  if (!w.started || w.paused) { chip.classList.add('hidden'); return; }
  if (w.boss && w.revealed && w.last && w.lastRevealed) {
    chip.textContent = w.lastDefeated
      ? `🎉 ラスボスを たおした！ ／ じぶん ${w.mine}もん`
      : `${w.last.emoji} ラスボス ${w.last.name} HP ${w.lastHpLeft}/${w.last.hp} ／ じぶん ${w.mine}もん`;
  } else if (w.boss && w.revealed) {
    chip.textContent = `${w.boss.emoji} ${w.boss.name} HP ${w.hpLeft}/${w.boss.hp} ／ じぶん ${w.mine}もん`;
  } else {
    chip.textContent = w.achieved
      ? `🎉 みんなで ${w.total}もん！ たっせい！ ／ じぶん ${w.mine}もん`
      : `こんしゅう じぶん ${w.mine}もん ／ みんなで ${w.total}もん（あと ${w.left}）`;
  }
  chip.classList.remove('hidden');
}

// ホームの カード
function renderFamilyCard(body) {
  const w = weeklyStatus();
  if (w.paused) {   // おやすみ中：さいごの週の プレゼント（おうかんなど）は とどける
    const rest = el('div', 'family-card');
    const rh = el('div', 'family-head');
    rh.appendChild(el('div', 'family-title', '🏆 ポコクエスト'));
    rest.appendChild(rh);
    rest.appendChild(el('div', 'family-note', '🌙 いまは おやすみ中だよ。\nまた あたらしい ポコクエストを じゅんびするから、たのしみに まっててね！'));
    const gifts = grantQuestGifts();
    appendBossTitle(rest);
    body.appendChild(rest);
    announceGifts(gifts);
    return;
  }
  const card = el('div', 'family-card');
  const head = el('div', 'family-head');
  head.appendChild(el('div', 'family-title', '🏆 ポコクエスト'));
  const rangeStart = w.started ? w.start : WEEKLY_START;   // はじまる前は、さいしょの週を見せる
  head.appendChild(el('div', 'family-range', `${mdLabel(rangeStart)} 〜 ${mdLabel(addDaysStr(rangeStart, 6))}`));
  card.appendChild(head);

  if (!w.started) {
    const tomorrow = addDaysStr(localDateStr(), 1) === WEEKLY_START;
    card.appendChild(el('div', 'family-note', `${tomorrow ? 'あした ' : ''}${mdLabel(WEEKLY_START)}（土）の 0じから スタート！`));
    appendQuestGuide(card, w);
    body.appendChild(card);
    return;
  }

  card.appendChild(el('div', 'family-total', `みんなで ${w.total} / ${w.goal} もん`));
  const bar = el('div', 'fam-bar');
  const fill = el('div', 'fam-fill');
  fill.style.width = `${Math.min(100, Math.round((w.total / w.goal) * 100))}%`;
  bar.appendChild(fill);
  card.appendChild(bar);

  const me = (state.playerName || '').trim();
  const top = w.rows.length ? w.rows[0].n : 0;
  const rows = el('div', 'fam-rows');
  w.rows.forEach(r => {
    const row = el('div', 'fam-row' + (r.name === me ? ' me' : ''));
    row.appendChild(el('span', 'fam-name', `${top > 0 && r.n === top ? '👑 ' : ''}${r.name}`));
    row.appendChild(el('span', 'fam-n', `${r.n}もん`));
    rows.appendChild(row);
  });
  card.appendChild(rows);

  card.appendChild(el('div', 'family-note', w.achieved
    ? '🎉 たっせい！ とくべつな ポコ「きらきらポコ」を プレゼント！'
    : `あと ${w.left}もん！ みんなで おうえんしあって がんばろう`));

  // プレゼントを わたす → もらった ものを 見せる
  const gifts = grantQuestGifts();
  const n = questNumber(w.start);
  const mine = ['shine', 'cape', 'wing', 'crown'].map(k => `${k}:${n}`).filter(id => shopOwns(id)).map(id => shopItem(id).name);
  if (mine.length) card.appendChild(el('div', 'family-perk', `🎁 もらった プレゼント：${mine.join('、')}\n「おしゃれ」の「きがえ」で つけられるよ`));

  appendBossPanel(card, w);
  appendBossTitle(card);
  appendQuestGuide(card, w);
  body.appendChild(card);
  if (!announceGifts(gifts)) checkBossReveal(w);
}

// 「なにをして、なにが もらえるか」の せつめい（ごほうびの みほん つき）
function appendQuestGuide(card, w) {
  const guide = el('div', 'quest-guide');
  guide.appendChild(el('div', 'quest-guide-title', '📖 ポコクエストって？'));
  guide.appendChild(el('div', 'quest-guide-text',
    `1しゅうかん（土〜金）に、3人の せいかいを あわせて ${w.goal}もん めざそう！\n（ヒントを つかわずに せいかいした もんだいだけ かぞえるよ）`));
  const stage = petStage(loadPet().growth);
  const n = questNumber(w.started ? w.start : WEEKLY_START);
  const color = questColor(n);
  const rewards = el('div', 'quest-rewards');
  [
    { look: { shine: `shine:${n}` }, label: 'みんなで たっせい', sub: '1だん しんかした\nとくべつな ポコを\nプレゼント！' },
    { look: { shine: `shine:${n}`, crown: `crown:${n}` }, label: 'せいかい 1い だと', sub: 'さらに\n王冠も プレゼント！' }
  ].forEach(r => {
    const item = el('div', 'quest-reward');
    const pic = el('div', 'quest-reward-pic');
    pic.innerHTML = petSVG(stage, 'cheer', 64, null, r.look);
    item.appendChild(pic);
    item.appendChild(el('div', 'quest-reward-label', r.label));
    item.appendChild(el('div', 'quest-reward-sub', r.sub));
    rewards.appendChild(item);
  });
  guide.appendChild(rewards);
  guide.appendChild(el('div', 'quest-guide-text', `たっせい・ウラボス・ラスボスを たおすたびに ${QUEST_BONUS}コインも もらえるよ（ラスボスは そだちポイント +${LAST_BOSS_GROWTH}も！）\nもらった プレゼントは ずっと のこって、「おしゃれ」の「きがえ」で つけはずし できるよ。\nいろは ポコクエストごとに ちがうよ（こんかいは「${color.name}」）`));
  card.appendChild(guide);
}
