// ===== 教科の バランス：1つの教科ばかり やりすぎないように =====
// 今週（土〜金）の せいかい数を 教科ごとに 数える。
//   きじゅん ＝ 「さんすう」と「こくご」の 平均（この2つは せいげん なし。くり返しても よい）
//   「えいご」「りか・しゃかい」「ことわざ」が、きじゅん ＋ 100もん を こえたら「せいげんちゅう」：
//     ・コインは 10ぶんの 1
//     ・ポコクエストの 数は 10もんで 1カウント
//   さんすう・こくごを やって きじゅんが 上がれば、また ふつうに もどる。べんきょう自体は とめない。
// ぜんぶの せいかい数（バッジ）や そだちポイントは かわらない。

const BALANCE_GAP = 100;                                   // きじゅんより これだけ 多いと せいげん
const BALANCE_TAPER = 0.1;                                 // せいげんちゅうの ごほうびの わりあい
const BALANCE_CORE = ['math', 'kanji'];                    // きじゅんに なる 教科
const BALANCE_LIMITED = ['eigo', 'rikashakai', 'kotowaza'];  // やりすぎると せいげん される 教科
const BALANCE_WARN_LEFT = 30;                              // これだけ のこったら「もうすぐ せいげん」と 知らせる
const BALANCE_KEEP_WEEKS = 6;
const BALANCE_NAMES = { math: 'さんすう', kanji: 'こくご', kotowaza: 'ことわざ', rikashakai: 'りか・しゃかい', eigo: 'えいご' };

function subjCountKey(name) { return `manabi_subj_${playerTag(name)}`; }
function taperKey(name) { return `manabi_taper_${playerTag(name)}`; }

function loadSubjCounts(name) {
  const o = readJSON(subjCountKey(name), {});
  return o && typeof o === 'object' && !Array.isArray(o) ? o : {};
}

// 今週の 教科べつ せいかい数
function subjectCountsThisWeek(name) {
  return loadSubjCounts(name)[weekStartOf(localDateStr())] || {};
}

function bumpSubjectCount(subject, name) {
  const all = loadSubjCounts(name);
  const w = weekStartOf(localDateStr());
  const cur = all[w] || {};
  cur[subject] = (cur[subject] || 0) + 1;
  all[w] = cur;
  const keys = Object.keys(all).sort();
  while (keys.length > BALANCE_KEEP_WEEKS) delete all[keys.shift()];
  writeJSON(subjCountKey(name), all);
}

// その教科が いま せいげんちゅうか。{ watched, limited, ref, limit, count, left }
function balanceInfo(subject, name) {
  if (!BALANCE_LIMITED.includes(subject)) return { watched: false, limited: false };
  const c = subjectCountsThisWeek(name);
  const ref = Math.round(((c.math || 0) + (c.kanji || 0)) / 2);
  const limit = ref + BALANCE_GAP;
  const count = c[subject] || 0;
  return { watched: true, limited: count >= limit, ref, limit, count, left: Math.max(0, limit - count) };
}

// せいかい 1もんの ごほうびを きめる。1（ふつう）か BALANCE_TAPER（せいげんちゅう）を かえす。
// ポコクエストの数も ここで 足す（ヒントなしのときだけ。せいげんちゅうは 10もんで 1）
function applyCorrectReward(subject, noHint) {
  const limited = balanceInfo(subject).limited;
  bumpSubjectCount(subject);
  if (noHint) {
    if (!limited) {
      addWeeklyCorrect();
    } else {
      const t = readJSON(taperKey(), { n: 0 });
      t.n = (t.n || 0) + 1;
      writeJSON(taperKey(), t);
      if (t.n % 10 === 0) addWeeklyCorrect();
    }
  }
  return limited ? BALANCE_TAPER : 1;
}

function limitedSubjectsNow() {
  return BALANCE_LIMITED.filter(k => balanceInfo(k).limited);
}

// 勉強中の画面の ひょうじ
function updateLimitChip() {
  const chip = byId('quiz-limit');
  if (!chip) return;
  const s = (typeof session !== 'undefined') ? session : null;
  const info = s && s.currentSubject ? balanceInfo(s.currentSubject) : null;
  chip.className = 'limit-chip hidden';
  if (!info || !info.watched) return;
  const nm = BALANCE_NAMES[s.currentSubject];
  if (info.limited) {
    chip.textContent = `⚖️ ${nm}は せいげんちゅう：コインは ほんの すこし／ポコクエストは 10もんで 1カウント\nさんすう・こくごを やると もどるよ`;
    chip.className = 'limit-chip limited';
  } else if (info.left <= BALANCE_WARN_LEFT) {
    chip.textContent = `⚖️ ${nm}は あと ${info.left}もんで せいげん\nほかの きょうかも やってみよう`;
    chip.className = 'limit-chip warn';
  }
}

// ホームの きょうかの 下の ひとこと
function renderBalanceNote(body) {
  const limited = limitedSubjectsNow();
  const warn = BALANCE_LIMITED.filter(k => { const i = balanceInfo(k); return i.watched && !i.limited && i.left <= BALANCE_WARN_LEFT; });
  if (limited.length === 0 && warn.length === 0) return;
  const card = el('div', 'balance-note' + (limited.length ? ' limited' : ''));
  if (limited.length) {
    card.appendChild(el('div', 'balance-title', `⚖️ ${limited.map(k => BALANCE_NAMES[k]).join('・')}は せいげんちゅう`));
    card.appendChild(el('div', 'balance-text', 'コインは すこしだけ、ポコクエストは 10もんで 1カウント。\nさんすう・こくごを やると もとに もどるよ！'));
  } else {
    card.appendChild(el('div', 'balance-title', `⚖️ ${warn.map(k => BALANCE_NAMES[k]).join('・')}は もうすぐ せいげん`));
    card.appendChild(el('div', 'balance-text', 'ほかの きょうかも まんべんなく やってみよう！'));
  }
  body.appendChild(card);
}

// おうちの人の画面：ひとりぶん
function appendBalanceParent(card, name) {
  const c = subjectCountsThisWeek(name);
  const total = Object.keys(c).reduce((s, k) => s + (c[k] || 0), 0);
  if (total === 0) return;
  card.appendChild(el('div', 'child-section', '⚖️ 今週の 教科べつ せいかい数'));
  const parts = ['math', 'kanji', 'kotowaza', 'rikashakai', 'eigo']
    .filter(k => c[k] > 0)
    .map(k => {
      const i = balanceInfo(k, name);
      return `${BALANCE_NAMES[k]} ${c[k]}${i.limited ? '（せいげんちゅう）' : ''}`;
    });
  card.appendChild(el('div', 'report-line', parts.join('　')));
  const lim = BALANCE_LIMITED.filter(k => balanceInfo(k, name).limited);
  if (lim.length) card.appendChild(el('div', 'report-line', `${lim.map(k => BALANCE_NAMES[k]).join('・')}は やりすぎで 制限中（コイン10分の1・クエスト10問で1）。算数・国語を やると 解除されます`));
}
