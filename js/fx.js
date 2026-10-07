// ===== 音・ふるえ・よみあげ・紙ふぶき =====
const FX = (function () {
  let ctx = null;

  const soundOn = () => {
    try { return localStorage.getItem('manabi_sound') !== 'off'; } catch (e) { return true; }
  };
  const reducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function audio() {
    try {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
      }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    } catch (e) {
      return null;
    }
  }

  function tone(freq, start, dur, type = 'sine', vol = 0.16) {
    const c = audio();
    if (!c) return;
    const t0 = c.currentTime + start;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  function buzz(ms) {
    try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* 非対応端末は無視 */ }
  }

  function confetti() {
    if (reducedMotion()) return;
    const canvas = document.getElementById('fx-canvas');
    if (!canvas) return;
    const c = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ['#D9482B', '#F5B21B', '#5CC9B0', '#2F7FD8', '#B47AE8', '#FF8FA3'];
    const pieces = Array.from({ length: 90 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 80,
      y: canvas.height * 0.35,
      vx: (Math.random() - 0.5) * 11,
      vy: -Math.random() * 11 - 3,
      size: Math.random() * 7 + 5,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    const start = performance.now();
    function frame(now) {
      const t = now - start;
      c.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.vy += 0.32;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.rot);
        c.fillStyle = p.color;
        c.globalAlpha = Math.max(0, 1 - t / 2200);
        c.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        c.restore();
      });
      if (t < 2200) requestAnimationFrame(frame);
      else c.clearRect(0, 0, canvas.width, canvas.height);
    }
    requestAnimationFrame(frame);
  }

  // 問題文を、読み上げに向いた言い方に直す
  function speakable(text) {
    return String(text)
      .replace(/＋/g, ' たす ')
      .replace(/－/g, ' ひく ')
      .replace(/×/g, ' かける ')
      .replace(/÷/g, ' わる ')
      .replace(/=/g, ' は ')
      .replace(/[？?]/g, '')
      .replace(/□/g, ' なに ')
      .replace(/\n/g, '。');
  }

  return {
    soundOn,
    canSpeak: () => 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined',
    tap() { if (soundOn()) tone(520, 0, 0.05, 'sine', 0.08); },
    correct() {
      buzz(15);
      if (!soundOn()) return;
      tone(660, 0, 0.12);
      tone(880, 0.1, 0.2);
    },
    wrong() {
      buzz([30, 40, 30]);
      if (!soundOn()) return;
      tone(300, 0, 0.18, 'triangle');
      tone(240, 0.16, 0.24, 'triangle');
    },
    clear() {
      confetti();
      if (!soundOn()) return;
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.22));
    },
    levelUp() {
      confetti();
      if (!soundOn()) return;
      [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.24));
    },
    speak(text) {
      if (!this.canSpeak()) return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(speakable(text));
        u.lang = 'ja-JP';
        u.rate = 0.9;
        window.speechSynthesis.speak(u);
      } catch (e) { /* 読み上げ失敗は無視 */ }
    },
    stopSpeak() {
      try { if (this.canSpeak()) window.speechSynthesis.cancel(); } catch (e) { /* 無視 */ }
    }
  };
})();
