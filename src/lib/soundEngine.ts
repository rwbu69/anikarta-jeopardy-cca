// Web Audio API Synthesizer with Sound Profiles & Default-Disabled State

export type SoundProfile = 'arcade' | 'gameshow' | 'minimal';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = false; // Default disabled per user requirement
  private volume: number = 0.7; // 0.0 to 1.0
  private profile: SoundProfile = 'arcade';

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public setMuted(muted: boolean) {
    this.isEnabled = !muted;
  }

  public getMuted(): boolean {
    return !this.isEnabled;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  public setProfile(profile: SoundProfile) {
    this.profile = profile;
  }

  public getProfile(): SoundProfile {
    return this.profile;
  }

  // 1. Correct Answer Chime
  public playCorrect() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = this.volume;

    if (this.profile === 'minimal') {
      // Soft woodblock chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);

      gain.gain.setValueAtTime(0.2 * masterGain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
      return;
    }

    if (this.profile === 'gameshow') {
      // Reception desk bell + high chime
      [1046.5, 1318.51, 1567.98].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(0.001, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.25 * masterGain, now + i * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.5);
      });
      return;
    }

    // Default 'arcade'
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);

      gain.gain.setValueAtTime(0.001, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.22 * masterGain, now + i * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.4);
    });
  }

  // 2. Wrong Answer Buzz
  public playWrong() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = this.volume;

    if (this.profile === 'minimal') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);

      gain.gain.setValueAtTime(0.18 * masterGain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
      return;
    }

    // Classic loud buzz or arcade buzz
    const oscType = this.profile === 'gameshow' ? 'sawtooth' : 'square';
    [130, 138].forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = oscType;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2 * masterGain, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    });
  }

  // 3. Buzzer Lockout Hit
  public playBuzzer() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = this.volume;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = this.profile === 'minimal' ? 'sine' : 'square';
    osc.frequency.setValueAtTime(this.profile === 'gameshow' ? 480 : 380, now);
    osc.frequency.setValueAtTime(this.profile === 'gameshow' ? 560 : 440, now + 0.08);

    gain.gain.setValueAtTime(0.24 * masterGain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // 4. Timer Tick
  public playTick() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = this.volume;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(this.profile === 'gameshow' ? 950 : 800, now);

    gain.gain.setValueAtTime(0.12 * masterGain, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // 5. Time's Up Alarm
  public playTimeUp() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = this.volume;

    [0, 0.14, 0.28].forEach(offset => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(587.33, now + offset);
      osc.frequency.setValueAtTime(440, now + offset + 0.06);

      gain.gain.setValueAtTime(0.18 * masterGain, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.13);
    });
  }

  // 6. Generic Click
  public playClick() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = this.volume;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(920, now + 0.03);

    gain.gain.setValueAtTime(0.08 * masterGain, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // 7. Victory Podium Fanfare
  public playFanfare() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = this.volume;

    const chords = [
      { f: [523.25, 659.25, 783.99], t: 0, d: 0.16 },
      { f: [523.25, 659.25, 783.99], t: 0.18, d: 0.16 },
      { f: [523.25, 659.25, 783.99], t: 0.36, d: 0.16 },
      { f: [659.25, 783.99, 1046.50], t: 0.55, d: 0.7 }
    ];

    chords.forEach(({ f, t, d }) => {
      f.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = this.profile === 'gameshow' ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + t);

        gain.gain.setValueAtTime(0.001, now + t);
        gain.gain.exponentialRampToValueAtTime(0.15 * masterGain, now + t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + t + d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + t);
        osc.stop(now + t + d + 0.05);
      });
    });
  }
}

export const sound = new SoundEngine();
