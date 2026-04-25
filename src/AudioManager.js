export class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = 0.5;
    this.lastStep = 0;
  }

  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  setVolume(value) { this.master = value; }

  tone({ frequency, duration, gain, type = 'sine' }) {
    this.init();
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    const start = this.ctx.currentTime;

    osc.type = type;
    osc.frequency.value = frequency;
    amp.gain.value = gain * this.master;

    osc.connect(amp).connect(this.ctx.destination);
    osc.start(start);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.stop(start + duration);
  }

  uiClick() { this.tone({ frequency: 880, duration: 0.05, gain: 0.045, type: 'triangle' }); }
  step() { this.tone({ frequency: 95 + Math.random() * 60, duration: 0.035, gain: 0.03, type: 'square' }); }
  ambient() { this.tone({ frequency: 170 + Math.random() * 50, duration: 0.08, gain: 0.01, type: 'sine' }); }
  land() { this.tone({ frequency: 130, duration: 0.05, gain: 0.025, type: 'sawtooth' }); }
}
