export class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = 0.5;
    this.lastStep = 0;
  }

  ensure() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  setVolume(v) { this.master = v; }

  beep(freq, duration = 0.05, type = 'sine', gain = 0.05) {
    this.ensure();
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.frequency.value = freq;
    o.type = type;
    g.gain.value = gain * this.master;
    o.connect(g).connect(this.ctx.destination);
    o.start(t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    o.stop(t + duration);
  }

  click() { this.beep(780, 0.04, 'triangle', 0.04); }
  footstep() { this.beep(95 + Math.random() * 40, 0.035, 'square', 0.03); }
  ambientTick() { this.beep(180, 0.07, 'sine', 0.015); }
}
