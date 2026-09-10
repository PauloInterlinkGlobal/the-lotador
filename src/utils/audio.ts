/**
 * Web Audio API & Speech Synthesizer for Arcade Sounds
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicMuted: boolean = false;
  private musicInterval: any = null;

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public setMusicMuted(muted: boolean) {
    this.isMusicMuted = muted;
    if (muted && this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  // Footstep sound synchronized with foot strikes
  public playStep(isRun: boolean = false) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Short thud / noise burst for footstep
    const bufferSize = ctx.sampleRate * 0.03; // 30ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isRun ? 380 : 280, now);
    filter.Q.setValueAtTime(2.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(isRun ? 0.08 : 0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  }

  // Turn / Brake skid sound
  public playSkid() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.08);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Play button click
  public playClick() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  // Call / Whistle sound
  public playCall() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.15);
    osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }

  // Passenger accepted / Money sound
  public playCoin() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.08);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.3);
  }

  // Taxi Full Fanfare!
  public playTaxiFull() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);
      gain.gain.setValueAtTime(0.15, now + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.2);
    });
  }

  // Horn sound
  public playHorn() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(320, now);
    osc2.frequency.setValueAtTime(370, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.35);
    osc2.start(now);
    osc2.stop(now + 0.35);
  }

  // Police / Fiscal Whistle sound 👮🚨
  public playWhistle() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Whistle dual oscillator with rapid trill modulation
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';
    
    // Realistic pea whistle two-tone trill around 2.4kHz & 2.8kHz
    osc1.frequency.setValueAtTime(2400, now);
    osc1.frequency.linearRampToValueAtTime(2550, now + 0.08);
    osc1.frequency.linearRampToValueAtTime(2350, now + 0.16);
    osc1.frequency.linearRampToValueAtTime(2600, now + 0.24);

    osc2.frequency.setValueAtTime(2850, now);
    osc2.frequency.linearRampToValueAtTime(3000, now + 0.08);
    osc2.frequency.linearRampToValueAtTime(2780, now + 0.16);
    osc2.frequency.linearRampToValueAtTime(3050, now + 0.24);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.3);
    osc2.start(now);
    osc2.stop(now + 0.3);
  }

  // Stumble / Bump sound (colliding with zungueira / ambulante)
  public playStumble() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Passenger Dispute Alert ("É MEU!") ⚔️
  public playDisputeAlert() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'square';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(440, now);
    osc1.frequency.setValueAtTime(554.37, now + 0.08); // C#5
    osc2.frequency.setValueAtTime(659.25, now); // E5

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.22);
    osc2.start(now);
    osc2.stop(now + 0.22);
  }

  // Dispute Won Fanfare! 🏆
  public playDisputeWin() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [587.33, 739.99, 880.00]; // D5, F#5, A5
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.06);
      gain.gain.setValueAtTime(0.18, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.18);
    });
  }

  // Combo Sound
  public playCombo(level: number) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const baseFreq = 400 + Math.min(level, 10) * 100;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.15);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Voice phrase synth or Web Speech
  public speakPhrase(text: string) {
    if (this.isMuted) return;
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-PT';
        utterance.rate = 1.3;
        utterance.pitch = 1.1;
        utterance.volume = 0.8;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        // Fallback sound if speech synth fails
        this.playCall();
      }
    } else {
      this.playCall();
    }
  }

  // Dynamic Background Rhythm / Music
  public startBackgroundRhythm(isRushHour: boolean = false) {
    if (this.isMusicMuted) return;
    this.stopBackgroundRhythm();

    const bpm = isRushHour ? 140 : 110;
    const intervalMs = (60 / bpm) * 1000 / 2;

    const beatNotes = isRushHour 
      ? [130, 200, 150, 260, 130, 220, 180, 300]
      : [110, 0, 150, 0, 110, 0, 130, 0];

    let step = 0;
    this.musicInterval = setInterval(() => {
      const ctx = this.getContext();
      if (!ctx) return;
      const freq = beatNotes[step % beatNotes.length];
      if (freq > 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = isRushHour ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
      step++;
    }, intervalMs);
  }

  public stopBackgroundRhythm() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  public vibrate(ms: number = 50) {
    if (navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch (e) {}
    }
  }
}

export const soundManager = new SoundEngine();
