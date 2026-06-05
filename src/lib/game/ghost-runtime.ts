// ---------------------------------------------------------------------------
// GhostRuntime — wires the pure ghost data layer (ghost.ts) into a live run.
//
// Held as a single instance by the React game-engine hook (NOT in the
// serializable GameState). Each playing tick the hook calls recordAndAdvance()
// which records the player's grid position and writes the replayed ghost's
// position back into state.ghostPos for the renderers to draw. Recording and
// replay advance on the SAME cadence (one playing tick), so the ghost lines up
// with the live player. Purely cosmetic — never affects gameplay.
// ---------------------------------------------------------------------------

import type { GameState, GhostRun } from "./types";
import {
  GhostRecorder,
  GhostReplayer,
  loadGhostFromStorage,
  saveGhostToStorage,
  shouldUpdateGhost,
} from "./ghost";

export class GhostRuntime {
  private recorder = new GhostRecorder();
  private replayer: GhostReplayer | null = null;
  /** The currently persisted best run, used for the shouldUpdateGhost compare. */
  private currentGhost: GhostRun | null = null;

  /**
   * Load the best stored run (if any) and arm a replayer for it. Call once on
   * setup. Safe when no ghost is stored (replayer stays null → no ghost drawn).
   */
  loadFromStorage(): void {
    this.currentGhost = loadGhostFromStorage();
    this.replayer = this.currentGhost
      ? new GhostReplayer(this.currentGhost)
      : null;
  }

  /**
   * Re-arm for a new run: clear the recorder and rewind the replayer to the
   * start. Call on every menu→playing / game_over→playing transition.
   */
  armForNewRun(state: GameState): void {
    this.recorder.reset();
    this.replayer?.reset();
    state.ghostTick = 0;
    state.ghostPos = null;
  }

  /**
   * Record the player's current grid position and advance the ghost replay by
   * exactly one tick, writing the replayed position into state.ghostPos. Call
   * once per playing tick from the render loop (after tick()). When the live
   * score passes the ghost's score the ghost is marked beaten and disappears.
   */
  recordAndAdvance(state: GameState): void {
    const { player } = state;
    this.recorder.record(player.gridPos.x, player.gridPos.y, player.facing);
    state.ghostTick = this.recorder.getTick();

    if (this.replayer) {
      // Hide the ghost once the player has out-scored it (fairness/clarity).
      if (this.replayer.isBeaten(state.score)) {
        this.replayer.markBeaten();
      }
      state.ghostPos = this.replayer.getPositionAtTick(state.ghostTick);
    } else {
      state.ghostPos = null;
    }
  }

  /**
   * On death, persist this run as the new best ghost iff its score beats the
   * stored one (same distance+coins score the leaderboard ranks on). Rearms the
   * replayer with the freshly saved run so the next round races the new best.
   */
  persistIfBest(finalScore: number, frames = this.recorder.getFrames()): void {
    if (!shouldUpdateGhost(finalScore, this.currentGhost)) return;
    const run: GhostRun = {
      score: finalScore,
      frames,
      recordedAt: new Date().toISOString(),
    };
    saveGhostToStorage(run);
    this.currentGhost = run;
    this.replayer = new GhostReplayer(run);
  }

  /** True if a stored ghost is currently armed (test/diagnostic helper). */
  hasGhost(): boolean {
    return this.replayer !== null;
  }
}
