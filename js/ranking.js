// ---- みんなの順位（ランキング） ----
function rankingKey(grade) {
  return `manabi_ranking_g${grade}`;
}

function loadRanking(grade) {
  const raw = localStorage.getItem(rankingKey(grade));
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function saveRankingEntry(grade, subjectKey, correct, total) {
  const name = state.playerName.trim();
  if (!name) return;

  const subj = SUBJECTS.find(s => s.key === subjectKey);
  const label = subjectLabel(grade, subj);
  const rate = Math.round((correct / total) * 100);

  const list = loadRanking(grade);
  list.push({
    name,
    subject: label,
    correct,
    total,
    rate,
    date: localDateStr()
  });
  list.sort((a, b) => b.rate - a.rate || b.correct - a.correct || (a.date < b.date ? 1 : -1));
  localStorage.setItem(rankingKey(grade), JSON.stringify(list.slice(0, 20)));
}

function showRankingScreen() {
  const container = document.getElementById('ranking-content');
  container.innerHTML = '';

  ALL_GRADES.forEach(grade => {
    const card = document.createElement('div');
    card.className = 'report-card';

    const heading = document.createElement('h3');
    heading.textContent = gradeLabel(grade);
    card.appendChild(heading);

    const list = loadRanking(grade);
    if (list.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'report-empty';
      empty.textContent = 'まだ ランキングデータがありません。';
      card.appendChild(empty);
    } else {
      list.slice(0, 5).forEach((entry, i) => {
        const row = document.createElement('div');
        row.className = 'ranking-row';

        const rankEl = document.createElement('span');
        rankEl.className = 'ranking-rank';
        rankEl.textContent = `${i + 1}位`;

        const nameEl = document.createElement('span');
        nameEl.className = 'ranking-name';
        nameEl.textContent = entry.name;

        const detailEl = document.createElement('span');
        detailEl.className = 'ranking-detail';
        detailEl.textContent = `${entry.subject}　${entry.correct}/${entry.total}（${entry.rate}%）`;

        row.appendChild(rankEl);
        row.appendChild(nameEl);
        row.appendChild(detailEl);
        card.appendChild(row);
      });
    }

    container.appendChild(card);
  });

  showScreen('ranking');
}
