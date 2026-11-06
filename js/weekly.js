// ===== ポコクエスト（家族ミッション）：土曜〜金曜の1週間で、みんなで 1000もん（ヒントなしの せいかい）=====
// 達成したら、つぎの1週間、3人とも ポコが「とくべつな すがた」に。
// その週に いちばん せいかいが 多かった子には、さらに 王冠。
// 数えかた：ヒントを つかわずに 自力で せいかいした数（1人ずつ、週ごとに保存。あいことばの同期で 3人ぶんが あつまる）

const WEEKLY_GOAL = 1000;
const WEEKLY_START = '2026-11-07';   // さいしょの週の はじまり（土）。これより前は 数えない
const WEEKLY_KEEP = 8;               // 保存する週の数

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
  return { start, end, started, rows: t.rows, total: t.total, mine, goal: WEEKLY_GOAL, left: Math.max(0, WEEKLY_GOAL - t.total), achieved: t.total >= WEEKLY_GOAL };
}

// 先週 たっせいしていたら、いまの週は ポコが とくべつな すがた（1位の子は 王冠つき）
function weeklyPerk(name) {
  const who = String(name === undefined ? state.playerName : name || '').trim();
  const cur = weekStartOf(localDateStr());
  const prev = addDaysStr(cur, -7);
  if (prev < WEEKLY_START) return null;
  const t = weekTally(prev);
  if (t.total < WEEKLY_GOAL) return null;
  const top = t.rows.length ? t.rows[0].n : 0;
  const mine = t.rows.find(r => r.name === who);
  return { special: true, crown: !!mine && top > 0 && mine.n === top };
}

// ずかんや しんかの ひょうじ用：ほんとうの 育ち具合の すがたに、キラキラと 王冠だけ つける
function weeklyPerkStatic(name) {
  const perk = weeklyPerk(name);
  return perk ? Object.assign({}, perk, { noEvolve: true }) : null;
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
  if (!w.started) { chip.classList.add('hidden'); return; }
  chip.textContent = w.achieved
    ? `🎉 みんなで ${w.total}もん！ たっせい！ ／ じぶん ${w.mine}もん`
    : `こんしゅう じぶん ${w.mine}もん ／ みんなで ${w.total}もん（あと ${w.left}）`;
  chip.classList.remove('hidden');
}

// ホームの カード
function renderFamilyCard(body) {
  const w = weeklyStatus();
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
    ? '🎉 たっせい！ つぎの 1しゅうかん、みんな 1だん しんかした とくべつな ポコが てに はいるよ'
    : `あと ${w.left}もん！ みんなで おうえんしあって がんばろう`));
  const perk = weeklyPerk();
  if (perk) {
    card.appendChild(el('div', 'family-perk', perk.crown
      ? '✨ せんしゅうの 1い！ ポコに 王冠が ついてるよ'
      : '✨ せんしゅう たっせい！ いまは とくべつな ポコだよ'));
  }
  appendQuestGuide(card, w);
  body.appendChild(card);
}

// 「なにをして、なにが もらえるか」の せつめい（ごほうびの みほん つき）
function appendQuestGuide(card, w) {
  const guide = el('div', 'quest-guide');
  guide.appendChild(el('div', 'quest-guide-title', '📖 ポコクエストって？'));
  guide.appendChild(el('div', 'quest-guide-text',
    `1しゅうかん（土〜金）に、3人の せいかいを あわせて ${w.goal}もん めざそう！\n（ヒントを つかわずに せいかいした もんだいだけ かぞえるよ）`));
  const stage = petStage(loadPet().growth);
  const rewards = el('div', 'quest-rewards');
  [
    { perk: { special: true, crown: false }, label: 'みんなで たっせい', sub: 'つぎの 1しゅうかん\n1だん しんかした\nとくべつな ポコが\nてに はいるよ！' },
    { perk: { special: true, crown: true }, label: 'せいかい 1い だと', sub: 'さらに\n王冠も つくよ！' }
  ].forEach(r => {
    const item = el('div', 'quest-reward');
    const pic = el('div', 'quest-reward-pic');
    pic.innerHTML = petSVG(stage, 'cheer', 64, r.perk);
    item.appendChild(pic);
    item.appendChild(el('div', 'quest-reward-label', r.label));
    item.appendChild(el('div', 'quest-reward-sub', r.sub));
    rewards.appendChild(item);
  });
  guide.appendChild(rewards);
  card.appendChild(guide);
}
