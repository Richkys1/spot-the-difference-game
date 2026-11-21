// Synthesised sound for Twin Tides — WebAudio only, no audio files.
// A small chime on each find, a soft buzz on a miss, a shimmer for hints,
// an arpeggio for level clears, and a gentle generative music loop made of
// plucked pentatonic notes over a low pad.

const NOTE_FREQUENCIES = {
  C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.0, A4: 440.0,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0,
  E6: 1318.51, G6: 1567.98,
};

const PENTATONIC = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5'];

export class SoundBank {
  constructor() {
    this.context = null;
    this.master = null;
    this.muted = false;
    this.musicTimer = null;
    this.musicStep = 0;
  }

  ensureContext() {
    if (this.context) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.master.gain.value = this.muted ? 0 : 0.5;
    this.master.connect(this.context.destination);
  }

  unlock() {
    this.ensureContext();
    if (this.context && this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : 0.5;
  }

  playTone(frequency, startAt, duration, type, volume) {
    if (!this.context || !this.master) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.05);
  }

  playFind(combo) {
    if (!this.context) return;
    const now = this.context.currentTime;
    const base = 523.25 * Math.pow(1.059463, Math.min(combo, 8));
    this.playTone(base, now, 0.35, 'sine', 0.5);
    this.playTone(base * 1.5, now + 0.07, 0.45, 'sine', 0.4);
    this.playTone(base * 2, now + 0.14, 0.5, 'triangle', 0.25);
  }

  playMiss() {
    if (!this.context) return;
    const now = this.context.currentTime;
    this.playTone(160, now, 0.18, 'sawtooth', 0.18);
    this.playTone(120, now + 0.05, 0.22, 'sawtooth', 0.15);
  }

  playHint() {
    if (!this.context) return;
    const now = this.context.currentTime;
    this.playTone(880, now, 0.3, 'sine', 0.3);
    this.playTone(1174.66, now + 0.08, 0.4, 'sine', 0.3);
    this.playTone(1567.98, now + 0.16, 0.5, 'sine', 0.25);
  }

  playTick() {
    if (!this.context) return;
    this.playTone(1200, this.context.currentTime, 0.07, 'square', 0.12);
  }

  playLevelClear() {
    if (!this.context) return;
    const now = this.context.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((frequency, index) => {
      this.playTone(frequency, now + index * 0.09, 0.5, 'triangle', 0.35);
    });
  }

  playGameOver() {
    if (!this.context) return;
    const now = this.context.currentTime;
    const notes = [392.0, 349.23, 311.13, 261.63];
    notes.forEach((frequency, index) => {
      this.playTone(frequency, now + index * 0.16, 0.5, 'triangle', 0.3);
    });
  }

  playWin() {
    if (!this.context) return;
    const now = this.context.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.51, 1567.98];
    notes.forEach((frequency, index) => {
      this.playTone(frequency, now + index * 0.11, 0.6, 'triangle', 0.32);
    });
  }

  startMusic() {
    if (!this.context || this.musicTimer) return;
    this.musicTimer = window.setInterval(() => {
      if (this.muted) return;
      const noteName = PENTATONIC[this.musicStep % PENTATONIC.length];
      const frequency = NOTE_FREQUENCIES[noteName];
      this.playTone(frequency, this.context.currentTime, 1.6, 'sine', 0.08);
      this.musicStep += 1;
    }, 900);
  }

  stopMusic() {
    if (this.musicTimer) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}
