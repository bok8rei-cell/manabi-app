// ===== ルーレット：1日1かい、コインや かざりが あたる =====
// ・ノーマルルーレット：その日の「そだちポイント 3つ」が そろったら 1かい（コイン 50〜500）
// ・スペシャルルーレット：その日の べんきょうが 60ぷん に なったら 1かい（コイン 200〜1000 か、かざりが 1つ）
// けっかは「なまえ・日付・ルーレットの しゅるい」から きまる（とじても やりなおしても かわらない。ほかの たんまつでも おなじ）。
// もらった きろくは pet.paid.roulette（'日付:n' / '日付:s'）に のこし、どうきしても 2かい もらえない。

const ROULETTE_SPECIAL_SEC = 3600;
// 10この わくの うち 1こが あたる（コインの ごうけい ÷ 10 が へいきん：ノーマル 約150、スペシャル 約410）
const ROULETTE_WHEELS = {
  n: { name: 'ノーマル ルーレット', slots: [50, 50, 50, 50, 100, 100, 100, 200, 300, 500] },
  s: { name: 'スペシャル ルーレット', slots: [200, 200, 200, 300, 300, 300, 500, 500, 1000, 'item'] }
};
const ROULETTE_COLORS = ['#FFD66B', '#FF9F7A', '#8FD3A8', '#8CC7F0', '#C9A7F0'];
const ROULETTE_ITEM_MAX_PRICE = 1500;   // かざりの あたりは この ねだんまで（でんせつ・スーパーレアは でない）

// なまえ・日付・しゅるいから 0以上1みまんの かずを つくる（いつも おなじ けっか）
function rouletteRand(date, kind, name) {
  const s = `${playerTag(name)}|${date}|${kind}|poko-roulette`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  h ^= h >>> 15; h = Math.imul(h, 2246822507); h ^= h >>> 13; h = Math.imul(h, 3266489909); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function rouletteKey(date, kind) { return `${date}:${kind}`; }
function rouletteDone(p, date, kind) { return petPaid(p).roulette.includes(rouletteKey(date, kind)); }

// いま まわせるか：'ready' | 'done' | 'locked'
function rouletteState(kind, p) {
  const pet = p || loadPet();
  const today = localDateStr();
  if (rouletteDone(pet, today, kind)) return 'done';
  if (kind === 'n') return petDayAllDone(pet) ? 'ready' : 'locked';
  return studySecondsOn(today) >= ROULETTE_SPECIAL_SEC ? 'ready' : 'locked';
}

function rouletteItemChoices(name) {
  const own = loadShop(name).own;
  // あたま・め・ほっぺ・くち・くび・いろ・はいけい の かざりだけ（からだの ふく・くつは ポコまる いじょうで ないと つけられないので ぬく）
  const faceSlots = SHOP_SLOTS.filter(sl => !sl.gift).map(sl => sl.key);
  return SHOP_ITEMS.filter(it => !it.gift && !it.special && faceSlots.includes(it.slot) && it.price <= ROULETTE_ITEM_MAX_PRICE && !own[it.id]);
}

// けっかを きめる（まだ わたさない）：{ idx, coins, itemId, label }
function roulettePlan(kind, name) {
  const date = localDateStr();
  const slots = ROULETTE_WHEELS[kind].slots;
  const idx = Math.floor(rouletteRand(date, kind, name) * slots.length);
  const slot = slots[idx];
  if (slot === 'item') {
    const list = rouletteItemChoices(name);
    if (list.length > 0) {
      const it = list[Math.floor(rouletteRand(date, kind + 'i', name) * list.length)];
      return { idx, coins: 0, itemId: it.id, label: `かざり「${it.name}」` };
    }
    return { idx, coins: 500, itemId: '', label: '500コイン（かざりを ぜんぶ もっていたので）' };
  }
  return { idx, coins: slot, itemId: '', label: `${slot}コイン` };
}

// スペシャルの いちばんのり（おうち ぜんたいで 1人だけ。はやい ほうが かち。どうきで きまる）
const FIRST_KEY = 'manabi_first_special';
const FIRST_COINS = 1000;
const FIRST_ITEM = 'firstmedal';
function rouletteFirst() {
  try { const o = JSON.parse(localStorage.getItem(FIRST_KEY) || 'null'); return (o && o.t && o.n) ? o : null; } catch (e) { return null; }
}

// まわして、あたった ものを わたす。まわせないときは null
function rouletteSpin(kind) {
  const p = loadPet();
  if (rouletteState(kind, p) !== 'ready') return null;
  const today = localDateStr();
  const plan = roulettePlan(kind);
  const paid = petPaid(p);
  paid.roulette.push(rouletteKey(today, kind));
  p.coins += plan.coins;
  // スペシャルの いちばんのり：まだ だれも いないなら この子。きまっている子が この子で、まだ わたしていなければ わたす
  if (kind === 's') {
    let first = rouletteFirst();
    if (!first) { first = { n: state.playerName.trim(), t: Date.now(), d: today }; localStorage.setItem(FIRST_KEY, JSON.stringify(first)); }
    if (playerTag(first.n) === playerTag() && !paid.roulette.includes('first:s')) {
      paid.roulette.push('first:s');
      p.coins += FIRST_COINS;
      plan.first = true;
      plan.label += `\n🏅 スペシャル いちばんのり！\n「いちばんのり きんのメダル」と ${FIRST_COINS}コイン`;
    }
  }
  writeJSON(petKey(), p);
  if (plan.first) { const s0 = loadShop(); s0.own[FIRST_ITEM] = 1; saveShop(s0); }
  if (plan.itemId) {
    const s = loadShop();
    s.own[plan.itemId] = 1;
    saveShop(s);
  }
  try {
    const rec = JSON.parse(localStorage.getItem(`manabi_roulette_${playerTag()}`) || '{}');
    if (rec.date !== today) { rec.date = today; rec.n = ''; rec.s = ''; }
    rec[kind] = plan.label.split('\n')[0] + (plan.first ? ' 🏅' : '');
    localStorage.setItem(`manabi_roulette_${playerTag()}`, JSON.stringify(rec));
  } catch (e) { /* 表示だけ。なくても こまらない */ }
  return plan;
}

function rouletteResultToday(kind) {
  try {
    const rec = JSON.parse(localStorage.getItem(`manabi_roulette_${playerTag()}`) || '{}');
    return rec.date === localDateStr() ? (rec[kind] || '') : '';
  } catch (e) { return ''; }
}

// ---- 絵 ----
function rouletteWheelSVG(kind) {
  const slots = ROULETTE_WHEELS[kind].slots;
  const n = slots.length, step = 360 / n, R = 100;
  const pt = (deg, r) => { const a = deg * Math.PI / 180; return [(r * Math.sin(a)).toFixed(2), (-r * Math.cos(a)).toFixed(2)]; };
  let g = '';
  slots.forEach((slot, i) => {
    const a0 = i * step - step / 2, a1 = i * step + step / 2;
    const [x0, y0] = pt(a0, R), [x1, y1] = pt(a1, R);
    const fill = slot === 'item' ? '#FF8FB8' : ROULETTE_COLORS[i % ROULETTE_COLORS.length];
    g += `<path d="M0 0 L${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1} Z" fill="${fill}" stroke="#fff" stroke-width="2"/>`;
    const label = slot === 'item' ? '🎁' : String(slot);
    g += `<text transform="rotate(${i * step}) translate(0 -66)" text-anchor="middle" dominant-baseline="middle" font-size="${slot === 'item' ? 22 : 17}" font-weight="800" fill="#3b2f2a">${label}</text>`;
  });
  return `<svg class="roulette-svg" viewBox="-108 -108 216 216" aria-hidden="true">` +
    `<g class="roulette-wheel">${g}<circle r="14" fill="#fff" stroke="#e0d3c8" stroke-width="2"/></g>` +
    `<path d="M-9 -108 L9 -108 L0 -88 Z" fill="#E5484D" stroke="#fff" stroke-width="2"/></svg>`;
}

// まわす画面
function openRoulette(kind) {
  if (document.querySelector('.roulette-modal')) return;
  const w = ROULETTE_WHEELS[kind];
  const wrap = el('div', 'modal roulette-modal');
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');
  const card = el('div', 'modal-card roulette-card');
  card.appendChild(el('div', 'roulette-title', `🎰 ${w.name}`));
  const stage = el('div', 'roulette-stage');
  stage.innerHTML = rouletteWheelSVG(kind);
  card.appendChild(stage);
  const result = el('div', 'roulette-result', 'ボタンを おして まわそう！');
  card.appendChild(result);
  const go = el('button', 'main-btn wide', 'まわす！');
  const close = el('button', 'sub-btn wide', 'やめる');
  card.appendChild(go);
  card.appendChild(close);
  wrap.appendChild(card);
  document.body.appendChild(wrap);
  let spun = false, spinning = false;
  const done = () => { wrap.remove(); if (typeof renderHome === 'function') renderHome(); };
  close.addEventListener('click', () => { if (!spinning) done(); });
  go.addEventListener('click', () => {
    if (spun) { done(); return; }
    const plan = rouletteSpin(kind);
    if (!plan) { result.textContent = 'いまは まわせないよ'; go.textContent = 'とじる'; spun = true; return; }
    spun = true; spinning = true;
    go.disabled = true; close.disabled = true;
    const step = 360 / w.slots.length;
    const turn = 360 * 5 - plan.idx * step + (Math.random() * 0.6 - 0.3) * step;
    const wheel = stage.querySelector('.roulette-wheel');
    wheel.style.transition = 'transform 4s cubic-bezier(0.15, 0.7, 0.2, 1)';
    wheel.style.transform = `rotate(${turn}deg)`;
    if (typeof FX !== 'undefined') FX.tap();
    setTimeout(() => {
      spinning = false;
      result.textContent = `🎉 ${plan.label} が あたった！`;
      result.classList.add('hit');
      if (typeof FX !== 'undefined') { if (plan.itemId || plan.coins >= 500) FX.levelUp(); else FX.correct(); }
      go.disabled = false; close.disabled = false;
      go.textContent = 'やったー！';
      close.style.display = 'none';
    }, 4200);
  });
}

// ホームの「ごはん」の したに ならべる カード
function appendRouletteCard(root) {
  if (!state.playerName.trim()) return;
  const p = loadPet();
  const card = el('div', 'panel food-card roulette-panel');
  card.appendChild(el('div', 'food-head')).appendChild(el('span', 'food-title', '🎰 きょうの ルーレット'));
  const first = rouletteFirst();
  if (!first) {
    card.appendChild(el('div', 'roulette-first', `👑 スペシャルで「いちばんのり」の 子だけ、ここでしか 手に入らない「いちばんのり きんのメダル」と ${FIRST_COINS}コインが もらえるよ！（まだ だれも たっせい していないよ）`));
  } else {
    const d = String(first.d || '').split('-');
    const when = d.length === 3 ? `（${Number(d[1])}月${Number(d[2])}日）` : '';
    const mine = playerTag(first.n) === playerTag();
    card.appendChild(el('div', 'roulette-first got', `🏅 スペシャル いちばんのりは ${first.n} さん${when}${mine ? ' ← あなた！' : ''}`));
  }
  const today = localDateStr();
  [['n', 'そだちポイント 3つで 1かい'], ['s', `べんきょう 60ぷんで 1かい（いま ${formatStudy(studySecondsOn(today))}）`]].forEach(([kind, cond]) => {
    const st = rouletteState(kind, p);
    const row = el('div', 'roulette-row');
    const info = el('div', 'roulette-info');
    info.appendChild(el('div', 'roulette-name', ROULETTE_WHEELS[kind].name));
    const got = rouletteResultToday(kind);
    info.appendChild(el('div', 'roulette-cond', st === 'done' ? `きょうは まわしたよ${got ? `：${got}` : ''}` : cond));
    row.appendChild(info);
    const btn = el('button', st === 'ready' ? 'main-btn' : 'sub-btn', st === 'ready' ? 'まわす！' : (st === 'done' ? 'おわり' : '🔒'));
    btn.disabled = st !== 'ready';
    btn.addEventListener('click', () => openRoulette(kind));
    row.appendChild(btn);
    card.appendChild(row);
  });
  root.appendChild(card);
}
