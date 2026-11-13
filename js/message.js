// ===== おうちの人からの メッセージ・スタンプ と、みんなの ポコ =====
// おうちの人の画面から、子ごとに（またはみんなに）スタンプと ひとことを おくる。子どものホームに「💌 おうちの人から」が出て、
// 「みたよ！」を おすと 既読に なる。どうきで ほかの たんまつにも とどく（きろくは `manabi_msg_{なまえ}`。あたらしい ほうを つかう）。

const MESSAGE_STAMPS = [
  { e: '👏', t: 'すごい！' }, { e: '🌟', t: 'がんばったね' }, { e: '💪', t: 'ナイス！' }, { e: '🎉', t: 'やったね！' },
  { e: '🔥', t: 'いいちょうし' }, { e: '❤️', t: 'だいすき' }, { e: '😊', t: 'ありがとう' }, { e: '🍙', t: 'おつかれさま' }
];
const MESSAGE_PRESETS = [
  'きょうも がんばったね！', 'むずかしいのに ちょうせん して えらいね', 'あとで いっしょに やろう', 'そろそろ きゅうけいしよう',
  'まいにち つづけていて すごいよ', 'しゅくだいも わすれずにね'
];

function msgKey(name) { return `manabi_msg_${playerTag(name)}`; }

function loadMsg(name) {
  const m = readJSON(msgKey(name), null);
  return m && typeof m === 'object' && m.t ? { text: m.text || '', stamp: m.stamp || '', t: m.t, readT: m.readT || 0 } : null;
}

function sendMsg(name, stamp, text) {
  writeJSON(msgKey(name), { text: (text || '').slice(0, 40), stamp: stamp || '', t: Date.now(), readT: 0 });
}

// こどもが「みたよ」を おした
function markMsgRead(name) {
  const m = loadMsg(name);
  if (!m) return;
  m.readT = Date.now();
  writeJSON(msgKey(name), m);
}

function msgTimeLabel(t) {
  const d = new Date(t);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ---- 子どもの ホーム ----
function renderMessageCard() {
  const root = byId('home-msg');
  if (!root) return;
  root.innerHTML = '';
  const name = state.playerName.trim();
  if (!name) return;
  const m = loadMsg(name);
  if (!m || m.readT >= m.t) return;   // なし／もう みた
  const card = el('div', 'panel msg-card');
  card.appendChild(el('div', 'msg-from', '💌 おうちの人から'));
  if (m.stamp) card.appendChild(el('div', 'msg-stamp', m.stamp));
  if (m.text) card.appendChild(el('div', 'msg-text', m.text));
  const b = el('button', 'main-btn wide', '👍 みたよ！');
  b.addEventListener('click', () => {
    markMsgRead(name);
    if (typeof FX !== 'undefined' && FX.correct) FX.correct();
    if (typeof autoSync === 'function') autoSync();
    renderHome();
  });
  card.appendChild(b);
  root.appendChild(card);
}

function hasUnreadMsg() {
  const name = state.playerName.trim();
  const m = name ? loadMsg(name) : null;
  return !!(m && m.readT < m.t);
}

// ---- おうちの人の画面：おくる ----
function openMessageDialog(names, label, onDone) {
  if (document.querySelector('.msg-modal') || !names.length) return;
  let stamp = '';
  let text = '';
  const wrap = document.createElement('div');
  wrap.className = 'modal msg-modal';
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');
  const card = document.createElement('div');
  card.className = 'modal-card msg-dialog';
  wrap.appendChild(card);
  document.body.appendChild(wrap);
  const close = () => wrap.remove();

  const draw = () => {
    card.innerHTML = '';
    card.appendChild(el('div', 'modal-text', `${label} に メッセージ`));
    card.appendChild(el('div', 'focus-desc', 'スタンプと ひとことを えらんで おくると、子どもの ホームに 出ます。'));
    const sp = el('div', 'msg-stamps');
    MESSAGE_STAMPS.forEach(s => {
      const b = el('button', 'stamp-btn' + (stamp === s.e ? ' selected' : ''), s.e);
      b.setAttribute('aria-label', s.t);
      b.addEventListener('click', () => { stamp = stamp === s.e ? '' : s.e; if (!text && stamp) text = MESSAGE_STAMPS.find(x => x.e === stamp).t; draw(); });
      sp.appendChild(b);
    });
    card.appendChild(sp);
    const pre = el('div', 'name-chips');
    MESSAGE_PRESETS.forEach(p => {
      const b = el('button', 'name-chip', p);
      b.addEventListener('click', () => { text = p; draw(); });
      pre.appendChild(b);
    });
    card.appendChild(pre);
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 40;
    input.className = 'msg-input';
    input.placeholder = 'じぶんで かく（40もじまで）';
    input.value = text;
    input.addEventListener('input', () => { text = input.value; });
    card.appendChild(input);
    const btns = el('div', 'modal-buttons');
    const send = el('button', 'main-btn', '💌 おくる');
    send.addEventListener('click', () => {
      if (!stamp && !text.trim()) { showToast('スタンプか ひとことを えらんでね'); return; }
      names.forEach(n => sendMsg(n, stamp, text.trim()));
      close();
      showToast(`${label} に おくったよ`);
      if (typeof autoSync === 'function') autoSync();
      if (onDone) onDone();
    });
    const cancel = el('button', 'sub-btn', 'やめる');
    cancel.addEventListener('click', close);
    btns.append(send, cancel);
    card.appendChild(btns);
  };
  draw();
}

// ---- みんなの ポコ（ずかん）----
function appendEveryonesPoko(root) {
  const names = loadPlayerNames();
  if (names.length < 2) return;
  root.appendChild(el('h3', 'section-title', 'みんなの ポコ'));
  const grid = el('div', 'everyone-grid');
  names.forEach(n => {
    const pet = loadPet(n);
    const stage = petStage(pet.growth);
    const shop = loadShop(n);
    const look = shopLook(n);
    const cell = el('div', 'everyone-cell' + (n === state.playerName ? ' me' : ''));
    const pic = el('div', 'everyone-pic');
    pic.innerHTML = (typeof roomSVG === 'function')
      ? roomSVG(roomWear(shop), 150, petSVG(stage, 'happy', 54, { noEvolve: true }, look))
      : petSVG(stage, 'happy', 90, { noEvolve: true }, look);
    cell.appendChild(pic);
    cell.appendChild(el('div', 'everyone-name', n));
    cell.appendChild(el('div', 'everyone-stage', PET_STAGES[stage].name));
    grid.appendChild(cell);
  });
  root.appendChild(grid);
}
