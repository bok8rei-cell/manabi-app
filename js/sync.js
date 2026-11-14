// ---- 端末間のデータ同期（書き出し・読み込み） ----
function collectSyncData() {
  // playerNames（保存された名前の一覧）も含める。これを入れないと
  // 同期しても「今選んでいる1人」しか相手の端末に渡らない。
  const data = { progress: {}, ranking: {}, diff: {}, extras: {}, playerName: state.playerName, playerNames: loadPlayerNames(), deletedNames: loadDeletedNames() };
  // 全プレイヤーぶんの進捗・難易度を集める（名前別キーをまるごとスキャン）。
  // 旧形式（全員合算/共通）のキーは同期に乗せない。
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (key.indexOf('manabi_progress_') === 0 && !isLegacyProgressKey(key)) {
      try { data.progress[key] = JSON.parse(localStorage.getItem(key)); } catch (e) {}
    } else if (key.indexOf('manabi_diff_') === 0 && !isLegacyDiffKey(key)) {
      data.diff[key] = localStorage.getItem(key);
    } else if (EXTRA_PREFIXES.some(pre => key.indexOf(pre) === 0)) {
      data.extras[key] = localStorage.getItem(key);
    }
  }
  ALL_GRADES.forEach(grade => {
    const rKey = rankingKey(grade);
    const raw = localStorage.getItem(rKey);
    if (raw) data.ranking[rKey] = JSON.parse(raw);
  });
  const speedRaw = localStorage.getItem(SPEED_RANKING_KEY);
  if (speedRaw) data.ranking[SPEED_RANKING_KEY] = JSON.parse(speedRaw);
  return data;
}

// ---- ポコ・にがて・毎日の連続日数も同期する ----
const EXTRA_PREFIXES = ['manabi_pet_', 'manabi_mistakes_', 'manabi_daystreak_', 'manabi_history_', 'manabi_grade_', 'manabi_skip_', 'manabi_recent_', 'manabi_week_', 'manabi_solo_', 'manabi_shop_', 'manabi_subj_', 'manabi_taper_', 'manabi_unit_', 'manabi_focus_', 'manabi_msg_', 'manabi_time_'];

function parseJSONOr(raw, fallback) {
  try { return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; }
}

// 2つの端末の値を、同期を何回しても増えすぎないように合成する（大きい方・新しい方を採用）
function mergeExtra(key, rawA, rawB) {
  if (!rawA) return rawB;
  if (!rawB) return rawA;
  if (key.indexOf('manabi_pet_') === 0) {
    const a = parseJSONOr(rawA, {}), b = parseJSONOr(rawB, {});
    const out = {};
    ['xp', 'coins', 'spent', 'perfects', 'missions', 'cleared', 'growth'].forEach(f => { out[f] = Math.max(a[f] || 0, b[f] || 0); });
    const ga = a.growthDay || { date: '' }, gb = b.growthDay || { date: '' };
    out.growthDay = ga.date > gb.date ? ga : (gb.date > ga.date ? gb : {
      date: ga.date, base: !!(ga.base || gb.base), amount: !!(ga.amount || gb.amount), mission: !!(ga.mission || gb.mission), c: Math.max(ga.c || 0, gb.c || 0),
      food: Math.max(ga.food || 0, gb.food || 0), counted: !!(ga.counted || gb.counted)
    });
    // もらった ボーナスの きろくは 和集合（2かい もらえないように）
    out.paid = {};
    ['streak', 'level', 'badge', 'quest'].forEach(k => { out.paid[k] = Array.from(new Set([...((a.paid || {})[k] || []), ...((b.paid || {})[k] || [])])); });
    return JSON.stringify(out);
  }
  if (key.indexOf('manabi_daystreak_') === 0) {
    const a = parseJSONOr(rawA, {}), b = parseJSONOr(rawB, {});
    const newer = ((a.last || '') > (b.last || '')) ? a : (((a.last || '') < (b.last || '')) ? b : (a.count >= b.count ? a : b));
    return JSON.stringify({ last: newer.last || null, count: newer.count || 0, best: Math.max(a.best || 0, b.best || 0) });
  }
  if (key.indexOf('manabi_recent_') === 0) {
    const a = parseJSONOr(rawA, {}), b = parseJSONOr(rawB, {});
    const out = {};
    new Set([...Object.keys(a), ...Object.keys(b)]).forEach(k => {
      const x = a[k], y = b[k];
      out[k] = !x ? y : (!y ? x : ((y.t || 0) > (x.t || 0) ? y : x));   // あたらしい方の きろくを採用
    });
    return JSON.stringify(out);
  }
  if (key.indexOf('manabi_skip_') === 0) {
    const a = parseJSONOr(rawA, {}), b = parseJSONOr(rawB, {});
    const out = {};
    new Set([...Object.keys(a), ...Object.keys(b)]).forEach(k => {
      const x = a[k], y = b[k];
      out[k] = !x ? y : (!y ? x : ((y.t || 0) > (x.t || 0) ? y : x));   // あたらしい方（もどした／けした）を採用
    });
    return JSON.stringify(out);
  }
  if (key.indexOf('manabi_time_') === 0) {   // べんきょう じかん：日付ごと・たんまつごとに 大きい ほう
    const a = parseJSONOr(rawA, {}), b = parseJSONOr(rawB, {});
    const out = {};
    new Set([...Object.keys(a), ...Object.keys(b)]).forEach(d => {
      const x = a[d] || {}, y = b[d] || {};
      out[d] = {};
      new Set([...Object.keys(x), ...Object.keys(y)]).forEach(dev => { out[d][dev] = Math.max(Number(x[dev]) || 0, Number(y[dev]) || 0); });
    });
    return JSON.stringify(out);
  }
  if (key.indexOf('manabi_msg_') === 0) {   // おうちの人からの メッセージ：あたらしい ほう。おなじ なら 既読（readT）は 大きい ほう
    const a = parseJSONOr(rawA, {}), b = parseJSONOr(rawB, {});
    const newer = (b.t || 0) > (a.t || 0) ? b : a;
    const same = (a.t || 0) === (b.t || 0);
    return JSON.stringify(Object.assign({}, newer, { readT: same ? Math.max(a.readT || 0, b.readT || 0) : (newer.readT || 0) }));
  }
  if (key.indexOf('manabi_focus_') === 0) {   // 学校で やっている たんげん：あたらしく えらんだ ほう
    const a = parseJSONOr(rawA, {}), b = parseJSONOr(rawB, {});
    return JSON.stringify((b.t || 0) > (a.t || 0) ? b : a);
  }
  if (key.indexOf('manabi_unit_') === 0) {   // たんげんべつの せいかい数：たんげんごと・項目ごとに 大きい方（なんども どうきしても ふえない）
    const a = parseJSONOr(rawA, {}), b = parseJSONOr(rawB, {});
    const out = {};
    new Set([...Object.keys(a), ...Object.keys(b)]).forEach(k => {
      const x = a[k] || {}, y = b[k] || {};
      out[k] = { t: Math.max(x.t || 0, y.t || 0), c: Math.max(x.c || 0, y.c || 0), d: [x.d, y.d].filter(Boolean).sort().pop() || '' };
    });
    return JSON.stringify(out);
  }
  if (key.indexOf('manabi_subj_') === 0) {   // 教科べつ せいかい数：週ごと・教科ごとに 大きい方
    const a = parseJSONOr(rawA, {}), b = parseJSONOr(rawB, {});
    const out = {};
    new Set([...Object.keys(a), ...Object.keys(b)]).forEach(w => {
      const x = a[w] || {}, y = b[w] || {};
      out[w] = {};
      new Set([...Object.keys(x), ...Object.keys(y)]).forEach(k => { out[w][k] = Math.max(x[k] || 0, y[k] || 0); });
    });
    return JSON.stringify(out);
  }
  if (key.indexOf('manabi_taper_') === 0) {
    const a = parseJSONOr(rawA, {}), b = parseJSONOr(rawB, {});
    return JSON.stringify({ n: Math.max(a.n || 0, b.n || 0) });
  }
  if (key.indexOf('manabi_shop_') === 0) {
    const a = parseJSONOr(rawA, {}), b = parseJSONOr(rawB, {});
    const newer = (b.t || 0) > (a.t || 0) ? b : a;   // いま つけている ものは あたらしい方、かった ものは どちらも のこす
    return JSON.stringify({ own: Object.assign({}, a.own, b.own), wear: Object.assign({}, newer.wear), fav: Object.assign({}, newer.fav), t: Math.max(a.t || 0, b.t || 0) });
  }
  if (key.indexOf('manabi_solo_') === 0) {
    const a = parseJSONOr(rawA, {}), b = parseJSONOr(rawB, {});
    const newer = (b.t || 0) > (a.t || 0) ? b : a;   // 「そろタッチも やってる」は あたらしい方
    const rank = { done: 3, quit: 2, expired: 1 };
    const log = {};
    new Set([...Object.keys(a.log || {}), ...Object.keys(b.log || {})]).forEach(d => {
      const x = (a.log || {})[d], y = (b.log || {})[d];
      log[d] = !x ? y : (!y ? x : ((rank[y.r] || 0) > (rank[x.r] || 0) ? y : (((rank[y.r] || 0) === (rank[x.r] || 0) && (y.m || 0) > (x.m || 0)) ? y : x)));
    });
    return JSON.stringify({ on: !!newer.on, t: newer.t || 0, days: Object.assign({}, a.days, b.days), paid: Object.assign({}, a.paid, b.paid), log });
  }
  if (key.indexOf('manabi_week_') === 0) {
    const a = parseJSONOr(rawA, {}), b = parseJSONOr(rawB, {});
    const out = {};
    new Set([...Object.keys(a), ...Object.keys(b)]).forEach(w => { out[w] = Math.max(a[w] || 0, b[w] || 0); });
    return JSON.stringify(out);
  }
  if (key.indexOf('manabi_history_') === 0) {
    const a = parseJSONOr(rawA, {}), b = parseJSONOr(rawB, {});
    const out = {};
    new Set([...Object.keys(a), ...Object.keys(b)]).forEach(d => {
      out[d] = { q: Math.max((a[d] || {}).q || 0, (b[d] || {}).q || 0), c: Math.max((a[d] || {}).c || 0, (b[d] || {}).c || 0) };
    });
    return JSON.stringify(out);
  }
  if (key.indexOf('manabi_mistakes_') === 0) {
    const a = parseJSONOr(rawA, []), b = parseJSONOr(rawB, []);
    const seen = new Set();
    const out = [];
    [...a, ...b].forEach(m => {
      if (m && m.id && !seen.has(m.id)) { seen.add(m.id); out.push(m); }
    });
    return JSON.stringify(out.slice(0, MISTAKE_LIMIT));
  }
  return rawA;
}

function mergeExtras(a, b) {
  const out = {};
  new Set([...Object.keys(a || {}), ...Object.keys(b || {})]).forEach(key => {
    const v = mergeExtra(key, (a || {})[key], (b || {})[key]);
    if (v) out[key] = v;
  });
  return out;
}

// ランキングの並び順（タイムアタックは時間が速い順、それ以外は正答率が高い順）
function rankingSortFn(key) {
  if (key === SPEED_RANKING_KEY) {
    return (a, b) => b.correct - a.correct || a.time - b.time || (a.date < b.date ? 1 : -1);
  }
  return (a, b) => b.rate - a.rate || b.correct - a.correct || (a.date < b.date ? 1 : -1);
}

function mergeProgress(a, b) {
  // 足し算ではなく「大きい方を採用」。こうしないと同期のたびに
  // correct/total が二重加算されて水増しされる（同期を何回しても
  // 結果が変わらない＝冪等になるようにする）。
  return {
    correct: Math.max(a.correct || 0, b.correct || 0),
    total: Math.max(a.total || 0, b.total || 0),
    best: Math.max(a.best || 0, b.best || 0),
    streak: Math.max(a.streak || 0, b.streak || 0),
    lastDate: [a.lastDate, b.lastDate].filter(Boolean).sort().pop() || null
  };
}

function applySyncData(data) {
  // 新しいデータ形式：data フィールド（localStorage 全体）を含む
  if (data.data && typeof data.data === 'object') {
    // ローカルストレージ全体を復元
    Object.entries(data.data).forEach(([key, value]) => {
      if (/^manabi_(lock|lock_init|pinhash)$/.test(key)) return;                   // ロックと ばんごうは この端末だけ
      if (key === 'manabi_playername' && isLocked()) return;
      localStorage.setItem(key, value);
    });

    // 復元後、プレイヤー名を画面に反映
    const savedPlayerName = localStorage.getItem('manabi_playername');
    if (savedPlayerName) {
      state.playerName = savedPlayerName;
      document.getElementById('player-name').value = savedPlayerName;
    }
    // 名前の一覧（チップ）を再描画。localStorage 全体を復元したので
    // manabi_playernames も既に入っている。
    renderPlayerNameSaved();

    console.log('✓ クラウドからデータを復元しました');
    return;
  }

  // 古いデータ形式：progress / ranking のトップレベル（後方互換性）
  Object.entries(data.progress || {}).forEach(([key, value]) => {
    if (isLegacyProgressKey(key)) return; // 旧形式（全員合算）は復活させない
    const raw = localStorage.getItem(key);
    const existing = raw ? JSON.parse(raw) : { correct: 0, total: 0, best: 0, streak: 0, lastDate: null };
    localStorage.setItem(key, JSON.stringify(mergeProgress(existing, value)));
  });

  Object.entries(data.ranking || {}).forEach(([key, value]) => {
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify(mergeRankingList(existing, value, key)));
  });

  // 難易度：ローカルとクラウドの高い方を採用
  Object.entries(data.diff || {}).forEach(([key, value]) => {
    if (isLegacyDiffKey(key)) return;
    const cur = parseInt(localStorage.getItem(key));
    const inc = parseInt(value);
    const max = Math.max(isNaN(cur) ? -1 : cur, isNaN(inc) ? -1 : inc);
    if (max >= 0) localStorage.setItem(key, String(max));
  });

  // ポコ・にがて・連続日数：ローカルと合成して保存
  Object.entries(data.extras || {}).forEach(([key, value]) => {
    const merged = mergeExtra(key, localStorage.getItem(key), value);
    if (merged) localStorage.setItem(key, merged);
  });

  if (data.playerName && !state.playerName) {
    state.playerName = data.playerName;
    localStorage.setItem('manabi_playername', state.playerName);
    document.getElementById('player-name').value = state.playerName;
  }
  // けした なまえ：どうきで もどって こないように、きおくして 一覧から のぞく
  saveDeletedNames([...loadDeletedNames(), ...(Array.isArray(data.deletedNames) ? data.deletedNames : [])]);
  const gone = loadDeletedNames();
  if (data.playerName && !gone.includes(data.playerName)) registerPlayerName(data.playerName);

  // 名前の一覧を統合（相手の端末で登録された名前もチップに追加する）
  const incomingNames = Array.isArray(data.playerNames) ? data.playerNames : [];
  if (incomingNames.length || gone.length) {
    const mergedNames = Array.from(new Set([...loadPlayerNames(), ...incomingNames])).filter(n => !gone.includes(n)).slice(0, 10);
    localStorage.setItem('manabi_playernames', JSON.stringify(mergedNames));
    renderPlayerNameSaved();
  }
}

document.getElementById('sync-export-btn').addEventListener('click', () => {
  const json = JSON.stringify(collectSyncData());
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `manabi-data-${localDateStr()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  document.getElementById('sync-message').textContent = '📤 ファイルを書き出しました！';
});

// ---- クラウド同期（Firestore） ----
// 同期コードを正規化する：全角英数字を半角へ、空白を除去。
// これをしないと「１」(全角) と「1」(半角) が別のドキュメントになり、
// 端末ごとにキーボードが違うとデータが共有されない。
function normalizeSyncCode(s) {
  return (s || '')
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
    .toLowerCase()       // 大文字小文字を区別しない（ABC と abc を同じ箱に）
    .replace(/\s+/g, '')
    .trim();
}

const syncCodeInput = document.getElementById('sync-code');
syncCodeInput.value = localStorage.getItem('manabi_synccode') || '';
// あいことばを かえる ときは、おうちの人の ばんごうが いる（子どもが さわって 記録が わかれる じこを ふせぐ）。
// ・クラウドに まだ その あいことばの「はこ」が ないときは、まちがいでは ないか たしかめる（からの はこが できて きろくが わかれるのを ふせぐ）
const SYNC_CODE_RE = /^[a-z0-9]{6,20}$/;
function confirmP(text, okLabel, cancelLabel) {
  return new Promise(resolve => {
    askConfirm(text, okLabel, cancelLabel, () => resolve(true), { cancelFirst: true });
    const modal = document.getElementById('modal');
    const cancel = document.getElementById('modal-cancel');
    const prev = cancel.onclick;
    cancel.onclick = () => { prev(); resolve(false); };
    modal.onclick = (e) => { if (e.target === modal) { modal.classList.add('hidden'); resolve(false); } };
  });
}
async function syncCodeParentOk() {
  if (!getActiveSyncCode()) return true;   // まだ ないとき（さいしょの せってい）は ばんごう なし
  if (typeof parentAllowed === 'function' && parentAllowed()) return true;
  const ok = await requireParent('あいことばを かえる');
  if (ok && typeof parentUntil !== 'undefined' && typeof PARENT_OK_MS !== 'undefined') parentUntil = Date.now() + PARENT_OK_MS;
  return ok;
}
// あいことばを あたらしく きめる。きめたら true（やめたら false）
async function changeSyncCode(raw) {
  const msg = document.getElementById('sync-message');
  const code = normalizeSyncCode(raw);
  const current = getActiveSyncCode();
  if (code === current) return true;
  if (code && !SYNC_CODE_RE.test(code)) { msg.textContent = 'あいことばは 6〜20もじの えいすうじだよ。'; return false; }
  if (!(await syncCodeParentOk())) return false;
  if (code && cloudDb) {
    try {
      const snap = await cloudDb.collection('syncCodes').doc(code).get();
      if (!snap.exists) {
        const go = await confirmP(`この あいことば「${code}」の クラウドの はこは、まだ ありません（はじめて）。
まちがえて いない？ ほかの iPad と ちがうと、きろくが わかれます。
このまま つかう？`, 'つかう', 'やめる');
        if (!go) return false;
      }
    } catch (e) { /* つながらないときは そのまま すすむ */ }
  }
  localStorage.setItem('manabi_synccode', code);
  syncCodeInput.value = code;
  return true;
}
syncCodeInput.readOnly = true;   // ふれても かわらない。かえる ときは ばんごうを いれてから
syncCodeInput.addEventListener('focus', async () => {
  if (!syncCodeInput.readOnly) return;
  syncCodeInput.blur();
  if (await syncCodeParentOk()) { syncCodeInput.readOnly = false; syncCodeInput.focus(); }
});
syncCodeInput.addEventListener('change', async () => {
  const typed = syncCodeInput.value;
  syncCodeInput.readOnly = true;
  const ok = await changeSyncCode(typed);
  syncCodeInput.value = getActiveSyncCode();
  if (ok && getActiveSyncCode()) {
    const msg = document.getElementById('sync-message');
    msg.textContent = 'あいことばを いれたよ。どうきしているよ…';
    await autoSync();
    msg.textContent = 'つながったよ！\n' + lastSyncText();
  }
});

function mergeRankingList(existing, incoming, key) {
  const merged = [...existing, ...incoming];
  // 同じ記録が同期のたびに重複して増えないよう、内容が同一の行を除去する。
  const seen = new Set();
  const deduped = merged.filter(e => {
    const k = JSON.stringify([e.name, e.correct, e.total, e.rate, e.time, e.date]);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  deduped.sort(rankingSortFn(key));
  return deduped.slice(0, 20);
}

function mergeSyncData(a, b) {
  const merged = { progress: {}, ranking: {}, diff: {}, playerName: a.playerName || b.playerName || '' };
  const progressKeys = new Set([...Object.keys(a.progress || {}), ...Object.keys(b.progress || {})]);
  progressKeys.forEach(key => {
    if (isLegacyProgressKey(key)) return; // 旧形式（全員合算）はクラウドからも捨てる
    const pa = (a.progress || {})[key] || { correct: 0, total: 0, best: 0, streak: 0, lastDate: null };
    const pb = (b.progress || {})[key] || { correct: 0, total: 0, best: 0, streak: 0, lastDate: null };
    merged.progress[key] = mergeProgress(pa, pb);
  });
  // 難易度は高い方（進んでいる方）を採用。冪等で水増しもしない。
  const diffKeys = new Set([...Object.keys(a.diff || {}), ...Object.keys(b.diff || {})]);
  diffKeys.forEach(key => {
    if (isLegacyDiffKey(key)) return;
    const va = parseInt((a.diff || {})[key]); const vb = parseInt((b.diff || {})[key]);
    const max = Math.max(isNaN(va) ? -1 : va, isNaN(vb) ? -1 : vb);
    if (max >= 0) merged.diff[key] = String(max);
  });
  const rankingKeys = new Set([...Object.keys(a.ranking || {}), ...Object.keys(b.ranking || {})]);
  rankingKeys.forEach(key => {
    merged.ranking[key] = mergeRankingList((a.ranking || {})[key] || [], (b.ranking || {})[key] || [], key);
  });
  merged.extras = mergeExtras(a.extras, b.extras);
  // 名前の一覧は両端末の和集合（重複を除いて最大10件）
  merged.deletedNames = Array.from(new Set([...(a.deletedNames || []), ...(b.deletedNames || [])])).slice(-50);
  merged.playerNames = Array.from(new Set([...(a.playerNames || []), ...(b.playerNames || [])])).filter(n => !merged.deletedNames.includes(n)).slice(0, 10);
  return merged;
}

// クラウドのエラーを、原因が分かる言葉にする（以前は何があっても「通信環境を確認」と出していた）
function describeCloudError(e) {
  const code = (e && e.code) ? String(e.code) : '';
  const detail = code ? `（${code}）` : (e && e.message ? `（${String(e.message).slice(0, 80)}）` : '');
  if (code === 'permission-denied') {
    return 'クラウドの「ルール」で、とめられています。おうちの人が Firebase の ルールを なおす ひつようが あります。' + detail;
  }
  if (code === 'unavailable' || code === 'deadline-exceeded') {
    return 'クラウドに つながりません。ネットを たしかめて、あとで もういちど ためしてね。' + detail;
  }
  if (code === 'not-found' || code === 'failed-precondition') {
    return 'クラウド（Firestore）が まだ つかえるように なっていません。おうちの人が Firebase で Firestore を つくる ひつようが あります。' + detail;
  }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return 'ネットに つながっていません。' + detail;
  }
  return 'どうきに しっぱいしました。' + detail;
}

function cloudUnavailable(msg) {
  if (!cloudDb) {
    msg.textContent = 'クラウド同期が設定されていません。js/firebase-config.jsに設定を入力してください。';
    return true;
  }
  if (!getActiveSyncCode()) {
    msg.textContent = 'まず「あいことば」を入れてね。\n（「あたらしい あいことばを つくる」で作れます）';
    return true;
  }
  return false;
}

// 読み込み・書き込みをまとめて行い、ローカルとクラウドを同じ状態にする
// 同期キー：おうち共通の「あいことば」（同期コード）だけを使う。
// 以前は未設定ならなまえを鍵にしていたが、同じなまえを入れた他人にデータを読み書きされる恐れがあり、
// 子どもごとに別々の保存場所になって端末間で揃わなかったため、あいことば必須にした。
function getActiveSyncCode() {
  return normalizeSyncCode(localStorage.getItem('manabi_synccode') || '');
}

// 推測されにくい、ランダムなあいことばを作る（まぎらわしい文字 i l o 0 1 は使わない）
function generateSyncCode() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  const buf = new Uint32Array(8);
  window.crypto.getRandomValues(buf);
  return Array.from(buf, n => chars[n % chars.length]).join('');
}

async function performCloudSync() {
  const code = getActiveSyncCode();
  if (!cloudDb || !code) return null;
  const docRef = cloudDb.collection('syncCodes').doc(code);
  const snap = await docRef.get();
  const cloudData = snap.exists ? snap.data() : { progress: {}, ranking: {}, playerName: '' };
  const localData = collectSyncData();
  const merged = mergeSyncData(localData, cloudData);
  merged.writerVersion = (typeof APP_VERSION !== 'undefined') ? APP_VERSION : '';   // さいごに 書いた たんまつの バージョン（ふるい たんまつは この 欄を 消す＝ふるいと わかる）
  merged.writtenAt = new Date().toISOString();
  await docRef.set(merged);
  applySyncData(merged);
  return merged;
}

document.getElementById('cloud-upload-btn').addEventListener('click', async () => {
  const msg = document.getElementById('sync-message');
  if (cloudUnavailable(msg)) return;
  msg.textContent = '送信中...';
  try {
    await performCloudSync();
    msg.textContent = '☁️ クラウドに送りました！';
  } catch (e) {
    msg.textContent = describeCloudError(e);
    console.error('クラウド同期の失敗:', e);
  }
});

document.getElementById('cloud-download-btn').addEventListener('click', async () => {
  const msg = document.getElementById('sync-message');
  if (cloudUnavailable(msg)) return;
  msg.textContent = '受信中...';
  try {
    await performCloudSync();
    msg.textContent = '☁️ クラウドから受け取りました！';
    if (!document.getElementById('screen-report').classList.contains('hidden')) showReportScreen();
  } catch (e) {
    msg.textContent = describeCloudError(e);
    console.error('クラウド同期の失敗:', e);
  }
});

// あいことばが入っているときは、起動時と学習のおわりに、自動でクラウドと合わせる。
// 合成は「大きい方・新しい方を採用」なので、何回やっても増えすぎない（ボタンでの手動同期も残してある）。
let autoSyncRunning = false;
// どうきの まえと あとで、きろくが 変わったか くらべる ための 目じるし（どうきの 時刻などは ふくめない）
function syncSignature() {
  let s = '';
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.indexOf('manabi_') === 0 && k !== 'manabi_lastsync' && k !== 'manabi_lasterr') s += k + '=' + localStorage.getItem(k) + ';';
  }
  return s;
}

async function autoSync() {
  if (autoSyncRunning || !cloudDb || !getActiveSyncCode()) return;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
  autoSyncRunning = true;
  try {
    const before = syncSignature();
    await performCloudSync();
    localStorage.setItem('manabi_lastsync', new Date().toISOString());
    localStorage.removeItem('manabi_lasterr');
    // 1ぷんごとに 合わせるので、ほかの子の きろくが 変わったときだけ 画面を えがきなおす（ボタンを おす じゃまを しない）
    if (syncSignature() !== before) {
      if (typeof refreshHome === 'function') refreshHome();
      if (typeof updateWeekChip === 'function') updateWeekChip();   // 勉強中の「みんなで ○もん」も さいしんに
    }
  } catch (e) {
    // ふだんは静かに失敗する（次に学習したときにまた合わせる）。理由は同期画面で見られるように残す。
    try { localStorage.setItem('manabi_lasterr', describeCloudError(e)); } catch (err) { /* 無視 */ }
    console.error('自動同期の失敗:', e);
  } finally {
    autoSyncRunning = false;
  }
}

function lastSyncText() {
  const err = localStorage.getItem('manabi_lasterr');
  const raw = localStorage.getItem('manabi_lastsync');
  if (err) return '自動どうきが できていません：' + err + (raw ? '\n' + '（さいごに できた日：' + new Date(raw).toLocaleDateString('ja-JP') + '）' : '');
  if (!raw) return '';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '';
  return `さいごの どうき：${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// 1台目でコピー → 2台目ではりつけ（同じ Apple ID なら iPad 同士でそのまま貼り付けられる）
document.getElementById('sync-code-copy-btn').addEventListener('click', async () => {
  const msg = document.getElementById('sync-message');
  const code = getActiveSyncCode();
  if (!code) { msg.textContent = 'まだ あいことばが ないよ。「あたらしい あいことばを つくる」を おしてね。'; return; }
  try {
    await navigator.clipboard.writeText(code);
    msg.textContent = 'あいことばを コピーしたよ。ほかの iPad で「はりつけ」を おしてね。';
  } catch (e) {
    msg.textContent = `コピーできなかったよ。あいことばは「${code}」です。`;
  }
});

document.getElementById('sync-code-paste-btn').addEventListener('click', async () => {
  const msg = document.getElementById('sync-message');
  try {
    const text = normalizeSyncCode(await navigator.clipboard.readText());
    if (!SYNC_CODE_RE.test(text)) { msg.textContent = 'コピーした あいことばが みつからないよ。もういちど コピーしてね。'; return; }
    if (!(await changeSyncCode(text))) { msg.textContent = 'あいことばは かえなかったよ。'; return; }
    msg.textContent = 'あいことばを いれたよ。どうきしているよ…';
    await autoSync();
    msg.textContent = 'つながったよ！ これからは じどうで そろいます。\n' + lastSyncText();
  } catch (e) {
    msg.textContent = 'はりつけできなかったよ。あいことばを 手で いれてね。';
  }
});

document.getElementById('sync-code-gen-btn').addEventListener('click', () => {
  const current = getActiveSyncCode();
  const make = async () => {
    if (!(await syncCodeParentOk())) return;
    const code = generateSyncCode();
    localStorage.setItem('manabi_synccode', code);
    syncCodeInput.value = code;
    const msg = document.getElementById('sync-message');
    msg.textContent = `あいことばを つくったよ：${code}\nほかの iPad にも、おなじ あいことばを 入れてね。\nクラウドに おくっています…`;
    await autoSync();
    const err = localStorage.getItem('manabi_lasterr');
    msg.textContent = `あいことばを つくったよ：${code}\nほかの iPad にも、おなじ あいことばを 入れてね。\n` +
      (err ? `でも、クラウドに おくれませんでした：${err}` : 'クラウドにも おくったよ。');
  };
  if (current) {
    askConfirm('あいことばを つくりなおすと、ほかの iPad も 入れなおす ひつようが あります。\nつくりなおす？', 'つくる', 'やめる', make);
  } else {
    make();
  }
});

document.getElementById('sync-import-btn').addEventListener('click', () => {
  const fileInput = document.getElementById('sync-import-file');
  const file = fileInput.files[0];
  const msg = document.getElementById('sync-message');
  if (!file) {
    msg.textContent = 'ファイルを選んでください。';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      applySyncData(data);
      msg.textContent = '📥 データを読み込みました！';
      if (!document.getElementById('screen-report').classList.contains('hidden')) showReportScreen();
    } catch (e) {
      msg.textContent = '読み込みに失敗しました。ファイルを確認してください。';
    }
  };
  reader.readAsText(file);
});
