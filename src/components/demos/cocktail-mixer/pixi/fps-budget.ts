export class FpsBudget {
  private consecutiveLowFrames = 0;

  constructor(
    private readonly minimumFps: number,
    private readonly lowFrameLimit: number,
  ) {}

  sample(fps: number): boolean {
    if (fps >= this.minimumFps) {
      this.consecutiveLowFrames = 0;
      return false;
    }

    this.consecutiveLowFrames += 1;
    return this.consecutiveLowFrames >= this.lowFrameLimit;
  }
}
