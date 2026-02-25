export class GameAudio {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  init(): void {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    // Load mute state from localStorage
    try {
      this.muted = localStorage.getItem("adventure_muted") === "true";
    } catch {
      // localStorage unavailable
    }
  }

  private playTone(
    startFreq: number,
    endFreq: number,
    duration: number,
    type: OscillatorType = "square",
  ): void {
    if (this.muted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(
      endFreq,
      this.ctx.currentTime + duration,
    );
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playHop(): void {
    this.playTone(440, 520, 0.06);
  }

  playScore(): void {
    this.playTone(523, 784, 0.15);
  }

  playDeath(): void {
    this.playTone(200, 80, 0.3, "sawtooth");
  }

  playStart(): void {
    if (this.muted || !this.ctx) return;
    // Quick ascending arpeggio
    const notes = [262, 330, 392, 523];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0.12, this.ctx!.currentTime + i * 0.08);
      gain.gain.linearRampToValueAtTime(
        0,
        this.ctx!.currentTime + i * 0.08 + 0.1,
      );
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(this.ctx!.currentTime + i * 0.08);
      osc.stop(this.ctx!.currentTime + i * 0.08 + 0.1);
    });
  }

  playLevelUp(): void {
    // Double rising tone for level up
    this.playTone(523, 784, 0.15);
    if (!this.muted && this.ctx) {
      setTimeout(() => this.playTone(659, 1047, 0.15), 150);
    }
  }

  playSplash(): void {
    this.playTone(600, 100, 0.2, "sawtooth");
  }

  playLogLand(): void {
    this.playTone(300, 350, 0.08, "triangle");
  }

  setMuted(m: boolean): void {
    this.muted = m;
    try {
      localStorage.setItem("adventure_muted", String(m));
    } catch {
      // localStorage unavailable
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  destroy(): void {
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}
