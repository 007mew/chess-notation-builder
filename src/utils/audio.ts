import { Square } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private speechEnabled: boolean = false;
  private speechRate: number = 1.1;
  private metronomeTimer: number | null = null;
  private metronomeBpm: number = 0;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

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

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public setSpeechEnabled(enabled: boolean) {
    this.speechEnabled = enabled;
  }

  public setSpeechRate(rate: number) {
    this.speechRate = rate;
  }

  /**
   * Continuous reflex conditioning metronome
   */
  public setMetronome(bpm: number) {
    this.metronomeBpm = bpm;
    if (this.metronomeTimer) {
      clearInterval(this.metronomeTimer);
      this.metronomeTimer = null;
    }

    if (bpm > 0 && this.soundEnabled) {
      const intervalMs = (60 / bpm) * 1000;
      this.metronomeTimer = window.setInterval(() => {
        this.playTick(920);
      }, intervalMs);
    }
  }

  public getMetronomeBpm(): number {
    return this.metronomeBpm;
  }

  /**
   * Pleasant high-pitched two-tone chime for correct hit
   */
  public playCorrect(streak: number = 1, reflexBonus: boolean = false) {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = reflexBonus ? 'triangle' : 'sine';

      // Pitch scales slightly with streak for satisfying flow
      const baseFreq = reflexBonus ? 880 : 587.33; // D5 or A5
      const pitchBump = Math.min(streak * 15, 300);

      osc.frequency.setValueAtTime(baseFreq + pitchBump, now);
      osc.frequency.exponentialRampToValueAtTime((baseFreq + pitchBump) * 1.33, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (reflexBonus ? 0.35 : 0.22));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + (reflexBonus ? 0.35 : 0.22));

      // Extra sparkle tone for reflex bonus (<500ms)
      if (reflexBonus) {
        const bonusOsc = this.ctx.createOscillator();
        const bonusGain = this.ctx.createGain();
        bonusOsc.type = 'sine';
        bonusOsc.frequency.setValueAtTime(1760, now + 0.05); // A6
        bonusOsc.frequency.exponentialRampToValueAtTime(2349.32, now + 0.25); // D7

        bonusGain.gain.setValueAtTime(0.12, now + 0.05);
        bonusGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        bonusOsc.connect(bonusGain);
        bonusGain.connect(this.ctx.destination);

        bonusOsc.start(now + 0.05);
        bonusOsc.stop(now + 0.3);
      }
    } catch {
      // AudioContext policy catch
    }
  }

  /**
   * Low discordant buzzer / woodthud for error
   */
  public playError() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.25);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // ignore
    }
  }

  /**
   * Metronome / clock tick for countdown and survival pacing
   */
  public playTick(pitch: number = 800) {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // ignore
    }
  }

  /**
   * Rapid click feedback for keypress
   */
  public playKeyClick() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch {
      // ignore
    }
  }

  /**
   * High-clarity audio voice speech for coordinates
   * E.g. "E 4" or "G 7"
   */
  public speakSquare(square: Square) {
    if (!this.speechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const file = square[0].toUpperCase();
      const rank = square[1];
      const text = `${file}, ${rank}`;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.speechRate;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(
        (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira'))
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore speech errors
    }
  }

  /**
   * Interactive Sound Previews for Settings
   */
  public testSound(type: 'correct' | 'error' | 'bonus' | 'tick' | 'speech') {
    if (type === 'correct') {
      this.playCorrect(5, false);
    } else if (type === 'error') {
      this.playError();
    } else if (type === 'bonus') {
      this.playCorrect(10, true);
    } else if (type === 'tick') {
      this.playTick(880);
    } else if (type === 'speech') {
      this.speakSquare('e4');
    }
  }
}

export const soundEngine = new SoundEngine();
