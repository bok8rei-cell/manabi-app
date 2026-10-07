// ===== ポコ（育てるキャラ）・コイン・バッジ =====

const PET_STAGES = [
  { min: 0,   name: 'ポコの たまご' },
  { min: 15,  name: 'ポコ' },
  { min: 80,  name: 'ポコっち' },
  { min: 250, name: 'ポコまる' },
  { min: 600, name: 'ポコキング' }
];

function petKey(name) { return `manabi_pet_${playerTag(name)}`; }

function loadPet() {
  return Object.assign({ xp: 0, coins: 0, perfects: 0, missions: 0, cleared: 0 }, readJSON(petKey(), null) || {});
}

function petStage(xp) {
  let stage = 0;
  PET_STAGES.forEach((s, i) => { if (xp >= s.min) stage = i; });
  return stage;
}

// 次の進化までの進み具合（pct: 0〜100, need: あと何もん）
function petProgress(xp) {
  const stage = petStage(xp);
  const next = PET_STAGES[stage + 1];
  if (!next) return { stage, pct: 100, need: 0 };
  const cur = PET_STAGES[stage];
  return { stage, pct: Math.round(((xp - cur.min) / (next.min - cur.min)) * 100), need: next.min - xp };
}

// ごほうびを加算する。進化したかどうかも返す。
function awardPet({ xp = 0, coins = 0, perfect = false, mission = false, cleared = 0 }) {
  const p = loadPet();
  const before = petStage(p.xp);
  p.xp += xp;
  p.coins += coins;
  if (perfect) p.perfects += 1;
  if (mission) p.missions += 1;
  p.cleared += cleared;
  writeJSON(petKey(), p);
  const after = petStage(p.xp);
  return { pet: p, before, after, levelUp: after > before };
}

// ポコの絵。stage: 0=たまご 1〜4=せいちょう / mood: happy | cheer | think
function petSVG(stage, mood = 'happy', size = 64) {
  const w = size;
  const h = Math.round(size * 0.94);
  const open = (inner) =>
    `<svg width="${w}" height="${h}" viewBox="0 0 64 60" role="img" aria-label="マスコットのポコ" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

  if (stage === 0) {
    return open(
      '<ellipse cx="32" cy="34" rx="19" ry="23" fill="#FFF3D6" stroke="#E8D5A8" stroke-width="2"/>' +
      '<circle cx="25" cy="28" r="3.2" fill="#B8EBDD"/><circle cx="38" cy="38" r="4" fill="#B8EBDD"/><circle cx="30" cy="45" r="2.4" fill="#B8EBDD"/>' +
      '<path d="M22 22 L28 26 L32 20 L37 26 L42 22" stroke="#E8D5A8" stroke-width="2" fill="none" stroke-linejoin="round"/>'
    );
  }

  const rx = [0, 20, 23, 25, 26][stage];
  const ry = [0, 16, 19, 21, 22][stage];
  const cy = 60 - ry - 3;
  const eyeY = cy - 4;
  let parts = '';
  if (stage >= 2) {
    parts += `<path d="M${32 - rx + 6} ${cy - ry + 6} L${32 - rx + 8} ${cy - ry - 7} L${32 - rx + 17} ${cy - ry + 2} Z" fill="#5CC9B0"/>`;
    parts += `<path d="M${32 + rx - 6} ${cy - ry + 6} L${32 + rx - 8} ${cy - ry - 7} L${32 + rx - 17} ${cy - ry + 2} Z" fill="#5CC9B0"/>`;
  }
  parts += `<ellipse cx="32" cy="${cy}" rx="${rx}" ry="${ry}" fill="#5CC9B0"/>`;
  if (stage >= 2) parts += `<ellipse cx="32" cy="${cy + 6}" rx="${rx - 9}" ry="${ry - 9}" fill="#B8EBDD"/>`;
  if (stage >= 3) {
    parts += `<circle cx="${32 - rx + 8}" cy="${cy + 3}" r="3" fill="#FFB3A1"/><circle cx="${32 + rx - 8}" cy="${cy + 3}" r="3" fill="#FFB3A1"/>`;
  }
  if (stage >= 4) {
    parts += `<path d="M22 ${cy - ry + 3} L24 ${cy - ry - 8} L28 ${cy - ry - 2} L32 ${cy - ry - 10} L36 ${cy - ry - 2} L40 ${cy - ry - 8} L42 ${cy - ry + 3} Z" fill="#F5B21B" stroke="#C98A00" stroke-width="1"/>`;
  }
  const eyeDx = 9;
  parts += `<circle cx="${32 - eyeDx}" cy="${eyeY}" r="4.6" fill="#fff"/><circle cx="${32 + eyeDx}" cy="${eyeY}" r="4.6" fill="#fff"/>`;
  parts += `<circle cx="${32 - eyeDx + 1}" cy="${eyeY + 1}" r="2.3" fill="#3B2F2A"/><circle cx="${32 + eyeDx + 1}" cy="${eyeY + 1}" r="2.3" fill="#3B2F2A"/>`;
  const my = cy + 5;
  if (mood === 'cheer') {
    parts += `<path d="M25 ${my} Q32 ${my + 11} 39 ${my} Z" fill="#8A2E1C"/>`;
  } else if (mood === 'think') {
    parts += `<path d="M27 ${my + 3} L37 ${my + 3}" stroke="#3B2F2A" stroke-width="2.2" stroke-linecap="round"/>`;
  } else {
    parts += `<path d="M26 ${my} Q32 ${my + 7} 38 ${my}" stroke="#3B2F2A" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  }
  return open(parts);
}

// ---- バッジ ----
function playerBestStreak() {
  return Math.max(loadDayStreak().best, currentDayStreak());
}

function computeBadges() {
  const p = loadPet();
  const best = playerBestStreak();
  return [
    { icon: '🌱', label: 'はじめの いっぽ',   hint: 'はじめて せいかいする',   got: p.xp >= 1 },
    { icon: '🔥', label: '3日れんぞく',       hint: '3日つづけて べんきょう',  got: best >= 3 },
    { icon: '🌟', label: '7日れんぞく',       hint: '7日つづけて べんきょう',  got: best >= 7 },
    { icon: '👑', label: '30日れんぞく',      hint: '30日つづけて べんきょう', got: best >= 30 },
    { icon: '💯', label: '100もん せいかい',  hint: 'ぜんぶで 100もん',        got: p.xp >= 100 },
    { icon: '🏅', label: '500もん せいかい',  hint: 'ぜんぶで 500もん',        got: p.xp >= 500 },
    { icon: '🎯', label: 'パーフェクト',      hint: '5もん以上で ぜんぶ せいかい', got: p.perfects >= 1 },
    { icon: '📅', label: 'ミッション 5かい',  hint: 'きょうのミッションを5回',  got: p.missions >= 5 },
    { icon: '💪', label: 'にがて そつぎょう', hint: 'にがてを 10もん クリア',   got: p.cleared >= 10 }
  ];
}
