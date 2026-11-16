// ===== おためしモード（おうちの人が 子どもの 画面を ためす）=====
// あたらしい もんだいや そろばんを、子どもの きろくに さわらずに ためす ための モード。
// ・おうちの人の 画面から はじめる。「おためし用」の なまえに きりかわる（子どもの コイン・れんぞく日数・せいせきは かわらない）
// ・おためし中の きろくは クラウドに おくらない。ランキング・メダルの じゅんばんにも 入らない。おわると ぜんぶ けす
// ・コインは たくさん、ポコは いちばん 大きい すがた、そろばんは ぜんレベル ひらいた じょうたいで はじまる
// ・上の おびで レベル（やさしい〜ちょうむずかしい）を かえられる
// なまえは メモリの なか だけで きりかえる（manabi_playername は 書きかえない）ので、アプリを とじれば 子どもに もどる。

const TRIAL_NAME = 'おためし（おうちの人）';
let trialPrev = null;      // おためしの まえの なまえ。null＝おためし中では ない
let trialLevel = null;     // おためし中に えらんだ レベル（null＝ふつうの すすみ方）

function isTrial() { return trialPrev !== null; }
function isTrialKey(key) { return String(key).indexOf(TRIAL_NAME) >= 0; }

// おためし用の きろくを ぜんぶ けす
function trialCleanup() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && isTrialKey(k)) keys.push(k); }
  keys.forEach(k => localStorage.removeItem(k));
}

function startTrial() {
  if (isTrial()) return;
  const prevGrade = (typeof loadGrade === 'function') ? loadGrade() : null;
  trialCleanup();
  trialPrev = state.playerName;
  trialLevel = null;
  state.playerName = TRIAL_NAME;
  // ためしやすい じょうたいで はじめる
  const top = PET_STAGES[PET_STAGES.length - 1].min;
  writeJSON(petKey(), { xp: 0, coins: 50000, spent: 0, perfects: 0, missions: 0, cleared: 0, growth: top });
  if (typeof sbKey === 'function') writeJSON(sbKey(), { lv: SB_LEVELS.length - 1, st: {}, flash: {}, checked: true, t: Date.now() });
  if (prevGrade) saveGrade(prevGrade);
  renderTrialBar();
  showTab('home');
  showToast('おためしモード：きろくは のこりません');
}

function endTrial() {
  if (!isTrial()) return;
  if (typeof session !== 'undefined') session = null;
  trialCleanup();
  state.playerName = trialPrev;
  trialPrev = null;
  trialLevel = null;
  renderTrialBar();
  showTab('home');
  showToast('おためしを おわりました');
}

// 上の おび
function renderTrialBar() {
  let bar = document.getElementById('trial-bar');
  if (!isTrial()) { if (bar) bar.remove(); document.body.classList.remove('trial-on'); return; }
  if (!bar) { bar = document.createElement('div'); bar.id = 'trial-bar'; document.body.appendChild(bar); }
  document.body.classList.add('trial-on');
  bar.innerHTML = '';
  bar.appendChild(el('span', 'trial-label', '👀 おためし中（きろくは のこりません）'));
  const sel = document.createElement('select');
  sel.setAttribute('aria-label', 'レベル');
  [['', 'レベル：ふつうの すすみ方'], ['0', 'やさしい'], ['1', 'ふつう'], ['2', 'むずかしい'], ['3', 'ちょうむずかしい']].forEach(([v, name]) => {
    const o = document.createElement('option'); o.value = v; o.textContent = name; if ((trialLevel === null ? '' : String(trialLevel)) === v) o.selected = true; sel.appendChild(o);
  });
  sel.addEventListener('change', () => {
    trialLevel = sel.value === '' ? null : Number(sel.value);
    showToast(trialLevel === null ? 'レベルを もとに もどしたよ' : `ぜんぶの 教科を「${sel.options[sel.selectedIndex].textContent}」で 出すよ（ない 学年は その下の レベル）`);
    if (typeof refreshHome === 'function') refreshHome();
  });
  bar.appendChild(sel);
  const end = el('button', 'trial-end', 'おわる');
  end.addEventListener('click', endTrial);
  bar.appendChild(end);
}

// おうちの人の 画面の ボタン
function appendTrialParent(root) {
  const panel = el('div', 'panel');
  panel.appendChild(el('div', 'report-line', '子どもの 画面（もんだい・そろばん・おみせ など）を、きろくを かえずに ためせます。コイン・れんぞく日数・せいせき・ランキングには 入りません。'));
  const b = el('button', 'sub-btn wide', '👀 おためしモードで 子どもの 画面を ためす');
  b.addEventListener('click', startTrial);
  panel.appendChild(b);
  root.appendChild(panel);
}

trialCleanup();   // まえの おためしの のこりが あれば けす（とちゅうで とじた とき）
