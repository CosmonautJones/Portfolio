const MAX_SIZE = 50;
const STORAGE_KEY = "terminal_history";

export class CommandHistory {
  private entries: string[] = [];

  constructor() {
    this.load();
  }

  push(entry: string) {
    if (!entry.trim()) return;
    // Remove duplicate if exists
    const idx = this.entries.indexOf(entry);
    if (idx !== -1) this.entries.splice(idx, 1);
    this.entries.push(entry);
    if (this.entries.length > MAX_SIZE) {
      this.entries.shift();
    }
    this.save();
  }

  /** Get entry by index from the end (0 = most recent) */
  get(index: number): string | undefined {
    if (index < 0 || index >= this.entries.length) return undefined;
    return this.entries[this.entries.length - 1 - index];
  }

  get length() {
    return this.entries.length;
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
    } catch {
      // localStorage unavailable
    }
  }

  private load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          this.entries = parsed.slice(-MAX_SIZE);
        }
      }
    } catch {
      // localStorage unavailable
    }
  }
}
