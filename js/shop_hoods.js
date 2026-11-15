// ===== おしゃれ：フード型の かぶりもの（どうぶつ 10しゅるい）=====
// かおの まわりを ぐるっと おおう フード。かおは フードの あなから 見える。あたまの うえに その どうぶつの かおが ある。
// 「あたま」の かざり（ぼうしと おなじ 場所）。ねだんは 600コイン（ふつう）。ドラゴン・ユニコーンは 2000コイン（レア）。js/shop.js の あとに よみこむ。
(() => {
// かぶりもの（フード）：かおの まわりを ぐるっと おおい、あたまの うえに どうぶつの かおが ある
const HG = g => {
  const outerTop = Math.max(4, g.y0 - 10);
  const bottom = g.cy + g.ry + 2;
  return { rxI: g.rx * 0.84, ryI: g.ry * 0.88, cyI: g.cy + 1.2, rxO: g.rx + 5.5, cyO: (outerTop + bottom) / 2, ryO: (bottom - outerTop) / 2, top: outerTop, ty: (outerTop + (g.cy + 1.2 - g.ry * 0.88)) / 2 + 0.6 };
};
const eli = (cx, cy, rx, ry) => `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${2 * rx} 0 a${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z`;
const ringPath = (g, fill, stroke, fur, furR) => {
  const h = HG(g); let s = '';
  if (fur) for (let i = 0; i < 26; i++) { const a = Math.PI * 2 * i / 26; s += `<circle cx="${(32 + h.rxO * Math.cos(a)).toFixed(1)}" cy="${(h.cyO + h.ryO * Math.sin(a)).toFixed(1)}" r="${furR || 3.4}" fill="${fill}" stroke="${stroke}" stroke-width="0.8"/>`; }
  s += `<path d="${eli(32, h.cyO, h.rxO, h.ryO)} ${eli(32, h.cyI, h.rxI, h.ryI)}" fill-rule="evenodd" fill="${fill}"/>`;
  if (fur) s += `<path d="${eli(32, h.cyO, h.rxO, h.ryO)}" fill="none"/>`;
  s += `<ellipse cx="32" cy="${h.cyI}" rx="${h.rxI}" ry="${h.ryI}" fill="none" stroke="${stroke}" stroke-width="1.2"/>`;
  if (!fur) s += `<ellipse cx="32" cy="${h.cyO}" rx="${h.rxO}" ry="${h.ryO}" fill="none" stroke="${stroke}" stroke-width="1"/>`;
  return s;
};
const earAt = (g, side, r, fill, stroke, inner) => { const h = HG(g); const x = 32 + side * h.rxO * 0.7, y = h.cyO - h.ryO * 0.7; return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>` + (inner ? `<circle cx="${x}" cy="${y + 0.5}" r="${r * 0.55}" fill="${inner}"/>` : ''); };
const teeth = (g, n, from, to, depth, w) => {
  const h = HG(g); let s = ''; const dt = (to - from) / n;
  const P = (t, k) => [32 + h.rxI * k * Math.cos(t), h.cyI + h.ryI * k * Math.sin(t)];
  for (let i = 0; i < n; i++) { const tc = from + (i + 0.5) * dt; const a = P(tc - dt * w, 1.02), b = P(tc + dt * w, 1.02), tip = P(tc, 1 - depth); s += `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${tip[0].toFixed(1)} ${tip[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)} Z" fill="#fff" stroke="#CBD5E1" stroke-width="0.5" stroke-linejoin="round"/>`; }
  return s;
};
const D = {};
D.bear = g => { const h = HG(g); return earAt(g, -1, 6.2, '#A9876B', '#6B4F3A', '#F8F1E7') + earAt(g, 1, 6.2, '#A9876B', '#6B4F3A', '#F8F1E7') + ringPath(g, '#A9876B', '#6B4F3A', true, 3.6) +
  `<ellipse cx="32" cy="${h.ty + 1.2}" rx="5.8" ry="3.7" fill="#F8F1E7"/><ellipse cx="32" cy="${h.ty - 0.2}" rx="2.1" ry="1.5" fill="#1F2937"/><path d="M32 ${h.ty + 1.2} v1.3 M29.4 ${h.ty + 2.6} q2.6 2 5.2 0" stroke="#1F2937" stroke-width="0.9" fill="none" stroke-linecap="round"/>` +
  `<circle cx="${32 - 9.2}" cy="${h.ty - 1.2}" r="1.3" fill="#1F2937"/><circle cx="${32 + 9.2}" cy="${h.ty - 1.2}" r="1.3" fill="#1F2937"/>`; };
D.panda = g => { const h = HG(g); return earAt(g, -1, 6, '#1F2937', '#111827') + earAt(g, 1, 6, '#1F2937', '#111827') + ringPath(g, '#FFFFFF', '#94A3B8', true, 3.6) +
  `<ellipse cx="${32 - 7}" cy="${h.ty}" rx="3.6" ry="2.6" fill="#1F2937" transform="rotate(-24 ${32 - 7} ${h.ty})"/><ellipse cx="${32 + 7}" cy="${h.ty}" rx="3.6" ry="2.6" fill="#1F2937" transform="rotate(24 ${32 + 7} ${h.ty})"/>` +
  `<circle cx="${32 - 7.2}" cy="${h.ty - 0.3}" r="0.9" fill="#fff"/><circle cx="${32 + 7.2}" cy="${h.ty - 0.3}" r="0.9" fill="#fff"/>` +
  `<ellipse cx="32" cy="${h.ty + 2.2}" rx="2" ry="1.4" fill="#1F2937"/><path d="M29.8 ${h.ty + 4} q2.2 1.6 4.4 0" stroke="#1F2937" stroke-width="0.8" fill="none" stroke-linecap="round"/>`; };
D.tiger = g => { const h = HG(g); const st = (x, y, l) => `<path d="M${x} ${y} l${l} 2.4" stroke="#1F2937" stroke-width="1.9" stroke-linecap="round"/>`;
  return earAt(g, -1, 5.6, '#FB923C', '#C2410C', '#FFF7ED') + earAt(g, 1, 5.6, '#FB923C', '#C2410C', '#FFF7ED') + ringPath(g, '#FB923C', '#C2410C', true, 3.4) +
  st(32 - h.rxO + 1.6, h.cyO - 6, 3.4) + st(32 - h.rxO + 1.4, h.cyO + 1, 3.6) + st(32 + h.rxO - 1.6, h.cyO - 6, -3.4) + st(32 + h.rxO - 1.4, h.cyO + 1, -3.6) +
  `<path d="M32 ${h.top + 0.8} v3 M29 ${h.top + 1.8} h6" stroke="#1F2937" stroke-width="1.6" stroke-linecap="round"/>` +
  `<ellipse cx="32" cy="${h.ty + 2.4}" rx="5.2" ry="3.2" fill="#FFF7ED"/><ellipse cx="32" cy="${h.ty + 1.4}" rx="1.9" ry="1.3" fill="#F472B6"/><path d="M32 ${h.ty + 2.6} v1 M29.8 ${h.ty + 3.6} q2.2 1.8 4.4 0" stroke="#7F1D1D" stroke-width="0.8" fill="none" stroke-linecap="round"/>` +
  `<circle cx="${32 - 8.6}" cy="${h.ty - 0.6}" r="1.3" fill="#1F2937"/><circle cx="${32 + 8.6}" cy="${h.ty - 0.6}" r="1.3" fill="#1F2937"/>`; };
D.lion = g => { const h = HG(g); return ringPath(g, '#C2410C', '#7C2D12', true, 5.2) + earAt(g, -1, 4, '#92400E', '#7C2D12', '#FCD34D') + earAt(g, 1, 4, '#92400E', '#7C2D12', '#FCD34D') +
  `<ellipse cx="32" cy="${h.ty + 1.4}" rx="5.4" ry="3.5" fill="#FDE68A"/><ellipse cx="32" cy="${h.ty + 0.2}" rx="2" ry="1.4" fill="#7C2D12"/><path d="M32 ${h.ty + 1.4} v1.2 M29.6 ${h.ty + 2.8} q2.4 1.8 4.8 0" stroke="#7C2D12" stroke-width="0.9" fill="none" stroke-linecap="round"/>` +
  `<circle cx="${32 - 8.4}" cy="${h.ty - 0.8}" r="1.3" fill="#1F2937"/><circle cx="${32 + 8.4}" cy="${h.ty - 0.8}" r="1.3" fill="#1F2937"/>`; };
D.frog = g => { const h = HG(g); const eye = s => { const x = 32 + s * h.rxO * 0.52, y = h.top + 3.4; return `<circle cx="${x}" cy="${y}" r="6.4" fill="#7ED957" stroke="#3F8F2A" stroke-width="1"/>`; }; const pupil = s => { const x = 32 + s * h.rxO * 0.52, y = h.top + 3.4; return `<circle cx="${x}" cy="${y}" r="4.4" fill="#fff"/><circle cx="${x + 0.5}" cy="${y + 0.4}" r="2.3" fill="#1F2937"/><circle cx="${x - 0.5}" cy="${y - 0.4}" r="0.7" fill="#fff"/>`; };
  return eye(-1) + eye(1) + ringPath(g, '#7ED957', '#3F8F2A', false) + pupil(-1) + pupil(1) + `<path d="M${32 - 7} ${h.ty + 2.4} Q32 ${h.ty + 6.2} ${32 + 7} ${h.ty + 2.4}" stroke="#3F8F2A" stroke-width="1.3" fill="none" stroke-linecap="round"/><circle cx="30" cy="${h.ty - 0.4}" r="0.8" fill="#3F8F2A"/><circle cx="34" cy="${h.ty - 0.4}" r="0.8" fill="#3F8F2A"/>`; };
D.shark = g => { const h = HG(g); const ft = Math.max(0.8, h.top - 8.5);
  const fin = `<path d="M26.5 ${h.top + 5} Q30.5 ${ft + 2.5} 35.5 ${ft} Q36 ${h.top + 1} 38.5 ${h.top + 5} Z" fill="#6B7280" stroke="#4B5563" stroke-width="0.8" stroke-linejoin="round"/>`;
  const eye = s => `<circle cx="${32 + s * h.rxO * 0.62}" cy="${h.top + 6.4}" r="2.3" fill="#111827"/><circle cx="${32 + s * h.rxO * 0.62 - 0.7}" cy="${h.top + 5.6}" r="0.7" fill="#fff"/>`;
  return fin + ringPath(g, '#9CA3AF', '#4B5563', false) + `<ellipse cx="32" cy="${h.cyI}" rx="${h.rxI + 0.6}" ry="${h.ryI + 0.6}" fill="none" stroke="#E5E7EB" stroke-width="2.2"/>` + teeth(g, 7, -Math.PI * 0.94, -Math.PI * 0.06, 0.2, 0.4) + teeth(g, 5, Math.PI * 0.14, Math.PI * 0.86, 0.14, 0.4) + eye(-1) + eye(1); };
D.wolf = g => { const h = HG(g); const ear = s => { const x = 32 + s * h.rxO * 0.66, y = h.cyO - h.ryO * 0.74; return `<path d="M${x - 5.2} ${y + 4} L${x + s * 1.2} ${y - 9} L${x + 5.2} ${y + 4} Z" fill="#9CA3AF" stroke="#4B5563" stroke-width="1" stroke-linejoin="round"/><path d="M${x - 2.6} ${y + 3} L${x + s * 0.8} ${y - 5} L${x + 2.6} ${y + 3} Z" fill="#F9A8D4"/>`; };
  return ear(-1) + ear(1) + ringPath(g, '#9CA3AF', '#4B5563', true, 3.4) +
  `<ellipse cx="32" cy="${h.ty + 1.6}" rx="6.4" ry="3.8" fill="#E5E7EB"/><ellipse cx="32" cy="${h.ty + 0.4}" rx="2.3" ry="1.6" fill="#111827"/><path d="M29.4 ${h.ty + 3.4} l1.2 2 l1.2 -2 M32.2 ${h.ty + 3.4} l1.2 2 l1.2 -2" stroke="#fff" stroke-width="1" fill="#fff"/>` +
  `<ellipse cx="${32 - 8}" cy="${h.ty - 1.6}" rx="2.4" ry="1.6" fill="#FACC15"/><ellipse cx="${32 + 8}" cy="${h.ty - 1.6}" rx="2.4" ry="1.6" fill="#FACC15"/><path d="M${32 - 8} ${h.ty - 2.8} v2.4 M${32 + 8} ${h.ty - 2.8} v2.4" stroke="#111827" stroke-width="0.9"/>`; };
D.dino = g => { const h = HG(g); const sp = (x, s) => `<path d="M${x - 3} ${h.top + 4.4} L${x} ${Math.max(0.6, h.top - s)} L${x + 3} ${h.top + 4.4} Z" fill="#F59E0B" stroke="#B45309" stroke-width="0.7" stroke-linejoin="round"/>`;
  const eye = s => `<circle cx="${32 + s * h.rxO * 0.6}" cy="${h.top + 6.2}" r="2.5" fill="#FEF08A"/><circle cx="${32 + s * h.rxO * 0.6}" cy="${h.top + 6.2}" r="1.2" fill="#111827"/>`;
  return sp(32, 7.5) + sp(25, 5) + sp(39, 5) + ringPath(g, '#4ADE80', '#15803D', false) + `<ellipse cx="32" cy="${h.cyI}" rx="${h.rxI + 0.6}" ry="${h.ryI + 0.6}" fill="none" stroke="#BBF7D0" stroke-width="2.2"/>` + teeth(g, 7, -Math.PI * 0.94, -Math.PI * 0.06, 0.2, 0.4) + teeth(g, 4, Math.PI * 0.2, Math.PI * 0.8, 0.12, 0.4) + eye(-1) + eye(1); };
// ---- めずらしい どうぶつ（レア・2000コイン）----
// ---- めずらしい どうぶつの フード（レア）----
const clipY = y => Math.max(0.8, y);
const outerPt = (h, a, out) => [32 + (h.rxO + out) * Math.cos(a), h.cyO + (h.ryO + out) * Math.sin(a)];
D.dragon = g => {
  const h = HG(g);
  const horn = s => { const x = 32 + s * h.rxO * 0.52, y = h.cyO - h.ryO * 0.78; return `<path d="M${x - 3.6} ${y + 3.4} Q${x + s * 0.6} ${y - 4} ${x + s * 5.6} ${clipY(y - 9.5)} Q${x + s * 2.4} ${y - 1} ${x + 3.6} ${y + 3.4} Z" fill="#FDE68A" stroke="#B45309" stroke-width="0.9" stroke-linejoin="round"/>`; };
  let crest = '';
  for (let k = -2; k <= 2; k++) { const a = -Math.PI / 2 + k * 0.3; const b0 = outerPt(h, a - 0.1, 0.5), b1 = outerPt(h, a + 0.1, 0.5), t = outerPt(h, a, 4.2 - Math.abs(k) * 0.5); crest += `<path d="M${b0[0].toFixed(1)} ${b0[1].toFixed(1)} L${t[0].toFixed(1)} ${clipY(t[1]).toFixed(1)} L${b1[0].toFixed(1)} ${b1[1].toFixed(1)} Z" fill="#F97316" stroke="#9A3412" stroke-width="0.7" stroke-linejoin="round"/>`; }
  let scales = '';
  const mcy = (h.cyO + h.cyI) / 2, mrx = (h.rxO + h.rxI) / 2, mry = (h.ryO + h.ryI) / 2;
  for (let i = 0; i < 18; i++) { const a = Math.PI * 2 * i / 18; if (Math.abs(a - Math.PI * 1.5) < 0.9) continue; const x = 32 + mrx * Math.cos(a), y = mcy + mry * Math.sin(a); scales += `<path d="M${(x - 1.9).toFixed(1)} ${y.toFixed(1)} q1.9 2.4 3.8 0" stroke="#9F1239" stroke-width="0.9" fill="none" stroke-linecap="round"/>`; }
  const eye = s => `<ellipse cx="${32 + s * 8.6}" cy="${h.ty - 1.6}" rx="2.6" ry="1.8" fill="#FDE047"/><path d="M${32 + s * 8.6} ${h.ty - 3} v2.8" stroke="#111827" stroke-width="1"/>`;
  return horn(-1) + horn(1) + crest + ringPath(g, '#E5484D', '#9F1239', false) + scales +
    `<ellipse cx="32" cy="${h.ty + 1.6}" rx="6.2" ry="3.6" fill="#FCA5A5"/><circle cx="29.8" cy="${h.ty + 0.6}" r="0.9" fill="#7F1D1D"/><circle cx="34.2" cy="${h.ty + 0.6}" r="0.9" fill="#7F1D1D"/>` +
    `<path d="M29 ${h.ty + 4.4} l1 2 l1 -2 M33 ${h.ty + 4.4} l1 2 l1 -2" stroke="#fff" stroke-width="0.8" fill="#fff"/>` + eye(-1) + eye(1) + teeth(g, 3, -Math.PI * 0.62, -Math.PI * 0.38, 0.12, 0.38);
};
D.unicorn = g => {
  const h = HG(g); const cols = ['#F9A8D4', '#C4B5FD', '#93C5FD', '#86EFAC', '#FDE68A'];
  let mane = '';
  for (let i = 0; i < 9; i++) { const a = Math.PI * (1.18 - i * 0.135); const p = outerPt(h, a, 1.2); mane += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(3.7 + (i % 2) * 0.7).toFixed(1)}" fill="${cols[i % 5]}" stroke="#fff" stroke-width="0.8"/>`; }
  const ear = s => { const x = 32 + s * h.rxO * 0.62, y = h.cyO - h.ryO * 0.78; return `<path d="M${x - 4} ${y + 3} L${x + s * 1} ${clipY(y - 7)} L${x + 4} ${y + 3} Z" fill="#fff" stroke="#C4B5FD" stroke-width="1" stroke-linejoin="round"/><path d="M${x - 1.8} ${y + 2.4} L${x + s * 0.6} ${clipY(y - 3.6)} L${x + 1.8} ${y + 2.4} Z" fill="#F9A8D4"/>`; };
  const tip = clipY(h.top - 7.5);
  const horn = `<path d="M29.2 ${h.top + 5.4} L32 ${tip} L34.8 ${h.top + 5.4} Z" fill="#FDE047" stroke="#B45309" stroke-width="0.8" stroke-linejoin="round"/><path d="M29.9 ${h.top + 3.4} l4.2 -1.7 M30.6 ${h.top + 0.8} l2.8 -1.2" stroke="#B45309" stroke-width="0.7"/>`;
  const eyeC = s => `<path d="M${32 + s * 8 - 2.4} ${h.ty - 0.6} q2.4 -2.8 4.8 0" stroke="#4C1D95" stroke-width="1.1" fill="none" stroke-linecap="round"/><path d="M${32 + s * 8 + s * 2.4} ${h.ty - 1.2} l${s * 1.2} -1" stroke="#4C1D95" stroke-width="0.8"/>`;
  return mane + ear(-1) + ear(1) + ringPath(g, '#FFFFFF', '#C4B5FD', true, 3.4) + horn +
    `<ellipse cx="32" cy="${h.ty + 2.6}" rx="4.8" ry="2.8" fill="#FBCFE8"/><circle cx="30.4" cy="${h.ty + 2.4}" r="0.7" fill="#BE185D"/><circle cx="33.6" cy="${h.ty + 2.4}" r="0.7" fill="#BE185D"/>` + eyeC(-1) + eyeC(1);
};
const HOOD_ITEMS = [
  ['bear', 'クマの フード', 600], ['panda', 'パンダの フード', 600], ['tiger', 'トラの フード', 600], ['lion', 'ライオンの フード', 600],
  ['frog', 'カエルの フード', 600], ['shark', 'サメの フード', 600], ['wolf', 'オオカミの フード', 600], ['dino', 'きょうりゅうの フード', 600],
  ['dragon', 'ドラゴンの フード', 2000], ['unicorn', 'ユニコーンの フード', 2000]
];
HOOD_ITEMS.forEach(([k, name, price]) => {
  SHOP_DRAW['hood_' + k] = D[k];
  SHOP_ITEMS.push({ id: 'hood_' + k, name, slot: 'head', price, tier: price >= 1500 ? 'r' : 'n', added: '2026-11-15' });
});
})();
