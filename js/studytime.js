// ===== べんきょうタイマー =====
// 問題の がめん（ドリル・ミッション・ふくしゅう・チャレンジ・タイムアタック）を ひらいている あいだだけ 時間を かぞえる。
// ホーム・おしゃれ・ずかん などでは とまる。5分 なにも さわらなかったら とまる（さわったら また かぞえる）。
// きろく：`manabi_time_{なまえ}` = { 日付: { たんまつID: 秒 } }。どうきは 日付ごと・たんまつごとに 大きい ほう（ふくすうの たんまつで やった 日は あわせて ひょうじ）。
// ランキングは 見るだけ（時間では コインなどは でない）。

const STUDY_IDLE_MS = 5 * 60 * 1000;
const STUDY_KEEP_DAYS = 120;

function studyDeviceId() {
  let id = '';
  try { id = localStorage.getItem('manabi_deviceid') || ''; } catch (e) { /* 無視 */ }
  if (!id) {
    id = Math.random().toString(36).slice(2, 8);
    try { localStorage.setItem('manabi_deviceid', id); } catch (e) { /* 無視 */ }
  }
  return id;
}

function studyKey(name) { return `manabi_time_${playerTag(name)}`; }

function loadStudyTime(name) {
  const o = readJSON(studyKey(name), {});
  return o && typeof o === 'object' && !Array.isArray(o) ? o : {};
}

function daySeconds(entry) {
  if (!entry) return 0;
  return Object.keys(entry).reduce((s, k) => s + (Number(entry[k]) || 0), 0);
}

// 日付 → 秒（その子の ぜんぶの たんまつの ごうけい）。まだ しょりしていない ぶんも ふくめる（いまの子だけ）
let _studyUnflushed = 0;
function studySecondsOn(dateStr, name) {
  const base = daySeconds(loadStudyTime(name)[dateStr]);
  const cur = (name === undefined || playerTag(name) === playerTag());
  return base + (cur && dateStr === localDateStr() ? _studyUnflushed : 0);
}

function studySecondsBetween(startStr, endStr, name) {   // startStr〜endStr（ふくむ）
  const t = loadStudyTime(name);
  let sum = 0;
  Object.keys(t).forEach(d => { if (d >= startStr && d <= endStr) sum += daySeconds(t[d]); });
  const today = localDateStr();
  if ((name === undefined || playerTag(name) === playerTag()) && today >= startStr && today <= endStr) sum += _studyUnflushed;
  return sum;
}

function studyMinuteWord(m) {
  const last = m % 10;
  return `${m}${[0, 1, 3, 4, 6, 8].includes(last) ? 'ぷん' : 'ふん'}`;
}

function formatStudy(sec) {
  const m = Math.floor(sec / 60);
  if (m < 60) return studyMinuteWord(m);
  const h = Math.floor(m / 60), r = m % 60;
  return `${h}じかん${r === 0 ? '' : studyMinuteWord(r)}`;
}

// ---- かぞえる ----
let _studyLastTouch = Date.now();
let _studyLastTick = Date.now();
let _studyCarry = 0;
let _studyName = '';

function flushStudy() {
  if (_studyUnflushed <= 0 || !_studyName) { _studyUnflushed = 0; return; }
  const key = `manabi_time_${_studyName}`;
  const o = readJSON(key, {});
  const t = (o && typeof o === 'object' && !Array.isArray(o)) ? o : {};
  const date = localDateStr();
  const dev = studyDeviceId();
  t[date] = t[date] || {};
  t[date][dev] = (Number(t[date][dev]) || 0) + _studyUnflushed;
  const days = Object.keys(t).sort();
  while (days.length > STUDY_KEEP_DAYS) delete t[days.shift()];
  writeJSON(key, t);
  _studyUnflushed = 0;
}

function studyScreenOn() {
  const a = byId('screen-quiz'), b = byId('screen-speedquiz');
  return !!((a && !a.classList.contains('hidden')) || (b && !b.classList.contains('hidden')));
}

function updateQuizTimeChip() {
  const chip = byId('quiz-time');
  if (!chip) return;
  const name = state.playerName.trim();
  if (!name) { chip.classList.add('hidden'); return; }
  chip.textContent = `⏱ きょう ${formatStudy(studySecondsOn(localDateStr()))}`;
  chip.classList.remove('hidden');
}

['touchstart', 'mousedown', 'keydown', 'input', 'click'].forEach(ev => document.addEventListener(ev, () => { _studyLastTouch = Date.now(); }, true));

setInterval(() => {
  const now = Date.now();
  const dt = Math.min(now - _studyLastTick, 2000);   // 画面が とまっていた ぶんは ふやさない
  _studyLastTick = now;
  const name = state.playerName.trim();
  if (_studyName && _studyName !== playerTag(name)) { flushStudy(); }   // なまえが かわった
  _studyName = name ? playerTag(name) : '';
  if (!_studyName || !studyScreenOn() || document.visibilityState !== 'visible' || now - _studyLastTouch > STUDY_IDLE_MS) return;
  _studyCarry += dt;
  if (_studyCarry >= 1000) {
    const sec = Math.floor(_studyCarry / 1000);
    _studyCarry -= sec * 1000;
    _studyUnflushed += sec;
    if (_studyUnflushed >= 10) flushStudy();
  }
  updateQuizTimeChip();
}, 1000);

document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushStudy(); });
window.addEventListener('pagehide', flushStudy);

// ---- ひょうじ ----
function weekDates() {   // こんしゅう（土〜きょう）の 日付
  const start = weekStartOf(localDateStr());
  const out = [];
  for (let d = start; d <= localDateStr(); d = addDaysStr(d, 1)) out.push(d);
  return out;
}

function monthRange() {
  const t = localDateStr();
  return [t.slice(0, 8) + '01', t];
}

// おうちの人の画面：ひとりぶん（きょう・こんしゅう・こんげつ と 7日の グラフ）
function appendStudyTimeParent(card, name) {
  const today = localDateStr();
  const [ms, me] = monthRange();
  const weekSec = studySecondsBetween(weekStartOf(today), today, name);
  card.appendChild(el('div', 'child-section', '⏱ べんきょう じかん'));
  card.appendChild(el('div', 'report-line', `きょう ${formatStudy(studySecondsOn(today, name))}　こんしゅう ${formatStudy(weekSec)}　こんげつ ${formatStudy(studySecondsBetween(ms, me, name))}`));
  const days = [];
  for (let i = 6; i >= 0; i--) days.push(addDaysStr(today, -i));
  const secs = days.map(d => studySecondsOn(d, name));
  const max = Math.max(60, ...secs);
  const bars = el('div', 'week');
  days.forEach((d, i) => {
    const [y, m, dd] = d.split('-').map(Number);
    const dow = ['日', '月', '火', '水', '木', '金', '土'][new Date(y, m - 1, dd).getDay()];
    const col = el('div', 'week-col' + (d === today ? ' today' : ''));
    col.appendChild(el('div', 'week-num', secs[i] >= 60 ? String(Math.round(secs[i] / 60)) : ''));
    const bar = el('div', 'week-bar' + (secs[i] > 0 ? ' on' : ''));
    bar.style.height = `${secs[i] > 0 ? Math.max(8, Math.round((secs[i] / max) * 70)) : 4}px`;
    col.appendChild(bar);
    col.appendChild(el('div', 'week-dow', dow));
    col.setAttribute('aria-label', `${d} ${formatStudy(secs[i])}`);
    bars.appendChild(col);
  });
  card.appendChild(bars);
  card.appendChild(el('div', 'report-line diag-line', 'ぼうの 上の 数字は「分」です'));
}

// ずかん：みんなの べんきょう じかん ランキング（こんしゅう／こんげつ）
function appendStudyRanking(root) {
  const names = loadPlayerNames();
  if (names.length < 2) return;
  const today = localDateStr();
  const [ms] = monthRange();
  const periods = [
    { key: 'week', label: 'こんしゅう', from: weekStartOf(today) },
    { key: 'month', label: 'こんげつ', from: ms }
  ];
  const wrap = el('div', 'rank-wrap');
  root.appendChild(el('h3', 'section-title', '⏱ べんきょう じかん ランキング'));
  const tabs = el('div', 'name-chips');
  const body = el('div', 'rank-body');
  let cur = 'week';
  const draw = () => {
    body.innerHTML = '';
    const per = periods.find(p => p.key === cur);
    const rows = names.map(n => {
      const secs = studySecondsBetween(per.from, today, n);
      const hist = loadHistory(n);
      let q = 0;
      Object.keys(hist).forEach(d => { if (d >= per.from && d <= today) q += hist[d].q || 0; });
      return { n, secs, q };
    }).sort((a, b) => b.secs - a.secs);
    const top = Math.max(60, rows[0] ? rows[0].secs : 0);
    let rank = 0, prev = null;
    rows.forEach((r, i) => {
      if (r.secs !== prev) { rank = i + 1; prev = r.secs; }
      const medal = r.secs <= 0 ? '・' : (rank === 1 ? '🥇' : (rank === 2 ? '🥈' : (rank === 3 ? '🥉' : String(rank))));
      const row = el('div', 'rank-row' + (r.n === state.playerName ? ' me' : ''));
      row.appendChild(el('div', 'rank-no', medal));
      const mid = el('div', 'rank-mid');
      mid.appendChild(el('div', 'rank-name', r.n));
      const bar = el('div', 'rank-bar');
      const fill = el('div', 'rank-fill');
      fill.style.width = `${Math.max(2, Math.round((r.secs / top) * 100))}%`;
      bar.appendChild(fill);
      mid.appendChild(bar);
      row.appendChild(mid);
      const right = el('div', 'rank-time');
      right.appendChild(el('div', 'rank-t1', formatStudy(r.secs)));
      right.appendChild(el('div', 'rank-t2', `${r.q}もん`));
      row.appendChild(right);
      body.appendChild(row);
    });
  };
  periods.forEach(p => {
    const b = el('button', 'name-chip' + (p.key === cur ? ' selected' : ''), p.label);
    b.addEventListener('click', () => { cur = p.key; tabs.querySelectorAll('.name-chip').forEach((c, i) => c.classList.toggle('selected', periods[i].key === cur)); draw(); });
    tabs.appendChild(b);
  });
  wrap.appendChild(tabs);
  wrap.appendChild(body);
  root.appendChild(wrap);
  draw();
}
