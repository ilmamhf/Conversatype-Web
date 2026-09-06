/**
 * Conversatype Procedural Web Audio Synthesizer
 *
 * Provides 100% client-side, zero-latency audio synthesis using the browser Web Audio API.
 * Eliminates network roundtrips and asset loading delays for mechanical switch typing feedback.
 *
 * Sound Profiles:
 * - Cherry MX Blue ('cherry'): Sharp dual-stage mechanical snap (3200Hz click-jacket transient + 520Hz housing clack).
 * - Tactile Thock ('thock'): Warm, creamy low fundamental resonance (190Hz -> 65Hz) paired with a soft woody bump.
 * - Bubble Pop ('pop'): Cheerful, round upward frequency inflection (420Hz -> 920Hz -> 700Hz).
 * - Silent Mode ('silent'): Mutes all keystrokes and gameplay audio effects.
 */

import { SoundPack } from '../types/settings';

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private soundPack: SoundPack = 'thock';
  private volume: number = 0.5;

  /**
   * Lazily initializes and resumes the Web Audio AudioContext upon user gesture.
   */
  private initContext(): void {
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

  /**
   * Updates global fallback sound pack preference.
   */
  public setSoundPack(pack: SoundPack): void {
    this.soundPack = pack;
  }

  /**
   * Updates master playback volume (clamped between 0.0 and 1.0).
   */
  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  /**
   * Plays a single keystroke sound effect.
   *
   * @param pack Optional explicit sound pack override (guarantees direct injection from user settings).
   */
  public playKeyClick(pack?: SoundPack): void {
    const activePack = pack || this.soundPack;
    if (activePack === 'silent' || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    if (activePack === 'cherry') {
      // 1. High-frequency metallic click-jacket snap (3200Hz -> 1600Hz in 8ms)
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

      // 2. Plastic bottom-out body clack (520Hz -> 240Hz in 25ms)
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
      // 1. Deep fundamental resonator (190Hz -> 65Hz in 55ms)
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

      // 2. Soft woody acoustic transient bump (380Hz -> 140Hz in 20ms)
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
      // Cheerful, round bubble pop with rapid upward pitch inflection
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

  /**
   * Plays a pleasant ascending 3-tone chime when a user message finishes and sends.
   */
  public playMessageSent(): void {
    if (this.soundPack === 'silent' || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Ascending arpeggio (C5 -> E5 -> G5)
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

  /**
   * Plays a 2-tone alert chime when the NPC delivers a new chat message.
   */
  public playMessageReceived(): void {
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

  /**
   * Plays a low-pitch sawtooth buzz on an incorrect keystroke.
   */
  public playError(): void {
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

  /**
   * Plays a celebratory fanfare arpeggio upon scenario completion.
   */
  public playSuccessFanfare(): void {
    if (this.soundPack === 'silent' || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio (C5 -> E5 -> G5 -> C6)
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

/**
 * Global singleton sound service instance.
 */
export const soundService = new SoundSynthesizer();
