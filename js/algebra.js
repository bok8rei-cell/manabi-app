// ===== 文字式の答えあわせ（中2・中3の数学）=====
// 「5x-3y」と「-3y+5x」、「(x+2)(x+3)」と「(x+3)(x+2)」を 同じ答えとして あつかう。
//  ・parsePoly(str)        … 式を 多項式（単項式 → 係数）に 読みかえる（x^2・x²・2x・(x+1)(x-1) などに 対応）。読めなければ null
//  ・polyEqual(a, b)       … 2つの多項式が 同じか
//  ・isExpandedForm(str)   … かっこが なく、同類項も まとまっている（展開・計算ずみ）か
//  ・isFactoredForm(str)   … 積の かたちか（因数分解ずみ）。(x^2+5x+6) のように 1つの かっこだけ は ダメ
//  ・factorsAreReduced(str)… かっこの 中に 共通因数が のこっていないか（6x+9 → 2(3x+...) のような 取りのこし）
// 変数は 英字1文字（x, y, a, b …）。係数は 整数・小数。

function _alNormalize(str) {
  let s = String(str)
    .replace(/²/g, '^2').replace(/³/g, '^3')
    .normalize('NFKC')
    .replace(/[－ー−‐―]/g, '-').replace(/[×・･·]/g, '*').replace(/[\s​-‍⁠﻿]/g, '')
    .replace(/[（［\[{]/g, '(').replace(/[）］\]}]/g, ')')
    .toLowerCase();
  s = s.replace(/\*\*/g, '^');
  return s;
}

function _alTokens(s) {
  const out = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/\d/.test(ch) || (ch === '.' && /\d/.test(s[i + 1] || ''))) {
      let j = i + 1;
      while (j < s.length && /[\d.]/.test(s[j])) j++;
      const num = Number(s.slice(i, j));
      if (!Number.isFinite(num)) return null;
      out.push({ t: 'num', v: num });
      i = j;
    } else if (/[a-z]/.test(ch)) { out.push({ t: 'var', v: ch }); i++; }
    else if ('+-*^()'.includes(ch)) { out.push({ t: ch }); i++; }
    else return null;
  }
  return out;
}

function _polyClean(p) {
  const r = {};
  Object.keys(p).forEach(k => { const v = Math.round(p[k] * 1e9) / 1e9; if (v !== 0) r[k] = v; });
  return r;
}
function _polyAdd(a, b, sign) {
  const r = Object.assign({}, a);
  Object.keys(b).forEach(k => { r[k] = (r[k] || 0) + sign * b[k]; });
  return _polyClean(r);
}
function _monoMul(k1, k2) {
  const e = {};
  [k1, k2].forEach(k => {
    if (!k) return;
    k.split('*').forEach(t => { const m = t.match(/^([a-z])(?:\^(\d+))?$/); e[m[1]] = (e[m[1]] || 0) + Number(m[2] || 1); });
  });
  return Object.keys(e).sort().map(v => (e[v] === 1 ? v : `${v}^${e[v]}`)).join('*');
}
function _polyMul(a, b) {
  const r = {};
  Object.keys(a).forEach(ka => Object.keys(b).forEach(kb => {
    const k = _monoMul(ka, kb);
    r[k] = (r[k] || 0) + a[ka] * b[kb];
  }));
  return _polyClean(r);
}
function _polyPow(p, n) {
  let r = { '': 1 };
  for (let i = 0; i < n; i++) r = _polyMul(r, p);
  return r;
}

// 再帰下降パーサー。暗黙の かけ算（2x・x(x+1)・(x+1)(x-1)）に 対応
function parsePoly(str) {
  const toks = _alTokens(_alNormalize(str));
  if (!toks || toks.length === 0) return null;
  let pos = 0;
  const peek = () => toks[pos];
  const startsFactor = t => t && (t.t === 'num' || t.t === 'var' || t.t === '(');

  function parseExpr() {
    let sign = 1;
    let t = peek();
    if (t && (t.t === '+' || t.t === '-')) { sign = t.t === '-' ? -1 : 1; pos++; }
    let acc = parseTerm();
    if (acc === null) return null;
    if (sign === -1) acc = _polyMul(acc, { '': -1 });
    for (;;) {
      t = peek();
      if (t && (t.t === '+' || t.t === '-')) {
        pos++;
        const rhs = parseTerm();
        if (rhs === null) return null;
        acc = _polyAdd(acc, rhs, t.t === '-' ? -1 : 1);
      } else break;
    }
    return acc;
  }
  function parseTerm() {
    let acc = parseFactor();
    if (acc === null) return null;
    for (;;) {
      const t = peek();
      if (t && t.t === '*') { pos++; const f = parseFactor(); if (f === null) return null; acc = _polyMul(acc, f); }
      else if (startsFactor(t)) { const f = parseFactor(); if (f === null) return null; acc = _polyMul(acc, f); }
      else break;
    }
    return acc;
  }
  function parseFactor() {
    const t = peek();
    if (!t) return null;
    let base;
    if (t.t === 'num') { pos++; base = { '': t.v }; }
    else if (t.t === 'var') { pos++; base = { [t.v]: 1 }; }
    else if (t.t === '(') {
      pos++;
      base = parseExpr();
      if (base === null || !peek() || peek().t !== ')') return null;
      pos++;
    } else return null;
    if (peek() && peek().t === '^') {
      pos++;
      const e = peek();
      if (!e || e.t !== 'num' || !Number.isInteger(e.v) || e.v < 0 || e.v > 6) return null;
      pos++;
      base = _polyPow(base, e.v);
    }
    return _polyClean(base);
  }

  const p = parseExpr();
  if (p === null || pos !== toks.length) return null;
  return p;
}

function polyEqual(a, b) {
  if (!a || !b) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every(k => b[k] !== undefined && Math.abs(a[k] - b[k]) < 1e-9);
}

// かっこの 外（深さ0）にある「＋・－」で 項に わける（先頭の ＋・－ は 符号）
function _alTopTerms(s) {
  const terms = [];
  let depth = 0, cur = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if ((ch === '+' || ch === '-') && depth === 0 && i > 0 && s[i - 1] !== '^') { terms.push(cur); cur = ch === '-' ? '-' : ''; }
    else cur += ch;
  }
  if (cur !== '') terms.push(cur);
  return terms;
}

// 展開・計算ずみか：かっこが なく、同じ種類の項が 2回 出てこない
function isExpandedForm(str) {
  const s = _alNormalize(str);
  if (s.indexOf('(') >= 0) return false;
  const p = parsePoly(str);
  if (!p) return false;
  const terms = _alTopTerms(s).filter(t => t !== '' && t !== '+' && t !== '-');
  const keys = terms.map(t => { const q = parsePoly(t); return q ? Object.keys(q).join('|') : null; });
  if (keys.some(k => k === null)) return false;
  return new Set(keys).size === keys.length && keys.length === Object.keys(p).length;
}

// 積の かたちか。top-level の 因数（かっこ・数・文字）を 数える
function _alTopFactors(s) {
  const f = [];
  let i = 0;
  if (s[0] === '-' || s[0] === '+') i = 1;
  while (i < s.length) {
    if (s[i] === '*') { i++; continue; }
    let start = i, j = i;
    if (s[j] === '(') {
      let depth = 0;
      for (; j < s.length; j++) { if (s[j] === '(') depth++; if (s[j] === ')') { depth--; if (depth === 0) { j++; break; } } }
      if (depth !== 0) return null;
    } else if (/[a-z]/.test(s[j])) j++;
    else if (/[\d.]/.test(s[j])) { while (j < s.length && /[\d.]/.test(s[j])) j++; }
    else return null;
    let exp = 1;
    if (s[j] === '^') { const m = s.slice(j + 1).match(/^\d+/); if (!m) return null; exp = Number(m[0]); j += 1 + m[0].length; }
    f.push({ text: s.slice(start, j), exp });
    i = j;
  }
  return f;
}

function isFactoredForm(str) {
  const s = _alNormalize(str);
  const terms = _alTopTerms(s).filter(t => t !== '' && t !== '+' && t !== '-');
  if (terms.length !== 1) return false;   // 外に ＋・－ が あるのは 和の かたち
  const f = _alTopFactors(s);
  if (!f) return false;
  // かっこで くくった 2項いじょうの 式が 1つは ひつよう（3x のような 単項式は 因数分解の 答えでは ない）
  const hasGroup = f.some(fa => {
    if (fa.text[0] !== '(') return false;
    const inner = parsePoly(fa.text.slice(1, fa.text.lastIndexOf(')')));
    return !!inner && Object.keys(inner).length >= 2;
  });
  if (!hasGroup) return false;
  if (f.length >= 2) return true;
  return f[0].exp >= 2;   // (x+3)^2
}

function _alGcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }

// かっこの 中に 共通因数（数・文字）が のこっていないか（「くくりきれて いる」か）
function factorsAreReduced(str) {
  const s = _alNormalize(str);
  const f = _alTopFactors(s);
  if (!f) return false;
  return f.every(fa => {
    if (fa.text[0] !== '(') return true;
    const inner = parsePoly(fa.text.slice(1, fa.text.lastIndexOf(')')));
    if (!inner) return false;
    const keys = Object.keys(inner);
    if (keys.length < 2) return true;
    const g = keys.reduce((acc, k) => _alGcd(acc, Math.round(inner[k])), 0);
    if (g > 1) return false;
    // 全部の項に 入っている 文字
    const exps = keys.map(k => { const e = {}; if (k) k.split('*').forEach(t => { const m = t.match(/^([a-z])(?:\^(\d+))?$/); e[m[1]] = Number(m[2] || 1); }); return e; });
    const vars = new Set(); exps.forEach(e => Object.keys(e).forEach(v => vars.add(v)));
    for (const v of vars) if (exps.every(e => (e[v] || 0) >= 1)) return false;
    return true;
  });
}

// ---- 答えの かたち（算数の isMathAnswerCorrect から よばれる）----
// kind: 'algebra'（展開・計算：まとまった かたち）／'factor'（因数分解：積の かたち）
function algebraAnswerCorrect(kind, userInput, answer) {
  const u = parsePoly(userInput), a = parsePoly(answer);
  if (!u || !a || !polyEqual(u, a)) return false;
  if (kind === 'factor') return isFactoredForm(userInput) && factorsAreReduced(userInput);
  return isExpandedForm(userInput);
}

// 「x=3, y=-2」「(3,-2)」「3,-2」を [x, y] に。読めなければ null
function parseXY(str) {
  const s = String(str).normalize('NFKC').replace(/[－ー−]/g, '-').replace(/\s+/g, '').toLowerCase();
  const mx = s.match(/x=(-?\d+(?:\.\d+)?)/), my = s.match(/y=(-?\d+(?:\.\d+)?)/);
  if (mx && my) return [Number(mx[1]), Number(my[1])];
  if (!/[a-z]/.test(s)) {
    const nums = s.match(/-?\d+(?:\.\d+)?/g);
    if (nums && nums.length === 2) return nums.map(Number);
  }
  return null;
}

// 「x=-2, -3」「x=-2,x=-3」「-3,-2」を 小さい順の 数の 一覧に。読めなければ null
function parseRoots(str) {
  const s = String(str).normalize('NFKC').replace(/[－ー−]/g, '-').replace(/\s+/g, '').toLowerCase().replace(/x\d?=/g, '');
  if (/[a-z]/.test(s.replace(/または|or|と/g, ''))) return null;
  const nums = s.match(/-?\d+(?:\.\d+)?/g);
  if (!nums) return null;
  return Array.from(new Set(nums.map(Number))).sort((a, b) => a - b);
}
