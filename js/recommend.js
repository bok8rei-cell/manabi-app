// ===== 「どの学年のどの教科を ふくしゅうするか」のすすめ =====
// 最近の正解率が低い教科は、1つ前の学年にもどって ふくしゅうするのを すすめる。
// 前の学年も低ければ、さらに前へ。前の学年がよくできていれば、「今の学年のにがて」を ふくしゅうする。

const REC_MIN_ANSWERS = 12;   // 判定に 必要な、最近の答えた数
const REC_LOW = 0.6;          // これより低いと「にがて」
const REC_HIGH = 0.85;        // これ以上だと「よくできている」

function subjectAvailable(subject, grade) {
  const s = SUBJECTS.find(x => x.key === subject);
  return !!s && (!s.grades || s.grades.includes(grade));
}

// その教科がある、ひとつ前の学年（なければ null）
function prevGrade(subject, grade) {
  const idx = ALL_GRADES.indexOf(grade);
  for (let i = idx - 1; i >= 0; i--) {
    if (subjectAvailable(subject, ALL_GRADES[i])) return ALL_GRADES[i];
  }
  return null;
}

// その子の学年で にがてな教科ごとの、おすすめ。to: もどる学年（null なら「にがて ふくしゅう」）
function getRecommendations(name, grade) {
  const out = [];
  if (!grade) return out;
  SUBJECTS.forEach(subj => {
    if (!subjectAvailable(subj.key, grade)) return;
    const cur = recentRate(subj.key, grade, name);
    if (cur.n < REC_MIN_ANSWERS || cur.rate >= REC_LOW) return;

    let t = prevGrade(subj.key, grade);
    let target = null;
    let lastWeak = grade;                                                              // ここまで にがてだった、いちばん前の学年
    while (t !== null) {
      const r = recentRate(subj.key, t, name);
      if (r.n >= REC_MIN_ANSWERS && r.rate >= REC_LOW) {                               // この学年は にがてではない（6割以上）
        target = lastWeak === grade ? null : lastWeak;                                 // → すぐ次の学年から ふくしゅう（今の学年が にがてなだけなら null）
        break;
      }
      if (r.n >= REC_MIN_ANSWERS && r.rate < REC_LOW) {                                // この学年も にがて → もうひとつ前へ
        lastWeak = t;
        const p = prevGrade(subj.key, t);
        if (p === null) { target = t; break; }
        t = p;
        continue;
      }
      target = t;                                                                      // まだ 様子が分からない学年 → ためしてみる
      break;
    }
    out.push({ subject: subj.key, grade, to: target, rate: cur.rate });
  });
  return out.sort((a, b) => a.rate - b.rate);
}

// その教科がある、ひとつ上の学年（なければ null）
function nextGrade(subject, grade) {
  const idx = ALL_GRADES.indexOf(grade);
  for (let i = idx + 1; i < ALL_GRADES.length; i++) {
    if (subjectAvailable(subject, ALL_GRADES[i])) return ALL_GRADES[i];
  }
  return null;
}

// 前の学年で ふくしゅう中、「つぎに すすんで いい」くらい できるようになったか。すすむ先の学年（なければ null）を返す
// （2つ以上前の学年で ふくしゅう中なら、いきなり もとの学年ではなく、ひとつ上の学年へ）
function readyToAdvance(subject, lowerGrade, ownGrade, name) {
  if (!ownGrade || lowerGrade >= ownGrade) return null;
  const r = recentRate(subject, lowerGrade, name);
  if (!(r.n >= REC_MIN_ANSWERS && r.rate >= REC_HIGH)) return null;
  const next = nextGrade(subject, lowerGrade);
  return next !== null && next <= ownGrade ? next : null;
}

function recommendText(rec) {
  const subjName = subjectNameOf(rec.grade, rec.subject);
  const pct = Math.round(rec.rate * 100);
  if (rec.to) return `${subjName}が ちょっと むずかしそう（せいかい ${pct}%）。${gradeLabel(rec.to)}の もんだいで ふくしゅうしよう`;
  return `${subjName}の にがてを ふくしゅうしよう（せいかい ${pct}%）`;
}
