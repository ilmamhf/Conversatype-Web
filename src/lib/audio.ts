import { SoundPack } from '../types/settings';

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private soundPack: SoundPack = 'thock';
  private volume: number = 0.5;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundPack(pack: SoundPack) {
    this.soundPack = pack;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public playKeyClick(pack?: SoundPack) {
    const activePack = pack || this.soundPack;
    if (activePack === 'silent' || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    if (activePack === 'cherry') {
      // Crisp clicky mechanical switch (Cherry MX Blue snap + housing clack)
      // 1. High-frequency click-jacket snap
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(3200 + Math.random() * 400, t);
      clickOsc.frequency.exponentialRampToValueAtTime(1600, t + 0.008);
      clickGain.gain.setValueAtTime(this.volume * 0.22, t);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.009);
      clickOsc.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      clickOsc.start(t);
      clickOsc.stop(t + 0.01);

      // 2. Plastic bottom-out body clack
      const bodyOsc = this.ctx.createOscillator();
      const bodyGain = this.ctx.createGain();
      bodyOsc.type = 'triangle';
      bodyOsc.frequency.setValueAtTime(520 + Math.random() * 60, t);
      bodyOsc.frequency.exponentialRampToValueAtTime(240, t + 0.025);
      bodyGain.gain.setValueAtTime(this.volume * 0.35, t);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
      bodyOsc.connect(bodyGain);
      bodyGain.connect(this.ctx.destination);
      bodyOsc.start(t);
      bodyOsc.stop(t + 0.03);

    } else if (activePack === 'thock') {
      // Deep, creamy tactile thock (low fundamental resonance + soft acoustic bump)
      // 1. Warm low fundamental resonator
      const thockOsc = this.ctx.createOscillator();
      const thockGain = this.ctx.createGain();
      thockOsc.type = 'sine';
      thockOsc.frequency.setValueAtTime(190 + Math.random() * 30, t);
      thockOsc.frequency.exponentialRampToValueAtTime(65, t + 0.055);
      thockGain.gain.setValueAtTime(this.volume * 0.5, t);
      thockGain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);
      thockOsc.connect(thockGain);
      thockGain.connect(this.ctx.destination);
      thockOsc.start(t);
      thockOsc.stop(t + 0.06);

      // 2. Soft woody acoustic transient
      const bumpOsc = this.ctx.createOscillator();
      const bumpGain = this.ctx.createGain();
      bumpOsc.type = 'triangle';
      bumpOsc.frequency.setValueAtTime(380 + Math.random() * 40, t);
      bumpOsc.frequency.exponentialRampToValueAtTime(140, t + 0.02);
      bumpGain.gain.setValueAtTime(this.volume * 0.25, t);
      bumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
      bumpOsc.connect(bumpGain);
      bumpGain.connect(this.ctx.destination);
      bumpOsc.start(t);
      bumpOsc.stop(t + 0.025);

    } else if (activePack === 'pop') {
      // Cheerful, round bubble pop (rapid resonant inflection)
      const popOsc = this.ctx.createOscillator();
      const popGain = this.ctx.createGain();
      popOsc.type = 'sine';
      popOsc.frequency.setValueAtTime(420, t);
      popOsc.frequency.exponentialRampToValueAtTime(920 + Math.random() * 80, t + 0.015);
      popOsc.frequency.exponentialRampToValueAtTime(700, t + 0.035);
      popGain.gain.setValueAtTime(this.volume * 0.4, t);
      popGain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
      popOsc.connect(popGain);
      popGain.connect(this.ctx.destination);
      popOsc.start(t);
      popOsc.stop(t + 0.04);
    }
  }

  public playMessageSent() {
    if (this.soundPack === 'silent' || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Pleasant ascending chime
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.05);

      gain.gain.setValueAtTime(this.volume * 0.25, t + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.05);
      osc.stop(t + i * 0.05 + 0.2);
    });
  }

  public playMessageReceived() {
    if (this.soundPack === 'silent' || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(659.25, t + 0.12);

    gain.gain.setValueAtTime(this.volume * 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  public playError() {
    if (this.soundPack === 'silent' || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);

    gain.gain.setValueAtTime(this.volume * 0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  public playSuccessFanfare() {
    if (this.soundPack === 'silent' || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
    chord.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(this.volume * 0.28, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.45);
    });
  }
}

export const soundService = new SoundSynthesizer();
