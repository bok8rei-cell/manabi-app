// ===== テスト週間：学校の テストの はんいに あわせた もんだい =====
// もんだいは、おうちの人が Claude Code に 写真（テストはんい・プリントなど）を 見せて つくって もらい、TEST_SETS に くわえる。
// （アプリの なかから AI は よばない。もんだい・こたえ・とき方は つくるときに きまっている）
//
// TEST_SETS の 1こ ぶん：
//   { id: 'ぜんぶで ひとつだけの なまえ', grade: 8, subject: 'rika'（SUBJECTS の key）, title: '2学期 中間テスト 理科',
//     from: '2026-12-01'（この日から ホームに 出す。なくても よい）, until: '2026-12-10'（テストの日。この日の おわりまで）,
//     problems: [ _tq(もんだい, せいかい, [まちがい 3こ], とき方, たんげんの なまえ), _ti(もんだい, せいかい, とき方, たんげん, 'number') ] }
// ・えらぶ もんだい _tq：えらぶ しゅるいは 自動で シャッフル
// ・かく もんだい _ti：せいかいは 文字（または 数）。れいがいの 書き方（ひらがな／カタカナ など）は alt:[…] で わたす
// ・図が ひつような ときは p.figure に HTML/SVG を わたす
// 学校の 教科書の 文章を そのまま うつさない。おなじ はんいを れんしゅう できる オリジナルの もんだいに する。
//
// きろく `manabi_testset_{なまえ}` = { セットid: { m: { もんだいばんごう: 1 }, n: ラウンド数 } }（じりきで せいかいした もんだいを おぼえる。どうきは あわせる）

const _tq = (question, answer, wrong, explain, unit) => ({ question, type: 'choice', answer, wrongs: wrong, explain, unitLabel: unit });
const _ti = (question, answer, explain, unit, inputType, alt) => ({ question, type: 'input', inputType: inputType || 'text', answer: String(answer), alt: alt || [], explain, unitLabel: unit });

const TEST_SETS = [];

const TESTWEEK_ROUND = 10;     // 1かいの もんだい数（まだ じりきで せいかいして いない ものを さきに）

function testsetKey(name) { return `manabi_testset_${playerTag(name)}`; }

function loadTestset(name) {
  const o = readJSON(testsetKey(name), {});
  return o && typeof o === 'object' && !Array.isArray(o) ? o : {};
}

function testDaysLeft(set) {
  const [y, m, d] = set.until.split('-').map(Number);
  const [ty, tm, td] = localDateStr().split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ty, tm - 1, td)) / 86400000);
}

// いま ホームに 出す テストセット（学年が あって、期間の なか）
function activeTestSets(grade) {
  const today = localDateStr();
  return TEST_SETS.filter(s => s.grade === grade && s.until >= today && (!s.from || s.from <= today) && s.problems && s.problems.length > 0);
}

function testsetProgress(set, name) {
  const rec = loadTestset(name)[set.id] || {};
  const m = rec.m || {};
  const done = set.problems.filter((_, i) => m[i]).length;
  return { done, total: set.problems.length, rounds: rec.n || 0 };
}

function startTestWeek(set) {
  const rec = loadTestset()[set.id] || {};
  const m = rec.m || {};
  const all = set.problems.map((p, i) => ({ p, i }));
  const rest = all.filter(x => !m[x.i]);
  const pool = rest.length > 0 ? rest : all;   // ぜんぶ せいかいしたら、もういちど ぜんぶから
  const picked = shuffleArray(pool).slice(0, TESTWEEK_ROUND);
  const problems = picked.map(({ p, i }) => ({
    subject: set.subject,
    problem: Object.assign({}, p, {
      key: `tw:${set.id}:${i}`,
      twIdx: i,
      choices: p.type === 'choice' ? shuffleArray([p.answer, ...p.wrongs]) : undefined
    })
  }));
  const data = loadTestset();
  data[set.id] = Object.assign({ m: {}, n: 0 }, data[set.id]);
  data[set.id].n += 1;
  writeJSON(testsetKey(), data);
  startSession({ mode: 'testweek', grade: set.grade, subject: set.subject, total: problems.length, problems, testSetId: set.id });
}

// 1もん こたえた あと：ヒントなしで せいかいしたら「できた」として おぼえる
function noteTestWeek(setId, idx, ok) {
  if (!ok || idx === undefined) return;
  const data = loadTestset();
  const rec = data[setId] = Object.assign({ m: {}, n: 0 }, data[setId]);
  rec.m[idx] = 1;
  writeJSON(testsetKey(), data);
}

function testSetById(id) { return TEST_SETS.find(s => s.id === id); }

// ホームの カード
function appendTestWeekCard(root) {
  const name = state.playerName.trim();
  if (!name) return;
  const grade = loadGrade();
  if (!grade) return;
  activeTestSets(grade).forEach(set => {
    const left = testDaysLeft(set);
    const pr = testsetProgress(set);
    const card = el('div', 'panel food-card testweek-panel');
    card.appendChild(el('div', 'testweek-title', `📝 テスト週間：${set.title}`));
    const d = set.until.split('-');
    card.appendChild(el('div', 'testweek-note', `${left === 0 ? 'きょうが テストの 日！' : `テストまで あと ${left}日`}（${Number(d[1])}月${Number(d[2])}日）`));
    card.appendChild(el('div', 'testweek-note', `じりきで せいかい：${pr.done} / ${pr.total} もん`));
    const bar = el('div', 'testweek-bar');
    const fill = el('div', 'testweek-fill');
    fill.style.width = `${Math.round(pr.done / pr.total * 100)}%`;
    bar.appendChild(fill);
    card.appendChild(bar);
    const btn = el('button', 'main-btn wide', pr.done >= pr.total ? '🔁 もういちど ぜんぶ やる' : '📝 テスト対策を はじめる');
    btn.addEventListener('click', () => startTestWeek(set));
    card.appendChild(btn);
    root.appendChild(card);
  });
}

// かく もんだいの 答えあわせ。数・式（inputType 'number' や answerType つき）は 算数の 判定を つかう。
// 文字は 全角半角・大文字小文字・スペース・文末の「。」を 気にしない。alt の どれかと いっちしても せいかい
function testAnswerCorrect(p, input) {
  if (p.inputType === 'number' || p.answerType) return isMathAnswerCorrect(p, input);
  const norm = s => String(s).normalize('NFKC').toLowerCase().replace(/[\s​-‍⁠﻿]/g, '').replace(/[。．.、,，]+$/, '');
  const u = norm(input);
  return u !== '' && [p.answer, ...(p.alt || [])].some(a => norm(a) === u);
}
