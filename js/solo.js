// ===== ダブルチャレンジ：ポコ ＋ そろタッチ（ほかのアプリ）を、りょうほう やった日 =====
// そろタッチの きろくは とりこめないので、「やった」は 子どもの じこしんこく。
// きょう ポコで 10もん いじょう こたえて、そろタッチも「やった」にすると ダブル達成（コイン）。
// 「そろタッチも やってる」子だけ オンにする（せってい）。

const SOLO_COIN = 100;       // ダブル達成の ごほうび
const POKO_DAILY_MIN = 10;   // きょう ポコで こたえる もんだい数
const SOLO_KEEP_DAYS = 60;

function soloKey(name) { return `manabi_solo_${playerTag(name)}`; }

function loadSolo(name) {
  const o = readJSON(soloKey(name), null) || {};
  return {
    on: !!o.on,
    t: o.t || 0,
    days: o.days && typeof o.days === 'object' ? o.days : {},
    paid: o.paid && typeof o.paid === 'object' ? o.paid : {}
  };
}

function saveSolo(o, name) {
  const limit = addDaysStr(localDateStr(), -SOLO_KEEP_DAYS);
  [o.days, o.paid].forEach(m => Object.keys(m).forEach(d => { if (d < limit) delete m[d]; }));
  writeJSON(soloKey(name), o);
}

function soloOn(name) { return loadSolo(name).on; }

function setSoloOn(on, name) {
  const o = loadSolo(name);
  o.on = !!on;
  o.t = Date.now();   // どうきで あたらしい方を えらぶため
  saveSolo(o, name);
}

function soloDoneOn(date, name) { return !!loadSolo(name).days[date]; }

// きょうの「そろタッチ やった」を おす／もどす
function toggleSoloToday(name) {
  const o = loadSolo(name);
  const today = localDateStr();
  if (o.days[today]) delete o.days[today]; else o.days[today] = 1;
  saveSolo(o, name);
}

function pokoQuestionsOn(date, name) { return (loadHistory(name)[date] || { q: 0 }).q; }

// ダブル達成か（ポコ 10もん いじょう ＋ そろタッチ）。まだ コインを もらっていなければ わたす。わたしたら true
function evaluateDouble(name) {
  const o = loadSolo(name);
  if (!o.on) return false;
  const today = localDateStr();
  if (o.paid[today]) return false;
  if (!o.days[today] || pokoQuestionsOn(today, name) < POKO_DAILY_MIN) return false;
  o.paid[today] = 1;
  saveSolo(o, name);
  const pet = loadPet(name);
  pet.coins += SOLO_COIN;
  writeJSON(petKey(name), pet);
  return true;
}

// ダブル達成の れんぞく日数（きょうが まだなら、きのうまでを数える）
function doubleStreak(name) {
  const paid = loadSolo(name).paid;
  let d = localDateStr();
  if (!paid[d]) d = addDaysStr(d, -1);
  let n = 0;
  while (paid[d]) { n++; d = addDaysStr(d, -1); }
  return n;
}

// ホームの カード
function renderDoubleCard(body) {
  if (!soloOn()) return;
  const today = localDateStr();
  const o = loadSolo();
  const q = pokoQuestionsOn(today);
  const pokoDone = q >= POKO_DAILY_MIN;
  const soloDone = !!o.days[today];
  const both = pokoDone && soloDone;

  const card = el('div', 'double-card' + (both ? ' done' : ''));
  const head = el('div', 'double-head');
  head.appendChild(el('div', 'double-title', '⚡ ダブルチャレンジ'));
  const streak = doubleStreak();
  head.appendChild(el('div', 'double-streak', streak > 0 ? `🔥 ダブル れんぞく ${streak}日` : ''));
  card.appendChild(head);

  const row1 = el('div', 'double-row' + (pokoDone ? ' done' : ''));
  row1.appendChild(el('span', 'mark', pokoDone ? '✓' : '○'));
  row1.appendChild(el('span', null, pokoDone ? 'ポコで べんきょう した！' : `ポコで ${POKO_DAILY_MIN}もん こたえよう（いま ${Math.min(q, POKO_DAILY_MIN)}/${POKO_DAILY_MIN}）`));
  card.appendChild(row1);

  const row2 = el('div', 'double-row' + (soloDone ? ' done' : ''));
  row2.appendChild(el('span', 'mark', soloDone ? '✓' : '○'));
  row2.appendChild(el('span', null, soloDone ? 'そろタッチ やった！' : 'そろタッチは やった？'));
  const b = el('button', soloDone ? 'sub-btn double-btn' : 'main-btn double-btn', soloDone ? 'とりけす' : 'やった！');
  b.addEventListener('click', () => {
    toggleSoloToday();
    if (evaluateDouble()) showToast(`🎉 ダブル たっせい！ ${SOLO_COIN}コイン ゲット！`);
    renderHome();
  });
  row2.appendChild(b);
  card.appendChild(row2);

  card.appendChild(el('div', 'double-note', both
    ? `🎉 きょうは ダブル たっせい！ ${SOLO_COIN}コイン もらったよ`
    : `りょうほう やると ${SOLO_COIN}コイン！ まいにち つづけると「ダブル れんぞく」が のびるよ`));
  body.appendChild(card);
}

// おうちの人の画面：ひとりぶん
function appendDoubleParent(card, name) {
  if (!soloOn(name)) return;
  const o = loadSolo(name);
  const today = localDateStr();
  const days = lastDays(7, name);
  const DOW = ['日', '月', '火', '水', '木', '金', '土'];
  const doubles = days.filter(d => o.paid[d.date]).length;
  const solos = days.filter(d => o.days[d.date]).length;
  const q = pokoQuestionsOn(today, name);

  card.appendChild(el('div', 'child-section', '⚡ ダブルチャレンジ（ポコ ＋ そろタッチ）'));
  card.appendChild(el('div', 'report-line',
    `きょう：ポコ ${q >= POKO_DAILY_MIN ? '✅' : `⏳ ${q}/${POKO_DAILY_MIN}もん`}　そろタッチ ${o.days[today] ? '✅' : '⏳ まだ'}`));
  card.appendChild(el('div', 'report-line',
    `この 1しゅうかん：ダブル ${doubles}日（そろタッチ ${solos}日）　🔥 ダブル れんぞく ${doubleStreak(name)}日`));
  const row = el('div', 'double-week');
  days.forEach(d => {
    const mark = o.paid[d.date] ? '⭐' : (o.days[d.date] ? '⚡' : (d.q >= POKO_DAILY_MIN ? '📘' : '・'));
    const cell = el('div', 'double-cell' + (d.date === today ? ' today' : ''));
    cell.appendChild(el('div', 'double-mark', mark));
    cell.appendChild(el('div', 'week-dow', DOW[d.dow]));
    row.appendChild(cell);
  });
  card.appendChild(row);
  card.appendChild(el('div', 'double-legend', '⭐ ダブル　⚡ そろタッチだけ　📘 ポコだけ　・ なし'));
}

// せってい：「そろタッチも やってる」
function renderSoloSetting() {
  const sw = byId('solo-toggle');
  if (!sw) return;
  sw.checked = soloOn();
}
