// ===== 端末ロック と おうちの人の 4けたの番号 =====
// ・この iPad は ○○ せんよう（manabi_lock = なまえ）にして、なまえの きりかえを ふせぐ
// ・おうちの人の 4けた番号は、アプリの がめんで おうちの人が きめる。コードには 書かない。
//   ほぞんするのは「しお＋ハッシュ」だけ（manabi_pinhash）。この端末だけで、どうきには のせない。
// ・番号が いるとき：ロックをとく／おうちの人の 画面を ひらく／おうちの人用の スイッチ／番号をかえる

const LOCK_KEY = 'manabi_lock';
const PIN_KEY = 'manabi_pinhash';
const LOCK_INIT_KEY = 'manabi_lock_init';

function lockRead(key) { try { return localStorage.getItem(key) || ''; } catch (e) { return ''; } }
function lockWrite(key, v) { try { if (v === null) localStorage.removeItem(key); else localStorage.setItem(key, v); } catch (e) { /* 無視 */ } }

function lockedName() { return lockRead(LOCK_KEY); }
function isLocked() { return !!lockedName(); }
function hasPin() { return !!lockRead(PIN_KEY); }

// ---- ハッシュ ----
function lockRandomSalt() {
  const a = new Uint8Array(8);
  if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(a);
  else for (let i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256);
  return Array.from(a).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function lockHash(salt, pin) {
  const text = `manabi:${salt}:${pin}`;
  if (window.crypto && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 5381;                                    // crypto が ない ときの ひかえ
  for (let i = 0; i < text.length; i++) h = ((h * 33) ^ text.charCodeAt(i)) >>> 0;
  return 'f' + h.toString(16);
}

async function lockSetPin(pin) {
  const salt = lockRandomSalt();
  lockWrite(PIN_KEY, `${salt}:${await lockHash(salt, pin)}`);
}

async function lockCheckPin(pin) {
  const stored = lockRead(PIN_KEY);
  if (!stored) return false;
  const [salt, hash] = stored.split(':');
  return (await lockHash(salt, pin)) === hash;
}

// ---- 番号を いれる ダイアログ ----
let pinFails = 0, pinBlockedUntil = 0;

// message: せつめい。confirmMode: 2かい いれて きめる（はじめて／かえる）。
// 戻り値：入れた 4けた（キャンセルなら null）
function lockPinDialog(message, confirmMode) {
  return new Promise(resolve => {
    const wrap = document.createElement('div');
    wrap.className = 'modal pin-modal';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    const card = document.createElement('div');
    card.className = 'modal-card';
    const text = document.createElement('div');
    text.className = 'modal-text';
    text.textContent = message;
    const input = document.createElement('input');
    input.type = 'password';
    input.inputMode = 'numeric';
    input.pattern = '[0-9]*';
    input.maxLength = 4;
    input.autocomplete = 'off';
    input.className = 'pin-input';
    input.setAttribute('aria-label', '4けたの ばんごう');
    const input2 = document.createElement('input');
    input2.type = 'password';
    input2.inputMode = 'numeric';
    input2.pattern = '[0-9]*';
    input2.maxLength = 4;
    input2.autocomplete = 'off';
    input2.className = 'pin-input';
    input2.placeholder = 'もういちど';
    input2.setAttribute('aria-label', 'もういちど');
    const err = document.createElement('div');
    err.className = 'pin-error';
    const btns = document.createElement('div');
    btns.className = 'modal-buttons';
    const ok = document.createElement('button');
    ok.className = 'main-btn';
    ok.textContent = 'OK';
    const cancel = document.createElement('button');
    cancel.className = 'sub-btn';
    cancel.textContent = 'もどる';
    btns.append(ok, cancel);
    card.append(text, input);
    if (confirmMode) card.append(input2);
    card.append(err, btns);
    wrap.appendChild(card);
    document.body.appendChild(wrap);
    const done = (v) => { wrap.remove(); resolve(v); };
    const onlyDigits = (e) => { e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4); };
    input.addEventListener('input', onlyDigits);
    input2.addEventListener('input', onlyDigits);
    const submit = () => {
      if (!/^\d{4}$/.test(input.value)) { err.textContent = '4けたの すうじを いれてね'; return; }
      if (confirmMode && input.value !== input2.value) { err.textContent = '2かいの ばんごうが ちがうよ'; return; }
      done(input.value);
    };
    ok.addEventListener('click', submit);
    cancel.addEventListener('click', () => done(null));
    wrap.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') done(null); });
    setTimeout(() => input.focus(), 50);
  });
}

// 番号を たしかめる（まだ 決めていなければ、はじめに 決めてもらう）。OK なら true
async function requireParent(purpose) {
  if (!hasPin()) {
    const pin = await lockPinDialog('おうちの人の 4けたの ばんごうを きめてね。\n（わすれないでね。子どもには ひみつ）', true);
    if (!pin) return false;
    await lockSetPin(pin);
    if (typeof showToast === 'function') showToast('ばんごうを きめたよ');
    return true;
  }
  for (;;) {
    const now = Date.now();
    if (now < pinBlockedUntil) {
      if (typeof showToast === 'function') showToast(`まちがいが おおいので ${Math.ceil((pinBlockedUntil - now) / 1000)}びょう まってね`);
      return false;
    }
    const pin = await lockPinDialog(`おうちの人の ばんごうを いれてね${purpose ? '\n（' + purpose + '）' : ''}`, false);
    if (!pin) return false;
    if (await lockCheckPin(pin)) { pinFails = 0; return true; }
    pinFails++;
    if (pinFails >= 5) { pinFails = 0; pinBlockedUntil = Date.now() + 60 * 1000; }
    if (typeof showToast === 'function') showToast('ばんごうが ちがうよ');
  }
}

// ---- ロックの ついたり きえたり ----
function applyLockUI() {
  const locked = isLocked();
  const input = document.getElementById('player-name');
  const field = input && input.closest('.player-name-box');
  if (input) input.disabled = locked;
  if (field) field.classList.toggle('hidden', locked);
  const saved = document.getElementById('player-name-saved');
  if (saved) saved.classList.toggle('locked', locked);

  const box = document.getElementById('lock-box');
  if (!box) return;
  box.innerHTML = '';
  const line = document.createElement('p');
  line.className = 'panel-desc';
  const row = document.createElement('div');
  row.className = 'btn-row';
  if (locked) {
    line.textContent = `🔒 この iPad は「${lockedName()}」せんようです。なまえを かえるときは、おうちの人が ばんごうで ロックを ときます。`;
    row.appendChild(lockButton('🔓 ロックを とく（おうちの人）', async () => {
      if (await requireParent('ロックを とく')) {
        lockWrite(LOCK_KEY, null);
        applyLockUI();
        renderPlayerNameSaved();
        if (typeof showToast === 'function') showToast('ロックを ときました');
      }
    }));
  } else {
    const name = state.playerName;
    line.textContent = name
      ? `いまの なまえは「${name}」。この iPad を この子 せんようにすると、なまえを かえられなくなります。`
      : 'なまえを いれると、この iPad を その子 せんようにできます。';
    if (name) {
      row.appendChild(lockButton(`🔒 「${name}」せんようにする`, async () => {
        if (await requireParent('ロックを かける')) {
          lockWrite(LOCK_KEY, state.playerName);
          applyLockUI();
          renderPlayerNameSaved();
          if (typeof showToast === 'function') showToast(`この iPad は「${state.playerName}」せんように しました`);
        }
      }));
    }
  }
  box.appendChild(line);
  box.appendChild(row);
  const pinRow = document.createElement('div');
  pinRow.className = 'btn-row';
  pinRow.appendChild(lockButton(hasPin() ? '🔑 ばんごうを かえる（おうちの人）' : '🔑 ばんごうを きめる（おうちの人）', async () => {
    if (hasPin()) {
      if (!(await requireParent('いまの ばんごう'))) return;
      const pin = await lockPinDialog('あたらしい 4けたの ばんごうを きめてね', true);
      if (pin) { await lockSetPin(pin); if (typeof showToast === 'function') showToast('ばんごうを かえたよ'); }
    } else {
      if (await requireParent()) applyLockUI();
    }
  }));
  box.appendChild(pinRow);
}

function lockButton(label, fn) {
  const b = document.createElement('button');
  b.className = 'sub-btn wide';
  b.textContent = label;
  b.addEventListener('click', fn);
  return b;
}

// アップデートで この仕組みが はじめて 入ったとき、いま えらばれている なまえで ロックする
// （おうちの人用の たんまつは ロックしない）
(function autoLockOnce() {
  if (lockRead(LOCK_INIT_KEY) === '1') return;
  lockWrite(LOCK_INIT_KEY, '1');
  if (lockRead('manabi_parentmode') === '1') return;
  const name = lockRead('manabi_playername');
  if (name) lockWrite(LOCK_KEY, name);
})();

// ロック中は、ほかの なまえに かわらない ようにする
if (isLocked()) {
  state.playerName = lockedName();
  const inp = document.getElementById('player-name');
  if (inp) inp.value = state.playerName;
}
if (isLocked()) {
  lockWrite('manabi_playername', state.playerName);
  if (typeof registerPlayerName === 'function') registerPlayerName(state.playerName);
}
renderPlayerNameSaved();
applyLockUI();
