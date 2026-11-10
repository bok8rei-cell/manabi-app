// ===== 日付・保存データの共通部品（にがて復習／ミッション／れんぞく日数） =====

// 端末のローカル日付（日本時間）で YYYY-MM-DD を返す。
// toISOString() は UTC 基準で、日本の午前9時前だと「きのう」になってしまうため使わない。
function localDateStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDaysStr(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return localDateStr(new Date(y, m - 1, d + n));
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* 容量超過などは無視 */ }
}

// ---- にがて（まちがえた問題）----
// 間違えた問題を保存し、1日後 → 3日後 → 7日後に出し直す。3回つづけて正解したら卒業。
const MISTAKE_LIMIT = 60;
const REVIEW_STEPS = [1, 3, 7];

function mistakesKey(name) { return `manabi_mistakes_${playerTag(name)}`; }

function loadMistakes(name) {
  const list = readJSON(mistakesKey(name), []);
  return Array.isArray(list) ? list : [];
}

function saveMistakes(list) { writeJSON(mistakesKey(), list.slice(0, MISTAKE_LIMIT)); }

function mistakeId(grade, subject, problem) {
  return `${grade}|${subject}|${problem.question}|${problem.answer}`;
}

function recordMistake(grade, subject, problem) {
  const id = mistakeId(grade, subject, problem);
  const rest = loadMistakes().filter(m => m.id !== id);
  rest.unshift({ id, grade, subject, problem, box: 0, due: addDaysStr(localDateStr(), REVIEW_STEPS[0]) });
  saveMistakes(rest);
}

function dueMistakes(grade) {
  const today = localDateStr();
  return loadMistakes()
    .filter(m => m.due <= today && (grade == null || m.grade === grade) && !isSkipped(m.subject, m.grade, m.problem && m.problem.key))
    .sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0));
}

// 復習の結果を反映する。卒業したら 'cleared'、まだ続くなら 'kept' を返す。
function resolveMistake(id, ok) {
  const list = loadMistakes();
  const i = list.findIndex(m => m.id === id);
  if (i < 0) return 'kept';
  const today = localDateStr();
  if (!ok) {
    list[i].box = 0;
    list[i].due = addDaysStr(today, REVIEW_STEPS[0]);
    saveMistakes(list);
    return 'kept';
  }
  const nextBox = list[i].box + 1;
  if (nextBox >= REVIEW_STEPS.length) {
    list.splice(i, 1);
    saveMistakes(list);
    return 'cleared';
  }
  list[i].box = nextBox;
  list[i].due = addDaysStr(today, REVIEW_STEPS[nextBox]);
  saveMistakes(list);
  return 'kept';
}

// ---- きょうのミッション ----
function missionKey(grade) { return `manabi_mission_${playerTag()}_g${grade}_${localDateStr()}`; }

function getMission(grade) {
  const saved = readJSON(missionKey(grade), null);
  if (saved && Array.isArray(saved.items)) return saved;
  // その学年に ある 教科から えらぶ（中2・中3 など、国語・理科社会が まだ ない学年は 英語に する）。同じ教科は 2回 えらばない
  const used = [];
  const choose = (...cands) => {
    const k = cands.find(c => !used.includes(c) && (typeof subjectAvailable !== 'function' || subjectAvailable(c, grade)));
    if (k) used.push(k);
    return k;
  };
  const items = [];
  const s1 = choose('math'), s2 = choose('kanji', 'eigo');
  if (s1) items.push({ id: 'm1', kind: 'subject', subject: s1, n: 5, done: false });
  if (s2) items.push({ id: 'm2', kind: 'subject', subject: s2, n: 5, done: false });
  if (dueMistakes(grade).length > 0) {
    items.push({ id: 'm3', kind: 'review', n: 5, done: false });
  } else {
    const s3 = choose(grade <= 2 ? 'eigo' : 'rikashakai', ...(new Date().getDate() % 2 ? ['rika', 'shakai'] : ['shakai', 'rika']), 'eigo');
    if (s3) items.push({ id: 'm3', kind: 'subject', subject: s3, n: 5, done: false });
  }
  const mission = { items, bonus: false };
  writeJSON(missionKey(grade), mission);
  return mission;
}

// ミッション1つを完了にする。全部そろった最初の1回だけ allDone: true を返す。
function completeMissionItem(grade, itemId) {
  const mission = getMission(grade);
  const item = mission.items.find(it => it.id === itemId);
  if (!item) return { allDone: false };
  item.done = true;
  const allDone = mission.items.every(it => it.done);
  const firstTime = allDone && !mission.bonus;
  if (firstTime) mission.bonus = true;
  writeJSON(missionKey(grade), mission);
  return { allDone: firstTime };
}

// 古いミッション記録の掃除（4日より前のものを消す）
function cleanOldMissions() {
  const limit = addDaysStr(localDateStr(), -4);
  const remove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const m = key && key.match(/^manabi_mission_.*_(\d{4}-\d{2}-\d{2})$/);
    if (m && m[1] < limit) remove.push(key);
  }
  remove.forEach(k => localStorage.removeItem(k));
}

// ---- 毎日つづけた日数（なまえごと・教科をまたいで数える）----
function dayStreakKey(name) { return `manabi_daystreak_${playerTag(name)}`; }

function loadDayStreak(name) {
  const s = readJSON(dayStreakKey(name), null);
  return Object.assign({ last: null, count: 0, best: 0 }, s || {});
}

// 今日の学習を記録して、更新後の連続日数を返す
function touchDayStreak() {
  const s = loadDayStreak();
  const today = localDateStr();
  if (s.last === today) return s;
  s.count = (s.last === addDaysStr(today, -1)) ? s.count + 1 : 1;
  s.last = today;
  s.best = Math.max(s.best, s.count);
  writeJSON(dayStreakKey(), s);
  return s;
}

// 今表示すべき連続日数（きのうまで続いていれば、今日まだでも途切れていない）
function currentDayStreak(name) {
  const s = loadDayStreak(name);
  const today = localDateStr();
  if (s.last === today || s.last === addDaysStr(today, -1)) return s.count;
  return 0;
}

function studiedToday() { const h = loadHistory()[localDateStr()]; return !!(h && h.q > 0); }   // 1もんでも やったか（れんぞく日数は ポイント3つの 日だけ）

// ---- ドリルの問題数（10もん／3もん）----
function drillSizeKey() { return `manabi_drillsize_${playerTag()}`; }
function getDrillSize() { return localStorage.getItem(drillSizeKey()) === '3' ? 3 : 10; }
function setDrillSize(n) { try { localStorage.setItem(drillSizeKey(), n === 3 ? '3' : '10'); } catch (e) { /* 無視 */ } }

// ---- 学習のようす（日ごとの問題数・正解数。保護者向けの「この1しゅうかん」用）----
function historyKey(name) { return `manabi_history_${playerTag(name)}`; }

function loadHistory(name) {
  const h = readJSON(historyKey(name), {});
  return h && typeof h === 'object' && !Array.isArray(h) ? h : {};
}

function recordHistory(correct, total) {
  const h = loadHistory();
  const today = localDateStr();
  const e = h[today] || { q: 0, c: 0 };
  e.q += total;
  e.c += correct;
  h[today] = e;
  const limit = addDaysStr(today, -30);
  Object.keys(h).forEach(d => { if (d < limit) delete h[d]; });
  writeJSON(historyKey(), h);
}

// 今日までの n 日ぶん（古い順）。{ date, dow(0=日), q, c }
function lastDays(n, name) {
  const h = loadHistory(name);
  const today = localDateStr();
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = addDaysStr(today, -i);
    const [y, m, d] = date.split('-').map(Number);
    const e = h[date] || { q: 0, c: 0 };
    out.push({ date, dow: new Date(y, m - 1, d).getDay(), q: e.q, c: e.c });
  }
  return out;
}

function removeMistake(id) { saveMistakes(loadMistakes().filter(m => m.id !== id)); }

// ---- 「まだ ならってない」ものを出さない（子どもがボタンで決める。せっていで もどせる）----
function skipStoreKey(name) { return `manabi_skip_${playerTag(name)}`; }

function loadSkips(name) {
  const s = readJSON(skipStoreKey(name), {});
  return s && typeof s === 'object' && !Array.isArray(s) ? s : {};
}

function skipId(subject, grade, key) { return `${subject}|${grade}|${key}`; }

function isSkipped(subject, grade, key) {
  if (key === undefined || key === null || key === '') return false;
  const e = loadSkips()[skipId(subject, grade, key)];
  return !!(e && e.on);
}

function setSkip(subject, grade, key, label, on) {
  const s = loadSkips();
  s[skipId(subject, grade, key)] = { on: !!on, t: Date.now(), label: label || '' };
  writeJSON(skipStoreKey(), s);
}

// ---- 最近の正解率（教科×学年ごとに、さいごの20もん）。「前の学年に もどって ふくしゅう」のすすめに使う ----
const RECENT_N = 20;

function recentKey(name) { return `manabi_recent_${playerTag(name)}`; }

function loadRecent(name) {
  const r = readJSON(recentKey(name), {});
  return r && typeof r === 'object' && !Array.isArray(r) ? r : {};
}

function recordRecent(subject, grade, ok) {
  const r = loadRecent();
  const id = `${subject}|${grade}`;
  const e = r[id] && Array.isArray(r[id].a) ? r[id] : { a: [], t: 0 };
  e.a.push(ok ? 1 : 0);
  if (e.a.length > RECENT_N) e.a = e.a.slice(-RECENT_N);
  e.t = Date.now();
  r[id] = e;
  writeJSON(recentKey(), r);
}

// ---- さいきん 出した もんだい（教科×学年ごとに さいごの SEEN_N こ）。おなじ もんだいが つづけて 出ないように ----
const SEEN_N = 150;

function seenKey(name) { return `manabi_seen_${playerTag(name)}`; }

function problemFingerprint(bucket, p) {
  const text = `${bucket}|${p.question}|${p.answer}`;
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h * 33) ^ text.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

function loadSeen(bucket) {
  const all = readJSON(seenKey(), {});
  return all && Array.isArray(all[bucket]) ? all[bucket] : [];
}

function rememberSeen(bucket, id) {
  const all = readJSON(seenKey(), {});
  const o = all && typeof all === 'object' && !Array.isArray(all) ? all : {};
  const list = Array.isArray(o[bucket]) ? o[bucket] : [];
  list.push(id);
  o[bucket] = list.slice(-SEEN_N);
  writeJSON(seenKey(), o);
}

// ---- たんげんべつの せいかい数（ぶんせき用）。学年|教科|たんげん ごとに、答えた数 t・自力せいかい c・さいごの日 d ----
function unitKey(name) { return `manabi_unit_${playerTag(name)}`; }

function loadUnits(name) {
  const r = readJSON(unitKey(name), {});
  return r && typeof r === 'object' && !Array.isArray(r) ? r : {};
}

function recordUnit(subject, grade, unitLabel, ok) {
  const u = loadUnits();
  const id = `${grade}|${subject}|${unitLabel || 'そのほか'}`;
  const e = u[id] || { t: 0, c: 0, d: '' };
  e.t += 1;
  if (ok) e.c += 1;
  e.d = localDateStr();
  u[id] = e;
  writeJSON(unitKey(), u);
}

// { n: 答えた数, rate: せいかいりつ(0〜1) }
function recentRate(subject, grade, name) {
  const e = loadRecent(name)[`${subject}|${grade}`];
  if (!e || !Array.isArray(e.a) || e.a.length === 0) return { n: 0, rate: 0 };
  if (e.t && Date.now() - e.t > 60 * 86400000) return { n: 0, rate: 0 };   // 60日より古い きろくは 参考にしない
  return { n: e.a.length, rate: e.a.reduce((x, y) => x + y, 0) / e.a.length };
}
