// ===== いま 学校で やっている たんげん（おうちの人が えらぶ）=====
// 学年と たんげん（算数）を 3つまで えらぶと、その子の 算数に、そのたんげんの もんだいが 多めに（約7わり）でる。
// 学校の じゅぎょう・テストに あわせて 練習 させる ため。きろくは `manabi_focus_{なまえ}`（どうきする。あたらしい ほうを つかう）。

function focusKey(name) { return `manabi_focus_${playerTag(name)}`; }

function loadFocus(name) {
  const r = readJSON(focusKey(name), null);
  return r && Array.isArray(r.units) ? { grade: r.grade || null, units: r.units, t: r.t || 0 } : { grade: null, units: [], t: 0 };
}

function saveFocus(name, grade, units) {
  writeJSON(focusKey(name), { grade, units: units.slice(0, 3), t: Date.now() });
}

// いまの子が その学年で えらんでいる たんげん（Set）
function focusMathUnits(grade) {
  const f = loadFocus();
  return new Set(f.grade === grade ? f.units : []);
}

// その学年の 算数に ある たんげんの 一らん（もんだいを たくさん つくって しらべる。1かいだけ）
const _focusUnitCache = {};
function mathUnitsForGrade(grade) {
  if (_focusUnitCache[grade]) return _focusUnitCache[grade];
  const set = new Set();
  const top = (typeof maxDiff === 'function') ? maxDiff(grade, 'math') : 2;
  for (let d = 0; d <= top; d++) {
    for (let i = 0; i < 500; i++) {
      try {
        const p = generateMathProblem(grade, d);
        if (p && p.unitLabel) set.add(p.unitLabel);
      } catch (e) { break; }
    }
  }
  _focusUnitCache[grade] = Array.from(set).sort((a, b) => a.localeCompare(b, 'ja'));
  return _focusUnitCache[grade];
}

// ---- えらぶ がめん（おうちの人の 画面の 子どもカードから ひらく）----
function openFocusPicker(name, onDone) {
  if (document.querySelector('.focus-modal')) return;
  const cur = loadFocus(name);
  let grade = cur.grade || loadGrade(name) || 3;
  let picked = new Set(cur.units);

  const wrap = document.createElement('div');
  wrap.className = 'modal focus-modal';
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');
  const card = document.createElement('div');
  card.className = 'modal-card focus-card';
  wrap.appendChild(card);
  document.body.appendChild(wrap);
  const close = () => wrap.remove();

  const draw = () => {
    card.innerHTML = '';
    card.appendChild(el('div', 'modal-text', `${name} の\nいま 学校で やっている たんげん`));
    card.appendChild(el('div', 'focus-desc', '3つまで えらべます。えらんだ たんげんの もんだいが 多めに でます。（算数）'));
    const gp = el('div', 'name-chips');
    ALL_GRADES.forEach(g => {
      const b = el('button', 'name-chip' + (g === grade ? ' selected' : ''), gradeLabel(g));
      b.addEventListener('click', () => { if (g !== grade) { grade = g; picked = new Set(); draw(); } });
      gp.appendChild(b);
    });
    card.appendChild(gp);
    const list = el('div', 'name-chips focus-units');
    mathUnitsForGrade(grade).forEach(u => {
      const on = picked.has(u);
      const b = el('button', 'name-chip' + (on ? ' selected' : ''), u);
      b.addEventListener('click', () => {
        if (picked.has(u)) picked.delete(u);
        else if (picked.size < 3) picked.add(u);
        else { showToast('えらべるのは 3つまでです'); return; }
        draw();
      });
      list.appendChild(b);
    });
    card.appendChild(list);
    card.appendChild(el('div', 'focus-count', `えらんだ たんげん：${picked.size} / 3`));
    const btns = el('div', 'modal-buttons');
    const save = el('button', 'main-btn', 'これに する');
    save.addEventListener('click', () => {
      if (picked.size === 0) saveFocus(name, null, []);
      else saveFocus(name, grade, Array.from(picked));
      close();
      showToast(picked.size ? '「いま やっている たんげん」を きめたよ' : 'えらんだ たんげんを やめたよ');
      if (typeof autoSync === 'function') autoSync();
      if (onDone) onDone();
    });
    const clr = el('button', 'sub-btn', 'ぜんぶ やめる');
    clr.addEventListener('click', () => { picked = new Set(); saveFocus(name, null, []); close(); if (onDone) onDone(); });
    const cancel = el('button', 'sub-btn', 'もどる');
    cancel.addEventListener('click', close);
    btns.append(save, clr, cancel);
    card.appendChild(btns);
  };
  draw();
}
