// ===== コイン中心の ごほうび：ポコの ごはん・ボーナス =====
// ・ポコの ごはん：300コインで そだちポイント +1。1日 2かいまで。その日の「べんきょうポイント 3つ」を そろえたあとに かえる
// ・れんぞく日数：べんきょうポイント 3つが そろった日だけ 1日と かぞえる。3日 +100／7日 +300／14日 +500／30日 +1000 コイン（それぞれ 1かい）
// ・しょうだん：昇段（レベルが あがる）たびに +300コイン（教科・学年・レベルごとに 1かい）
// ・バッジ：あたらしい バッジ 1つに つき +100コイン（いままでの バッジにも 1かい だけ）
// ・ポコクエスト：たっせい／ウラボス／ラスボスを たおすたびに +500コイン、ラスボスは さらに そだちポイント +5（みんなに）
// もらった きろくは pet.paid に のこし、どうきしても 2かい もらえない（和集合で あわせる）

const FOOD_PRICE = 300;
const FOOD_MAX = 2;
const STREAK_BONUS = { 3: 100, 7: 300, 14: 500, 30: 1000 };
const LEVEL_BONUS = 300;
const BADGE_BONUS = 100;
const QUEST_BONUS = 500;
const LAST_BOSS_GROWTH = 5;

function petPaid(p) {
  const o = (p.paid && typeof p.paid === 'object') ? p.paid : {};
  ['streak', 'level', 'badge', 'quest'].forEach(k => { if (!Array.isArray(o[k])) o[k] = []; });
  p.paid = o;
  return o;
}

// その日の そだちポイントの ようす
function petToday(p) {
  const today = localDateStr();
  const d = (p.growthDay && p.growthDay.date === today) ? p.growthDay : { date: today, base: false, amount: false, mission: false, c: 0, food: 0 };
  return d;
}
function petDayAllDone(p) { const d = petToday(p); return !!(d.base && d.amount && d.mission); }
function petFoodLeft(p) { return Math.max(0, FOOD_MAX - (petToday(p).food || 0)); }

// ごはんを かう：'ok' | 'locked'（きょうの ポイントが そろってない）| 'full' | 'poor'
function buyPokoFood() {
  const p = loadPet();
  if (!petDayAllDone(p)) return { r: 'locked' };
  if (petFoodLeft(p) <= 0) return { r: 'full' };
  if (petBalance(p) < FOOD_PRICE) return { r: 'poor' };
  const before = petStage(p.growth);
  const today = localDateStr();
  if (!p.growthDay || p.growthDay.date !== today) p.growthDay = { date: today, base: false, amount: false, mission: false, c: 0, food: 0 };
  p.spent = (p.spent || 0) + FOOD_PRICE;
  p.growth += 1;
  p.growthDay.food = (p.growthDay.food || 0) + 1;
  writeJSON(petKey(), p);
  const after = petStage(p.growth);
  return { r: 'ok', levelUp: after > before, after, pet: p };
}

// バッジの ボーナス：まだ もらっていない バッジの ぶんだけ 渡す。もらった コインの 合計と 名前を かえす
function settleBadgeBonus(name) {
  if (!(name || state.playerName)) return { coins: 0, labels: [] };
  const p = loadPet(name);
  const paid = petPaid(p);
  const fresh = computeBadges().filter(b => b.got && !paid.badge.includes(b.label));
  if (fresh.length === 0) return { coins: 0, labels: [] };
  fresh.forEach(b => paid.badge.push(b.label));
  const coins = fresh.length * BADGE_BONUS;
  p.coins += coins;
  writeJSON(petKey(name), p);
  return { coins, labels: fresh.map(b => b.label) };
}

// ポコクエストの ボーナスを 1人ぶん わたす（その人が まだ もらっていない ときだけ）。わたしたら true
function payQuestBonus(name, key, coins, growth) {
  const p = loadPet(name);
  const paid = petPaid(p);
  if (paid.quest.includes(key)) return false;
  paid.quest.push(key);
  p.coins += coins;
  p.growth += growth || 0;
  writeJSON(petKey(name), p);
  return true;
}

// ---- ホームの「ポコの ごはん」----
function renderFoodPanel() {
  const root = byId('home-food');
  if (!root) return;
  root.innerHTML = '';
  if (!state.playerName.trim()) return;
  const p = loadPet();
  const d = petToday(p);
  const pts = [d.base, d.amount, d.mission];
  const dots = pts.map(x => (x ? '●' : '○')).join('');
  const card = el('div', 'panel food-card');
  card.appendChild(el('div', 'food-points', `きょうの そだちポイント ${dots}　ごはん ${'🍙'.repeat(d.food || 0)}${'・'.repeat(FOOD_MAX - (d.food || 0))}`));
  const left = petFoodLeft(p);
  const allDone = petDayAllDone(p);
  let label, enabled = false;
  if (!allDone) label = '🍙 ポコの ごはん（ポイントを 3つ そろえると かえるよ）';
  else if (left <= 0) label = '🍙 きょうは もう おなかいっぱい！';
  else { label = `🍙 ポコの ごはん ${FOOD_PRICE}コイン（きょう あと ${left}かい）`; enabled = true; }
  const btn = el('button', enabled ? 'main-btn wide' : 'sub-btn wide', label);
  btn.disabled = !enabled;
  btn.addEventListener('click', () => {
    const now = petBalance(loadPet());
    if (now < FOOD_PRICE) { showToast(`コインが たりないよ（あと ${FOOD_PRICE - now}コイン）`); return; }
    askConfirm(`ポコに ごはんを あげる？\n（${FOOD_PRICE}コイン つかいます）\nいま ${now}コイン`, 'あげる', 'やめる', () => {
      const r = buyPokoFood();
      if (r.r === 'ok') {
        if (r.levelUp) { FX.levelUp(); showToast(`🎉 ポコが しんかした！ ${PET_STAGES[r.after].name}`); }
        else { FX.correct(); showToast('もぐもぐ… そだちポイント +1！'); }
      } else if (r.r === 'poor') showToast('コインが たりないよ');
      else if (r.r === 'locked') showToast('きょうの そだちポイントを 3つ そろえてね');
      else showToast('きょうは もう おなかいっぱい！');
      renderHome();
    }, { cancelFirst: true });
  });
  card.appendChild(btn);
  root.appendChild(card);
}
