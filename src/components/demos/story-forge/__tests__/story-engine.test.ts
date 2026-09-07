import { describe, expect, it } from "vitest";
import {
  CHARACTERS,
  CHALLENGES,
  OBJECTS,
  PLACES,
  PROBLEMS,
  TWISTS,
  filterPrompts,
} from "../story-decks";
import {
  clampPlayerCount,
  createInitialState,
  deckHealth,
  everyoneHasGone,
  generateSeed,
  generateTitle,
  normalizeSeed,
  pickChallenge,
  playerLabel,
  reduceGame,
  rerollCategory,
  rollStory,
} from "../story-engine";
import { CATEGORIES, EASTER_SEED, MAX_REROLLS, MODES } from "../story-types";

describe("seeded story roll engine", () => {
  it("normalizes human-friendly seeds", () => {
    expect(normalizeSeed("cosmo-7f3k")).toBe("COSMO-7F3K");
    expect(normalizeSeed("7f3k")).toBe("COSMO-7F3K");
    expect(normalizeSeed("cosmo7f3k")).toBe("COSMO-7F3K");
    expect(normalizeSeed("abc")).toBe("COSMO-ABC7");
  });

  it("same seed + mode produces the same roll", () => {
    const a = rollStory("COSMO-7F3K", "family", "everyone");
    const b = rollStory("cosmo-7f3k", "family", "everyone");
    expect(a).toEqual(b);
    expect(a.seed).toBe("COSMO-7F3K");
    for (const category of CATEGORIES) {
      expect(a.prompts[category].text.length).toBeGreaterThan(0);
    }
  });

  it("different seed changes the roll", () => {
    const a = rollStory("COSMO-7F3K", "family", "everyone");
    const b = rollStory("COSMO-9Q2M", "family", "everyone");
    const same = CATEGORIES.every(
      (category) => a.prompts[category].id === b.prompts[category].id,
    );
    expect(same).toBe(false);
  });

  it("kid-friendly uses only the appropriate deck subset", () => {
    for (const mode of MODES) {
      const roll = rollStory("COSMO-K1D5", mode, "kid-friendly");
      for (const category of CATEGORIES) {
        expect(roll.prompts[category].kidFriendly).toBe(true);
        expect(roll.prompts[category].modes.includes(mode)).toBe(true);
      }
    }
  });

  it("reroll changes only the selected die", () => {
    const base = rollStory("COSMO-7F3K", "fantasy", "everyone");
    const next = rerollCategory(base, "object");
    expect(next.prompts.object.id).not.toBe(base.prompts.object.id);
    expect(next.prompts.character.id).toBe(base.prompts.character.id);
    expect(next.prompts.place.id).toBe(base.prompts.place.id);
    expect(next.prompts.problem.id).toBe(base.prompts.problem.id);
    expect(next.prompts.twist.id).toBe(base.prompts.twist.id);
  });

  it("reroll is deterministic for the same seed and category", () => {
    const base = rollStory("COSMO-7F3K", "silly", "everyone");
    expect(rerollCategory(base, "place")).toEqual(rerollCategory(base, "place"));
  });

  it("title generation is deterministic", () => {
    const roll = rollStory("COSMO-7F3K", "family", "everyone");
    expect(generateTitle(roll.seed, roll.prompts)).toBe(roll.title);
    expect(roll.title.length).toBeGreaterThan(4);
  });

  it("easter seed COSMO-42 is special", () => {
    const roll = rollStory("cosmo-42", "silly", "everyone");
    expect(roll.seed).toBe(EASTER_SEED);
    expect(roll.title).toBe("Don't Panic and the Extra Towel");
    expect(roll.prompts.twist.text).toMatch(/towel/i);
  });

  it("generateSeed stays in the alphabet", () => {
    expect(generateSeed(() => 0.1)).toMatch(
      /^COSMO-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/,
    );
  });
});

describe("deck coverage", () => {
  it("has substantial decks", () => {
    expect(CHARACTERS.length).toBeGreaterThanOrEqual(40);
    expect(PLACES.length).toBeGreaterThanOrEqual(40);
    expect(OBJECTS.length).toBeGreaterThanOrEqual(40);
    expect(PROBLEMS.length).toBeGreaterThanOrEqual(40);
    expect(TWISTS.length).toBeGreaterThanOrEqual(40);
    expect(CHALLENGES.length).toBeGreaterThanOrEqual(30);
  });

  it("every mode and difficulty has enough prompts", () => {
    const decks = {
      character: CHARACTERS,
      place: PLACES,
      object: OBJECTS,
      problem: PROBLEMS,
      twist: TWISTS,
    };
    for (const mode of MODES) {
      const everyone = deckHealth(mode, "everyone");
      const kids = deckHealth(mode, "kid-friendly");
      for (const category of CATEGORIES) {
        expect(everyone[category]).toBeGreaterThanOrEqual(12);
        expect(kids[category]).toBeGreaterThanOrEqual(10);
        expect(
          filterPrompts(decks[category], mode, "kid-friendly").filter(
            (card) => !card.kidFriendly,
          ),
        ).toHaveLength(0);
      }
    }
  });
});

describe("game reducer", () => {
  it("rotates players and enforces the reroll limit", () => {
    let state = createInitialState();
    state = reduceGame(state, { type: "set-player-count", count: 3 });
    state = reduceGame(state, { type: "set-player-name", index: 0, name: "Ada" });
    state = reduceGame(state, { type: "roll", seed: "COSMO-7F3K" });
    expect(state.tableStatus).toBe("ready");
    expect(state.roll).toBeTruthy();

    const firstObject = state.roll!.prompts.object.id;
    state = reduceGame(state, { type: "reroll", category: "object" });
    expect(state.rerollsRemaining).toBe(MAX_REROLLS - 1);
    expect(state.roll?.prompts.object.id).not.toBe(firstObject);

    const after = state.roll?.prompts.object.id;
    state = reduceGame(state, { type: "reroll", category: "character" });
    expect(state.rerollsRemaining).toBe(0);
    expect(state.roll?.prompts.object.id).toBe(after);
    expect(state.rerolledCategory).toBe("object");

    state = reduceGame(state, { type: "start-turn" });
    expect(state.tableStatus).toBe("turn");
    state = reduceGame(state, { type: "next-player" });
    expect(state.currentPlayerIndex).toBe(1);
    expect(state.turnsTaken[0]).toBe(1);
    expect(playerLabel(state.playerNames, 0)).toBe("Ada");
    expect(playerLabel(state.playerNames, 1)).toBe("Player 2");
  });

  it("cannot finish until everyone has had a turn", () => {
    let state = createInitialState();
    state = reduceGame(state, { type: "roll", seed: "COSMO-7F3K" });
    state = reduceGame(state, { type: "start-turn" });
    state = reduceGame(state, { type: "next-player" });
    state = reduceGame(state, { type: "finish" });
    expect(state.phase).toBe("table");
    state = reduceGame(state, { type: "start-turn" });
    state = reduceGame(state, { type: "next-player" });
    state = reduceGame(state, { type: "finish" });
    expect(state.phase).toBe("celebration");
    expect(state.storiesCompleted).toBe(1);
    expect(state.lastFinished?.seed).toBe("COSMO-7F3K");
  });

  it("timer ticks only during an active turn", () => {
    let state = createInitialState();
    state = reduceGame(state, { type: "set-timer", seconds: 60 });
    state = reduceGame(state, { type: "roll", seed: "COSMO-7F3K" });
    state = reduceGame(state, { type: "tick" });
    expect(state.timerRemaining).toBe(60);
    state = reduceGame(state, { type: "start-turn" });
    state = reduceGame(state, { type: "tick" });
    expect(state.timerRemaining).toBe(59);
  });

  it("replay seed restores the same roll", () => {
    let state = createInitialState();
    state = reduceGame(state, {
      type: "replay-seed",
      seed: "COSMO-7F3K",
      mode: "fantasy",
      difficulty: "kid-friendly",
    });
    expect(state.roll).toEqual(rollStory("COSMO-7F3K", "fantasy", "kid-friendly"));
    expect(state.phase).toBe("table");
  });

  it("player helpers and challenges", () => {
    expect(clampPlayerCount(0)).toBe(2);
    expect(clampPlayerCount(9)).toBe(5);
    expect(everyoneHasGone([1, 1], 2)).toBe(true);
    expect(everyoneHasGone([1, 0], 2)).toBe(false);
    expect(pickChallenge("COSMO-7F3K", "family", "everyone", 0)).toEqual(
      pickChallenge("COSMO-7F3K", "family", "everyone", 0),
    );
  });
});
