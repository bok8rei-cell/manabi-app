// ===== バーガークエスト：みんなで 1しゅうかん（7日）がんばって、ごほうびを もらう =====
// ・おうちの人が 親の画面から「クエストを 出す」（なまえ・ごほうびの なまえ・開始日・必要な日数を えらぶ）。
// ・7日の うち「そだちポイント3つの 日」が 必要日数（ふつう5日）いじょう ある子が、ぜんいん そろったら「バーガーセット券」。
//   4人でも だめ。ぜんいんが そろったときだけ。
// ・7日ぜんぶ 3ポイントの 子は、さらに「サイドメニュー券」（セット券が 出たときだけ）。
// ・ひとりずつの ごほうび：必要日数に たっしたら +100コイン、7日ぜんぶで さらに +100コイン（クエストの せいこう・しっぱいに かかわらず）。
// ・券は おうちの人が 親の画面で「使った」に する。ほんものの ごほうびを 買うのは おうちの人。
// きろく：
//   `manabi_burger` = { id, title, reward, side, start, days, need, names:[], t, used:{なまえ:{set,side}}, closed }（おうち ぜんたい。どうきは あたらしい t／おなじ id なら used を あわせる）
//   `manabi_pdays_{なまえ}` = { 'YYYY-MM-DD': 1 }（そだちポイント 3つ そろった日。どうきは あわせる）

const BURGER_KEY = 'manabi_burger';
const BURGER_DAYS = 7;
const BURGER_NEED_DEFAULT = 5;
const BURGER_COIN_NEED = 100;
const BURGER_COIN_FULL = 100;
const BURGER_SHOW_AFTER_END = 3;   // おわって から ふつうは 3日 みせる（券が のこって いるあいだは ずっと）

// ---- 3ポイントの 日 ----
function pdaysKey(name) { return `manabi_pdays_${playerTag(name)}`; }
function loadPdays(name) {
  const o = readJSON(pdaysKey(name), {});
  return o && typeof o === 'object' && !Array.isArray(o) ? o : {};
}
// pet.js の awardPet から、その日 はじめて 3つ そろった ときに よばれる
function recordPointDay() {
  const o = loadPdays();
  const t = localDateStr();
  if (o[t]) return;
  o[t] = 1;
  const days = Object.keys(o).sort();
  while (days.length > 120) delete o[days.shift()];
  writeJSON(pdaysKey(), o);
}
// その子が その日 3ポイントそろって いたか（このバージョンより まえに そろった きょうの ぶんも ひろう）
function isPointDay(name, date) {
  if (loadPdays(name)[date]) return true;
  const g = loadPet(name).growthDay;
  return !!(g && g.date === date && g.base && g.amount && g.mission);
}

// ---- クエストの きろく ----
function loadBurger() {
  try {
    const q = JSON.parse(localStorage.getItem(BURGER_KEY) || 'null');
    return (q && q.id && q.start && Array.isArray(q.names)) ? q : null;
  } catch (e) { return null; }
}
function saveBurger(q) {
  q.t = Date.now();
  localStorage.setItem(BURGER_KEY, JSON.stringify(q));
}
function burgerEnd(q) { return addDaysStr(q.start, q.days - 1); }
function burgerDates(q) { return Array.from({ length: q.days }, (_, i) => addDaysStr(q.start, i)); }

// 1人ぶんの ようす：{ done, flags:['done'|'miss'|'today'|'future'], left（のこりの チャンスの日）, clear, full, impossible }
function burgerPerson(q, name) {
  const today = localDateStr();
  const dates = burgerDates(q);
  const flags = dates.map(d => {
    if (isPointDay(name, d)) return 'done';
    if (d < today) return 'miss';
    return d === today ? 'today' : 'future';
  });
  const done = flags.filter(f => f === 'done').length;
  const left = flags.filter(f => f === 'today' || f === 'future').length;
  return { done, flags, left, clear: done >= q.need, full: done >= q.days, impossible: done + left < q.need };
}

// クエスト ぜんたいの ようす：'soon'（まだ はじまってない）| 'going' | 'cleared'（ぜんいん そろった）| 'failed'
function burgerStatus(q) {
  const today = localDateStr();
  const people = {};
  q.names.forEach(n => { people[n] = burgerPerson(q, n); });
  const all = q.names.length > 0 && q.names.every(n => people[n].clear);
  const any_impossible = q.names.some(n => people[n].impossible);
  let phase;
  if (all) phase = 'cleared';
  else if (q.start > today) phase = 'soon';
  else if (any_impossible || today > burgerEnd(q)) phase = 'failed';
  else phase = 'going';
  return { phase, people, today, end: burgerEnd(q), daysToStart: Math.max(0, daysBetween(today, q.start)) };
}
function daysBetween(a, b) {
  const [y1, m1, d1] = a.split('-').map(Number), [y2, m2, d2] = b.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}

// 券（セットは ぜんいん。サイドは 7日ぜんぶの 子だけ）：[{ kind:'set'|'side', name, label, used }]
function burgerTickets(q, st) {
  if (st.phase !== 'cleared') return [];
  const out = [];
  q.names.forEach(n => {
    const u = (q.used && q.used[n]) || {};
    out.push({ kind: 'set', name: n, label: `🍔 ${q.reward}けん`, used: !!u.set });
    if (st.people[n].full) out.push({ kind: 'side', name: n, label: `🍟 ${q.side}けん`, used: !!u.side });
  });
  return out;
}

// ひょうじ する ときか（おわって しばらくで けす。券が のこって いれば のこす）
function burgerVisible(q) {
  if (!q || q.closed) return false;
  const st = burgerStatus(q);
  if (st.phase === 'cleared') return burgerTickets(q, st).some(t => !t.used) || daysBetween(st.end, st.today) <= BURGER_SHOW_AFTER_END;
  if (st.phase === 'failed') return daysBetween(st.end, st.today) <= BURGER_SHOW_AFTER_END;
  return true;
}

// ---- ごほうび（ひとりずつ の コイン）。いまの子の ぶんを わたす。わたした ぶんの コインと ラベルを かえす ----
function settleBurgerBonus() {
  const q = loadBurger();
  const name = state.playerName.trim();
  if (!q || q.closed || !name || !q.names.includes(name) || q.start > localDateStr()) return { coins: 0, labels: [] };
  const per = burgerPerson(q, name);
  const p = loadPet();
  const paid = petPaid(p);
  let coins = 0;
  const labels = [];
  if (per.clear && !paid.burger.includes(`${q.id}:n`)) { paid.burger.push(`${q.id}:n`); coins += BURGER_COIN_NEED; labels.push(`${q.title}：${q.need}日 たっせい`); }
  if (per.full && !paid.burger.includes(`${q.id}:f`)) { paid.burger.push(`${q.id}:f`); coins += BURGER_COIN_FULL; labels.push(`${q.title}：${q.days}日ぜんぶ たっせい`); }
  if (coins > 0) { p.coins += coins; writeJSON(petKey(), p); }
  return { coins, labels };
}

// ---- ホームの カード（みんなで 見る）----
function burgerDots(flags) {
  const wrap = el('span', 'bq-dots');
  flags.forEach(f => wrap.appendChild(el('span', `bq-dot ${f}`, f === 'done' ? '●' : (f === 'miss' ? '×' : '○'))));
  return wrap;
}

function appendBurgerCard(root) {
  const q = loadBurger();
  if (!state.playerName.trim() || !burgerVisible(q)) return;
  const bonus = settleBurgerBonus();
  if (bonus.coins > 0 && typeof showToast === 'function') showToast(`🍔 ごほうび +${bonus.coins}コイン（${bonus.labels.join('／')}）`);
  const st = burgerStatus(q);
  const card = el('div', 'panel food-card burger-panel');
  card.appendChild(el('div', 'bq-title', `🍔 ${q.title}`));

  if (st.phase === 'soon') {
    card.appendChild(el('div', 'bq-note', `もうすぐ はじまるよ！ あと ${st.daysToStart}日（${Number(q.start.split('-')[1])}月${Number(q.start.split('-')[2])}日から ${q.days}日かん）`));
    card.appendChild(el('div', 'bq-note', `みんなで ${q.days}日の うち ${q.need}日 以上、「そだちポイント 3つ」を そろえると ${q.reward}！`));
    root.appendChild(card);
    return;
  }

  const head = {
    going: `みんなで ${q.days}日の うち ${q.need}日 以上、そだちポイント 3つを そろえよう！ ぜんいんが そろうと ${q.reward}けん！`,
    cleared: `🎉 みんな クリア！ ${q.reward}けん ゲット！`,
    failed: 'ざんねん… こんかいは ぜんいん そろわなかったよ。また つぎの チャンスを まとう！'
  }[st.phase];
  card.appendChild(el('div', 'bq-note' + (st.phase === 'cleared' ? ' bq-win' : ''), head));
  if (st.phase !== 'failed') card.appendChild(el('div', 'bq-note', `🍟 ${q.days}日ぜんぶ そろえた 人は、${q.side}も つけられるよ！（ぜんいん クリアの ときだけ）`));

  const me = state.playerName.trim();
  q.names.forEach(n => {
    const per = st.people[n];
    const row = el('div', 'bq-row' + (n === me ? ' me' : ''));
    row.appendChild(el('span', 'bq-name', n));
    row.appendChild(burgerDots(per.flags));
    let tail;
    if (per.full) tail = `${per.done}日 ⭐`;
    else if (per.clear) tail = `${per.done}日 ✅`;
    else if (per.impossible) tail = `${per.done}日 😢`;
    else tail = `あと ${q.need - per.done}日`;
    row.appendChild(el('span', 'bq-tail' + (per.clear ? ' ok' : ''), tail));
    card.appendChild(row);
  });
  card.appendChild(el('div', 'bq-legend', '● できた　× できなかった　○ これから／きょう'));

  const tickets = burgerTickets(q, st);
  if (tickets.length > 0) {
    const box = el('div', 'bq-tickets');
    tickets.forEach(t => box.appendChild(el('div', 'bq-ticket' + (t.used ? ' used' : ''), `${t.label}（${t.name}）${t.used ? '：つかったよ' : ''}`)));
    card.appendChild(box);
    const key = `manabi_burger_seen_${q.id}`;
    if (!localStorage.getItem(key)) {
      try { localStorage.setItem(key, '1'); } catch (e) { /* 無視 */ }
      if (typeof FX !== 'undefined') FX.levelUp();
    }
  }
  root.appendChild(card);
}

// ---- おうちの人の 画面 ----
function appendBurgerParent(root) {
  const q = loadBurger();
  const panel = el('div', 'panel burger-parent');
  panel.appendChild(el('div', 'bq-title', '🍔 バーガークエスト'));
  const active = q && !q.closed;
  if (!active) {
    panel.appendChild(el('div', 'report-line', 'みんなで 7日の うち 決めた 日数 以上、「そだちポイント 3つ」を そろえたら ごほうび券。ぜんいんが そろったときだけです。7日ぜんぶの 子には サイド券も。'));
    const form = el('div', 'bq-form');
    const mk = (label, value, maxlen) => {
      const w = el('label', 'bq-field');
      w.appendChild(el('span', '', label));
      const i = document.createElement('input');
      i.type = 'text'; i.value = value; i.maxLength = maxlen;
      w.appendChild(i);
      form.appendChild(w);
      return i;
    };
    const iTitle = mk('クエストの なまえ', 'バーガークエスト', 14);
    const iReward = mk('ごほうびの なまえ', 'バーガーセット', 14);
    const iSide = mk('7日ぜんぶの 子の ごほうび', 'サイドメニュー', 14);
    const wDate = el('label', 'bq-field');
    wDate.appendChild(el('span', '', 'はじまる 日'));
    const iDate = document.createElement('input');
    iDate.type = 'date'; iDate.value = localDateStr(); iDate.min = localDateStr();
    wDate.appendChild(iDate);
    form.appendChild(wDate);
    const wNeed = el('label', 'bq-field');
    wNeed.appendChild(el('span', '', `${BURGER_DAYS}日の うち なん日 そろえる？`));
    const sNeed = document.createElement('select');
    [3, 4, 5, 6, 7].forEach(n => { const o = document.createElement('option'); o.value = String(n); o.textContent = `${n}日`; if (n === BURGER_NEED_DEFAULT) o.selected = true; sNeed.appendChild(o); });
    wNeed.appendChild(sNeed);
    form.appendChild(wNeed);
    panel.appendChild(form);
    const names = loadPlayerNames();
    panel.appendChild(el('div', 'report-line diag-line', `さんかする 子：${names.join('、') || 'まだ いません'}（いま とうろく されている ぜんいん）`));
    const go = el('button', 'main-btn wide', '🍔 クエストを 出す');
    go.addEventListener('click', () => {
      const date = iDate.value || localDateStr();
      if (date < localDateStr()) { showToast('はじまる 日は きょう いこうに してね'); return; }
      if (names.length < 2) { showToast('2人 以上 とうろく されて いる ときに 出せます'); return; }
      const nm = (iTitle.value.trim() || 'バーガークエスト');
      askConfirm(`「${nm}」を 出す？\n${date}から ${BURGER_DAYS}日かん。ぜんいん（${names.length}人）が ${sNeed.value}日 以上で ${iReward.value.trim() || 'バーガーセット'}けん。\n（みんなの ホームに 出ます）`, '出す', 'やめる', () => {
        saveBurger({
          id: `bq-${Date.now().toString(36)}`, title: nm, reward: iReward.value.trim() || 'バーガーセット', side: iSide.value.trim() || 'サイドメニュー',
          start: date, days: BURGER_DAYS, need: Number(sNeed.value), names: names.slice(), used: {}, closed: false
        });
        autoSync();
        showToast('クエストを 出したよ！');
        renderParent();
      }, { cancelFirst: true });
    });
    panel.appendChild(go);
    if (q && q.closed) panel.appendChild(el('div', 'report-line diag-line', 'まえの クエストは おわりに しました。'));
    root.appendChild(panel);
    return;
  }

  const st = burgerStatus(q);
  const stateWord = { soon: `${st.daysToStart}日後に はじまります`, going: 'ちょうせんちゅう', cleared: '🎉 ぜんいん クリア！', failed: 'ざんねん（ぜんいん そろいませんでした）' }[st.phase];
  panel.appendChild(el('div', 'report-line', `「${q.title}」 ${q.start} 〜 ${st.end}（${q.need}日 いじょうで ${q.reward}）／${stateWord}`));
  q.names.forEach(n => {
    const per = st.people[n];
    const row = el('div', 'bq-row');
    row.appendChild(el('span', 'bq-name', n));
    row.appendChild(burgerDots(per.flags));
    row.appendChild(el('span', 'bq-tail' + (per.clear ? ' ok' : ''), per.full ? `${per.done}日 ⭐` : (per.clear ? `${per.done}日 ✅` : (per.impossible ? `${per.done}日 😢` : `${per.done}日（あと ${q.need - per.done}日）`))));
    panel.appendChild(row);
  });
  const tickets = burgerTickets(q, st);
  tickets.forEach(t => {
    const row = el('div', 'bq-ticket-row');
    row.appendChild(el('span', 'bq-ticket' + (t.used ? ' used' : ''), `${t.label}（${t.name}）`));
    const b = el('button', t.used ? 'sub-btn' : 'main-btn', t.used ? 'もどす' : '使った');
    b.addEventListener('click', () => {
      const cur = loadBurger();
      if (!cur) return;
      cur.used = cur.used || {};
      cur.used[t.name] = Object.assign({}, cur.used[t.name]);
      cur.used[t.name][t.kind] = t.used ? 0 : Date.now();
      saveBurger(cur);
      autoSync();
      renderParent();
    });
    row.appendChild(b);
    panel.appendChild(row);
  });
  const unused = tickets.filter(t => !t.used).length;
  const end = el('button', 'sub-btn wide', st.phase === 'soon' || st.phase === 'going' ? 'クエストを とりけす' : 'クエストを おわりにする');
  end.addEventListener('click', () => {
    askConfirm(`${unused > 0 ? `まだ 使っていない 券が ${unused}まい あります。\n` : ''}「${q.title}」を ${st.phase === 'soon' || st.phase === 'going' ? 'とりけす' : 'おわりにする'}？\n（みんなの ホームから きえます）`, 'する', 'やめる', () => {
      const cur = loadBurger();
      if (cur) { cur.closed = true; saveBurger(cur); autoSync(); }
      renderParent();
    }, { cancelFirst: true });
  });
  panel.appendChild(end);
  root.appendChild(panel);
}
