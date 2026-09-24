// Web Audio API ambient planetary synthesizer for "Ms. Heavy Metal Leaf"
// Zero external audio files; pure algorithmic harmonic frequencies.

class PlanetaryAudioSynth {
  private ctx: AudioContext | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.15;

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public start() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Master gain
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 1.5);
    this.gainNode.connect(this.ctx.destination);

    // 432 Hz Earth Resonance tone (Verdi's A / organic tuning)
    this.osc1 = this.ctx.createOscillator();
    this.osc1.type = 'sine';
    this.osc1.frequency.setValueAtTime(216, this.ctx.currentTime); // Sub-harmonic 216Hz

    // 108 Hz Sub-bass root note (Earth pulse)
    this.osc2 = this.ctx.createOscillator();
    this.osc2.type = 'triangle';
    this.osc2.frequency.setValueAtTime(108, this.ctx.currentTime);

    // Subtle LFO for gentle chlorophyll pulse
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // Slow 8-second breath
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    lfo.connect(lfoGain.gain);

    this.osc1.connect(this.gainNode);
    this.osc2.connect(this.gainNode);

    this.osc1.start();
    this.osc2.start();
    this.isPlaying = true;
  }

  public stop() {
    if (!this.gainNode || !this.ctx) return;
    this.gainNode.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
    setTimeout(() => {
      this.osc1?.stop();
      this.osc2?.stop();
      this.osc1?.disconnect();
      this.osc2?.disconnect();
      this.isPlaying = false;
    }, 800);
  }

  public setVolume(val: number) {
    this.volume = val;
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(val, this.ctx.currentTime);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const planetaryAudio = new PlanetaryAudioSynth();
