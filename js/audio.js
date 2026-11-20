// Retro 16-bit Web Audio Synthesizer (Zero External Assets — Race & Battle SFX)
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.engineOscP1 = null;
    this.engineGainP1 = null;
    this.engineOscP2 = null;
    this.engineGainP2 = null;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();

    this.engineOscP1 = this.ctx.createOscillator();
    this.engineGainP1 = this.ctx.createGain();
    this.engineOscP1.type = 'sawtooth';
    this.engineOscP1.frequency.value = 55;
    this.engineGainP1.gain.value = 0;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 260;

    this.engineOscP1.connect(this.engineGainP1);
    this.engineGainP1.connect(filter);
    filter.connect(this.ctx.destination);
    this.engineOscP1.start();

    this.engineOscP2 = this.ctx.createOscillator();
    this.engineGainP2 = this.ctx.createGain();
    this.engineOscP2.type = 'triangle';
    this.engineOscP2.frequency.value = 60;
    this.engineGainP2.gain.value = 0;
    this.engineOscP2.connect(this.engineGainP2);
    this.engineGainP2.connect(filter);
    this.engineOscP2.start();
  }

  toggleMute() {
    this.enabled = !this.enabled;
    if (!this.enabled && this.engineGainP1) {
      this.engineGainP1.gain.value = 0;
      this.engineGainP2.gain.value = 0;
    }
    return this.enabled;
  }

  updateEngines(speedRatio1, speedRatio2, active) {
    if (!this.ctx || !this.enabled || !active) {
      if (this.engineGainP1) {
        this.engineGainP1.gain.value = 0;
        this.engineGainP2.gain.value = 0;
      }
      return;
    }
    const now = this.ctx.currentTime;
    const f1 = 48 + Math.min(1.4, Math.abs(speedRatio1)) * 95;
    const f2 = 52 + Math.min(1.4, Math.abs(speedRatio2)) * 98;
    this.engineOscP1.frequency.setTargetAtTime(f1, now, 0.05);
    this.engineOscP2.frequency.setTargetAtTime(f2, now, 0.05);
    this.engineGainP1.gain.setTargetAtTime(speedRatio1 < 0 ? 0 : 0.032, now, 0.08);
    this.engineGainP2.gain.setTargetAtTime(speedRatio2 < 0 ? 0 : 0.028, now, 0.08);
  }

  tone(freq, duration, type = 'square', vol = 0.08, slideTo = null) {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
    }
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  playCountdown(go = false) {
    if (go) {
      this.tone(880, 0.38, 'square', 0.11);
      setTimeout(() => this.tone(1174.66, 0.28, 'triangle', 0.09), 50);
    } else {
      this.tone(440, 0.18, 'square', 0.09);
    }
  }

  playHop() {
    this.tone(240, 0.11, 'square', 0.06, 480);
  }

  playBoost() {
    this.tone(320, 0.32, 'sawtooth', 0.09, 920);
  }

  playItemPickup() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      setTimeout(() => this.tone(n, 0.08, 'square', 0.07), idx * 45);
    });
  }

  playShoot() {
    this.tone(620, 0.16, 'sawtooth', 0.08, 180);
  }

  playBounce() {
    this.tone(520, 0.08, 'triangle', 0.06, 780);
  }

  playHit() {
    this.tone(160, 0.35, 'sawtooth', 0.11, 45);
  }

  playBalloonPop() {
    // Crisp retro balloon snap + drop
    this.tone(720, 0.06, 'square', 0.12, 160);
    setTimeout(() => this.tone(240, 0.22, 'sawtooth', 0.10, 65), 45);
  }

  playElimination() {
    // Dramatic 3-note KO fanfare
    const notes = [440, 349.23, 220, 110];
    notes.forEach((n, idx) => {
      setTimeout(() => this.tone(n, idx === 3 ? 0.38 : 0.11, 'sawtooth', 0.11, n * 0.75), idx * 85);
    });
  }

  playLightning() {
    this.tone(920, 0.12, 'sawtooth', 0.12, 110);
    setTimeout(() => this.tone(640, 0.38, 'sawtooth', 0.12, 55), 90);
  }

  playRescue() {
    const notes = [392.0, 523.25, 659.25, 783.99];
    notes.forEach((n, idx) => {
      setTimeout(() => this.tone(n, 0.12, 'triangle', 0.08), idx * 90);
    });
  }

  playWrongWay() {
    this.tone(310, 0.12, 'sawtooth', 0.07);
    setTimeout(() => this.tone(230, 0.15, 'sawtooth', 0.07), 120);
  }

  playCoin() {
    this.tone(987.77, 0.07, 'square', 0.06);
    setTimeout(() => this.tone(1318.51, 0.18, 'square', 0.06), 65);
  }

  playLap() {
    const notes = [587.33, 739.99, 880, 1174.66];
    notes.forEach((n, idx) => {
      setTimeout(() => this.tone(n, 0.13, 'triangle', 0.1), idx * 75);
    });
  }

  playFinish() {
    const melody = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    melody.forEach((n, idx) => {
      setTimeout(() => this.tone(n, idx === 5 ? 0.45 : 0.14, 'square', 0.1), idx * 110);
    });
  }
}

window.sound = new SoundEngine();
