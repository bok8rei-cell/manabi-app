// ===== ダブルチャレンジ：ポコ ＋ そろタッチ（ほかのアプリ）を、りょうほう やった日 =====
// そろタッチの きろくは とりこめないので、「そろタッチ スタート」から の時間で たしかめる。
//   ・スタート → そろタッチで べんきょう → 30〜60ぷん の あいだに ポコへ もどって「やった！」
//   ・30ぷん より はやく やめたら：時間の きろくだけ（コインなし）。その日は もう できない
//   ・60ぷん を すぎたら：やっていない あつかい。その日は もう できない（じぶんで じかんを まもる れんしゅう）
//   ・スタートして 1ぷん いないに やめたら、なかったことに できる（まちがえて おしたとき）
// きょう ポコで 10もん いじょう こたえて、そろタッチも「やった」になると ダブル達成（コイン）。
// 「そろタッチも やってる」子だけ オンにする（せってい）。

const SOLO_COIN = 100;          // ダブル達成の ごほうび
const POKO_DAILY_MIN = 10;      // きょう ポコで こたえる もんだい数
const SOLO_MIN_MINUTES = 30;    // 「やった！」を おせる さいしょの ぷん数
const SOLO_MAX_MINUTES = 60;    // これを すぎたら その日は ダメ
const SOLO_KEEP_DAYS = 60;

function soloKey(name) { return `manabi_solo_${playerTag(name)}`; }
// いま はしっている スタートは、この たんまつだけの もの（どうきしない）
function soloRunKey(name) { return `manabi_solorun_${playerTag(name)}`; }

function loadSolo(name) {
  const o = readJSON(soloKey(name), null) || {};
  const map = v => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
  return { on: !!o.on, t: o.t || 0, days: map(o.days), paid: map(o.paid), log: map(o.log) };
}

function saveSolo(o, name) {
  const limit = addDaysStr(localDateStr(), -SOLO_KEEP_DAYS);
  [o.days, o.paid, o.log].forEach(m => Object.keys(m).forEach(d => { if (d < limit) delete m[d]; }));
  writeJSON(soloKey(name), o);
}

function soloOn(name) { return loadSolo(name).on; }

function setSoloOn(on, name) {
  const o = loadSolo(name);
  o.on = !!on;
  o.t = Date.now();   // どうきで あたらしい方を えらぶため
  saveSolo(o, name);
}

function loadSoloRun(name) {
  const r = readJSON(soloRunKey(name), null);
  return r && typeof r.start === 'number' ? r : null;
}

function clearSoloRun(name) {
  try { localStorage.removeItem(soloRunKey(name)); } catch (e) { /* 無視 */ }
}

function soloElapsedMin(run) { return Math.max(0, Math.floor((Date.now() - run.start) / 60000)); }

// 時間を すぎた スタートを「やっていない」にする（ホームを ひらくたびに よぶ）
function settleSolo(name) {
  const run = loadSoloRun(name);
  if (!run) return;
  const today = localDateStr();
  if (run.date === today && soloElapsedMin(run) <= SOLO_MAX_MINUTES) return;
  const o = loadSolo(name);
  if (!o.days[run.date] && !o.log[run.date]) o.log[run.date] = { r: 'expired', m: 0 };
  saveSolo(o, name);
  clearSoloRun(name);
}

// きょうの そろタッチの ようす：off / idle / running / done / quit / expired
function soloState(name) {
  const o = loadSolo(name);
  if (!o.on) return { kind: 'off' };
  const today = localDateStr();
  if (o.days[today]) return { kind: 'done', mins: (o.log[today] || {}).m || 0 };
  const l = o.log[today];
  if (l) return { kind: l.r === 'expired' ? 'expired' : 'quit', mins: l.m || 0 };
  const run = loadSoloRun(name);
  if (run && run.date === today) return { kind: 'running', mins: soloElapsedMin(run) };
  return { kind: 'idle' };
}

function soloDoneOn(date, name) { return !!loadSolo(name).days[date]; }

function startSolo(name) {
  writeJSON(soloRunKey(name), { start: Date.now(), date: localDateStr() });
}

// やめる。1ぷん いないなら なかったことに。それ以外は 時間だけ きろく（コインなし・その日は おしまい）
function stopSolo(name) {
  const run = loadSoloRun(name);
  if (!run) return;
  const m = soloElapsedMin(run);
  clearSoloRun(name);
  if (m < 1) return;
  const o = loadSolo(name);
  o.log[run.date] = { r: 'quit', m };
  saveSolo(o, name);
}

// 30〜60ぷん たっていたら「やった」にする
function claimSolo(name) {
  const run = loadSoloRun(name);
  const today = localDateStr();
  if (!run || run.date !== today) return false;
  const m = soloElapsedMin(run);
  if (m < SOLO_MIN_MINUTES || m > SOLO_MAX_MINUTES) return false;
  const o = loadSolo(name);
  o.days[today] = 1;
  o.log[today] = { r: 'done', m };
  saveSolo(o, name);
  clearSoloRun(name);
  return true;
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

// ホームの ポコの ひとこと（なければ ''）
function soloBubble() {
  const st = soloState();
  if (st.kind === 'running') return 'そろタッチ\nがんばってね！';
  if (st.kind === 'idle' && pokoQuestionsOn(localDateStr()) >= POKO_DAILY_MIN) return 'ポコは バッチリ！\nそろタッチは やった？';
  return '';
}

// ホームの カード
function renderDoubleCard(body) {
  const st = soloState();
  if (st.kind === 'off') return;
  const today = localDateStr();
  const q = pokoQuestionsOn(today);
  const pokoDone = q >= POKO_DAILY_MIN;
  const both = pokoDone && st.kind === 'done';

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

  const row2 = el('div', 'double-row' + (st.kind === 'done' ? ' done' : ''));
  let mark = '○', text = '', btn = null;
  if (st.kind === 'done') {
    mark = '✓';
    text = `そろタッチ やった！（${st.mins}ふん）`;
  } else if (st.kind === 'quit') {
    mark = '✕';
    text = `きょうの そろタッチは おしまい（${st.mins}ふん）\n${SOLO_MIN_MINUTES}ふんに たりなかったので コインは なし`;
  } else if (st.kind === 'expired') {
    mark = '✕';
    text = `じかんを すぎたので、きょうは ダメだったよ\nあしたは ${SOLO_MIN_MINUTES}〜${SOLO_MAX_MINUTES}ぷんの あいだに もどってこよう`;
  } else if (st.kind === 'running') {
    const m = st.mins;
    if (m < SOLO_MIN_MINUTES) {
      text = `そろタッチ ちゅう… いま ${m}ふん（あと ${SOLO_MIN_MINUTES - m}ふん）`;
      btn = el('button', 'sub-btn double-btn', 'やめる');
      btn.addEventListener('click', () => {
        if (m < 1) { stopSolo(); renderHome(); return; }
        askConfirm(`いま やめると、きょうは コインが もらえないよ。\nやめる？`, 'やめる', 'つづける', () => { stopSolo(); renderHome(); }, { cancelFirst: true });
      });
    } else {
      const left = SOLO_MAX_MINUTES - m;
      text = `${m}ふん たったよ！` +(left <= 10 ? `\n（あと ${Math.max(0, left)}ふんで しめきり）` : '');
      mark = '★';
      btn = el('button', 'main-btn double-btn', 'やった！');
      btn.addEventListener('click', () => {
        if (claimSolo()) {
          if (evaluateDouble()) showToast(`🎉 ダブル たっせい！ ${SOLO_COIN}コイン ゲット！`);
          else showToast('そろタッチ おつかれさま！');
        }
        renderHome();
      });
    }
  } else {
    text = 'そろタッチは やった？';
    btn = el('button', 'main-btn double-btn', 'スタート');
    btn.addEventListener('click', () => {
      askConfirm(
        `そろタッチを はじめる？\n${SOLO_MIN_MINUTES}ふん たったら ポコに もどって「やった！」を おしてね。\n${SOLO_MAX_MINUTES}ふんを すぎると、きょうは ダメになるよ`,
        'はじめる', 'やめる', () => { startSolo(); renderHome(); }, { cancelFirst: true });
    });
  }
  row2.appendChild(el('span', 'mark', mark));
  row2.appendChild(el('span', 'double-text', text));
  if (btn) row2.appendChild(btn);
  card.appendChild(row2);

  let note;
  if (both) note = `🎉 きょうは ダブル たっせい！ ${SOLO_COIN}コイン もらったよ`;
  else if (st.kind === 'quit' || st.kind === 'expired') note = 'あしたも ちょうせん！ じぶんで じかんを まもろう';
  else note = `りょうほう やると ${SOLO_COIN}コイン！ まいにち つづけると「ダブル れんぞく」が のびるよ`;
  card.appendChild(el('div', 'double-note', note));
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
  const totalMin = days.reduce((s, d) => s + ((o.log[d.date] || {}).m || 0), 0);
  const q = pokoQuestionsOn(today, name);
  const st = soloState(name);
  let soloText;
  if (st.kind === 'done') soloText = `✅ ${st.mins}ふん`;
  else if (st.kind === 'quit') soloText = `▲ ${st.mins}ふんで やめた（コインなし）`;
  else if (st.kind === 'expired') soloText = '✕ じかんぎれ（やっていない あつかい）';
  else soloText = '⏳ まだ';

  card.appendChild(el('div', 'child-section', '⚡ ダブルチャレンジ（ポコ ＋ そろタッチ）'));
  card.appendChild(el('div', 'report-line', `きょう：ポコ ${q >= POKO_DAILY_MIN ? '✅' : `⏳ ${q}/${POKO_DAILY_MIN}もん`}　そろタッチ ${soloText}`));
  card.appendChild(el('div', 'report-line',
    `この 1しゅうかん：ダブル ${doubles}日　そろタッチ ${solos}日（きろく ごうけい ${totalMin}ふん）　🔥 ダブル れんぞく ${doubleStreak(name)}日`));
  const row = el('div', 'double-week');
  days.forEach(d => {
    const l = o.log[d.date];
    const mark = o.paid[d.date] ? '⭐' : (o.days[d.date] ? '⚡' : (l ? '✕' : (d.q >= POKO_DAILY_MIN ? '📘' : '・')));
    const cell = el('div', 'double-cell' + (d.date === today ? ' today' : ''));
    cell.appendChild(el('div', 'double-mark', mark));
    cell.appendChild(el('div', 'week-dow', DOW[d.dow]));
    row.appendChild(cell);
  });
  card.appendChild(row);
  card.appendChild(el('div', 'double-legend', '⭐ ダブル　⚡ そろタッチだけ　📘 ポコだけ　✕ とちゅうで やめた／じかんぎれ　・ なし'));
}

// せってい：「そろタッチも やってる」
function renderSoloSetting() {
  const sw = byId('solo-toggle');
  if (!sw) return;
  sw.checked = soloOn();
}

// スタート中は、ホームを ひらいたままでも 時間を 見せなおす。アプリに もどってきたときも
setInterval(() => { if (loadSoloRun()) { settleSolo(); refreshHome(); } }, 20000);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && soloOn()) { settleSolo(); refreshHome(); }
});
