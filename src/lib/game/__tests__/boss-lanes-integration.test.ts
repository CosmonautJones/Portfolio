// ---------------------------------------------------------------------------
// Integration tests for the WIRED boss-lane system: a section is injected via
// generateLanesIfNeeded when the score crosses a trigger, inBossSection toggles,
// the deterministic position-based clear awards BOSS_CLEAR_BONUS exactly once
// and fires onBossClear, bossLanesUsed prevents an immediate repeat, and the
// callbacks-threaded signature does NOT regress coin/power-up spawning. The
// boss-lane module itself is unit-tested in boss-lanes.test.ts.
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createInitialState, tick } from "../engine";
import { generateLanesIfNeeded } from "../lanes";
import {
  injectBossSection,
  getBossSectionSize,
  checkBossClear,
} from "../boss-lanes";
import {
  DEFAULT_CONFIG,
  BOSS_LEVEL_TRIGGERS,
  BOSS_CLEAR_BONUS,
  LEVEL_THRESHOLDS,
} from "../constants";
import type { GameCallbacks, GameState } from "../types";

const VIEWPORT_HEIGHT = 640;
const CELL = DEFAULT_CONFIG.cellSize;
const DT = DEFAULT_CONFIG.fixedTimestep;

const GAUNTLET_THRESHOLD = LEVEL_THRESHOLDS[BOSS_LEVEL_TRIGGERS.gauntlet - 1];

function makeCallbacks(): GameCallbacks {
  return {
    onScoreChange: vi.fn(),
    onPhaseChange: vi.fn(),
    onDeath: vi.fn(),
    onHop: vi.fn(),
    onLevelUp: vi.fn(),
    onCoinCollect: vi.fn(),
    onPowerUpCollect: vi.fn(),
    onPowerUpExpire: vi.fn(),
    onBossStart: vi.fn(),
    onBossClear: vi.fn(),
    onWeatherChange: vi.fn(),
  };
}

function freshState(): GameState {
  const state = createInitialState(DEFAULT_CONFIG, VIEWPORT_HEIGHT);
  state.phase = "playing";
  return state;
}

// ---------------------------------------------------------------------------
// 1. Injection on trigger
// ---------------------------------------------------------------------------

describe("Boss section injection via generateLanesIfNeeded", () => {
  let state: GameState;
  let cb: GameCallbacks;

  beforeEach(() => {
    state = freshState();
    cb = makeCallbacks();
  });

  it("injects a boss section once the score crosses the trigger", () => {
    const frontierBefore = state.generatedUpTo;
    state.score = GAUNTLET_THRESHOLD;

    generateLanesIfNeeded(state, DEFAULT_CONFIG, cb);

    expect(state.inBossSection).toBe(true);
    expect(state.bossLanesUsed).toEqual(["gauntlet"]);
    expect(cb.onBossStart).toHaveBeenCalledTimes(1);
    expect(cb.onBossStart).toHaveBeenCalledWith("gauntlet");

    // The deterministic end position is the frontier minus the full section.
    const expectedEndY = frontierBefore - getBossSectionSize("gauntlet");
    expect(state.bossSectionEndY).toBe(expectedEndY);

    // The frontier must have advanced PAST the injected block (it continues
    // generating normal lanes ahead, so it can be even further than endY).
    expect(state.generatedUpTo).toBeLessThanOrEqual(expectedEndY);

    // Boss road lanes must physically exist in the section's y-band.
    const sectionRoadLanes = state.lanes.filter(
      (l) => l.type === "road" && l.y <= frontierBefore && l.y > expectedEndY,
    );
    expect(sectionRoadLanes.length).toBe(3);
    for (const lane of sectionRoadLanes) {
      expect(lane.obstacles.length).toBeGreaterThan(0);
    }
  });

  it("does not inject before the score reaches the trigger", () => {
    state.score = GAUNTLET_THRESHOLD - 1;

    generateLanesIfNeeded(state, DEFAULT_CONFIG, cb);

    expect(state.inBossSection).toBe(false);
    expect(state.bossLanesUsed).toEqual([]);
    expect(cb.onBossStart).not.toHaveBeenCalled();
    expect(state.bossSectionEndY).toBeNull();
  });

  it("does not inject a second section while already inside one", () => {
    state.score = GAUNTLET_THRESHOLD;
    generateLanesIfNeeded(state, DEFAULT_CONFIG, cb);
    expect(state.inBossSection).toBe(true);

    const usedAfterFirst = [...state.bossLanesUsed];
    // Score is high enough that rapids/train would otherwise be eligible.
    state.score = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];

    const injected = injectBossSection(state, DEFAULT_CONFIG, cb);

    expect(injected).toBe(false);
    expect(state.bossLanesUsed).toEqual(usedAfterFirst);
  });
});

// ---------------------------------------------------------------------------
// 2. Deterministic clear + bonus
// ---------------------------------------------------------------------------

describe("Boss section clear (deterministic position-based)", () => {
  let state: GameState;
  let cb: GameCallbacks;

  beforeEach(() => {
    state = freshState();
    cb = makeCallbacks();
    state.score = GAUNTLET_THRESHOLD;
    generateLanesIfNeeded(state, DEFAULT_CONFIG, cb);
  });

  it("does not clear until the player traverses past the section end", () => {
    const endY = state.bossSectionEndY!;
    // Player sits just inside the section (above the end lane).
    state.player.gridPos.y = endY + 1;

    checkBossClear(state, cb);

    expect(state.inBossSection).toBe(true);
    expect(state.coinBonusScore).toBe(0);
    expect(cb.onBossClear).not.toHaveBeenCalled();
  });

  it("awards BOSS_CLEAR_BONUS exactly once and fires onBossClear when cleared", () => {
    const endY = state.bossSectionEndY!;
    state.player.gridPos.y = endY - 1; // past the section

    checkBossClear(state, cb);
    checkBossClear(state, cb); // second pass must NOT double-award

    expect(state.inBossSection).toBe(false);
    expect(state.bossSectionEndY).toBeNull();
    expect(state.coinBonusScore).toBe(BOSS_CLEAR_BONUS);
    expect(cb.onBossClear).toHaveBeenCalledTimes(1);
    expect(cb.onBossClear).toHaveBeenCalledWith("gauntlet");
  });

  it("clears through the live tick pipeline once the player is past the section", () => {
    const endY = state.bossSectionEndY!;
    // Teleport the player past the boss block (mirrors having hopped through).
    state.player.gridPos.y = endY - 1;
    state.player.worldPos.y = (endY - 1) * CELL;
    state.player.hopTarget = null;

    tick(state, DT, DEFAULT_CONFIG, cb);

    expect(state.inBossSection).toBe(false);
    expect(state.coinBonusScore).toBe(BOSS_CLEAR_BONUS);
    expect(cb.onBossClear).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// 3. Re-trigger guard (dedup)
// ---------------------------------------------------------------------------

describe("Boss re-trigger guard", () => {
  it("never injects the same pattern twice in a run", () => {
    const state = freshState();
    const cb = makeCallbacks();

    // Inject + clear gauntlet.
    state.score = GAUNTLET_THRESHOLD;
    generateLanesIfNeeded(state, DEFAULT_CONFIG, cb);
    state.player.gridPos.y = state.bossSectionEndY! - 1;
    checkBossClear(state, cb);
    expect(state.bossLanesUsed).toEqual(["gauntlet"]);
    expect(state.inBossSection).toBe(false);

    // Stay at the gauntlet score and try again — gauntlet is in bossLanesUsed.
    const reinjected = injectBossSection(state, DEFAULT_CONFIG, cb);

    expect(reinjected).toBe(false);
    expect(state.bossLanesUsed).toEqual(["gauntlet"]);
    expect(cb.onBossStart).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// 4. Regression: coins + power-ups still spawn after the signature change
// ---------------------------------------------------------------------------

describe("Signature change does not regress coin/power-up spawning", () => {
  it("still spawns coins on normal lane generation (with callbacks threaded)", () => {
    let sawCoin = false;
    for (let attempt = 0; attempt < 40 && !sawCoin; attempt++) {
      const state = freshState();
      const cb = makeCallbacks();
      const before = state.coins.length;
      for (let step = 0; step < 60; step++) {
        state.player.gridPos.y -= 5;
        generateLanesIfNeeded(state, DEFAULT_CONFIG, cb);
      }
      if (state.coins.length > before) sawCoin = true;
    }
    expect(sawCoin).toBe(true);
  });

  it("still spawns power-ups on normal lane generation (with callbacks threaded)", () => {
    let sawPowerUp = false;
    for (let attempt = 0; attempt < 40 && !sawPowerUp; attempt++) {
      const state = freshState();
      const cb = makeCallbacks();
      for (let step = 0; step < 60; step++) {
        state.player.gridPos.y -= 5;
        generateLanesIfNeeded(state, DEFAULT_CONFIG, cb);
      }
      if (state.powerUps.length > 0) sawPowerUp = true;
    }
    expect(sawPowerUp).toBe(true);
  });

  it("still works when called WITHOUT callbacks (back-compat two-arg call)", () => {
    const state = freshState();
    // Two-arg call site (used elsewhere) must not throw and must still generate.
    state.player.gridPos.y -= 10;
    expect(() => generateLanesIfNeeded(state, DEFAULT_CONFIG)).not.toThrow();
    expect(state.lanes.length).toBeGreaterThan(0);
  });
});
