"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import {
  Archive,
  ArrowLeft,
  BookOpen,
  Copy,
  Dices,
  Heart,
  Map,
  Orbit,
  Package,
  RotateCcw,
  Sparkles,
  UserRound,
  Volume2,
  VolumeX,
  Wand2,
  CloudLightning,
} from "lucide-react";
import "./story-forge.css";
import {
  activePlayerNames,
  createInitialState,
  everyoneHasGone,
  generateSeed,
  isLegendaryRoll,
  playerLabel,
  reduceGame,
  rollStory,
  turnPromptFor,
} from "./story-engine";
import {
  isFavorited,
  loadPrefs,
  removeFavorite,
  resetStoryForgeStorage,
  savePrefs,
  upsertFavorite,
} from "./story-storage";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  DEFAULT_PREFS,
  DIFFICULTIES,
  MAX_PLAYERS,
  MIN_PLAYERS,
  MODE_BLURBS,
  MODE_LABELS,
  MODES,
  TIMER_PRESETS,
  type Category,
  type Difficulty,
  type FavoriteRoll,
  type GameState,
  type Mode,
  type StoryPrefs,
  type TimerPreset,
} from "./story-types";

const CATEGORY_ICONS = {
  character: UserRound,
  place: Map,
  object: Package,
  problem: CloudLightning,
  twist: Orbit,
} as const;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

function playTone(muted: boolean, freq = 440) {
  if (muted) return;
  try {
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.04;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    osc.stop(ctx.currentTime + 0.2);
    window.setTimeout(() => void ctx.close(), 260);
  } catch {
    // Audio is optional.
  }
}

function vibrate(ms: number) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // Haptics never required.
  }
}

function persistFromState(state: GameState, prefs: StoryPrefs): StoryPrefs {
  return {
    ...prefs,
    preferredMode: state.mode,
    preferredDifficulty: state.difficulty,
    preferredTimer: state.timerPreset,
    muted: state.muted,
    playerNames: state.playerNames,
    playerCount: state.playerCount,
    storiesCompleted: state.storiesCompleted,
  };
}

function DiceBoard({
  state,
  rolling,
  pickReroll,
  onPick,
}: {
  state: GameState;
  rolling: boolean;
  pickReroll: boolean;
  onPick: (category: Category) => void;
}) {
  return (
    <div className="sf-dice-grid" aria-live="polite">
      {CATEGORIES.map((category, index) => {
        const Icon = CATEGORY_ICONS[category];
        const prompt = state.roll?.prompts[category];
        const clickable = pickReroll && !!prompt;
        return (
          <button
            key={category}
            type="button"
            className={`sf-die${rolling ? " is-rolling" : ""}${prompt ? " is-reveal" : ""}${prompt?.legendary ? " is-legendary" : ""}`}
            data-shape={category}
            style={{ animationDelay: rolling ? `${index * 70}ms` : "0ms" }}
            disabled={!clickable}
            onClick={() => onPick(category)}
            aria-label={`${CATEGORY_LABELS[category]}${prompt ? `: ${prompt.text}` : " not rolled yet"}${clickable ? ". Tap to reroll." : ""}`}
          >
            <span className="sf-die-spark" aria-hidden="true" />
            <span className="sf-die-label">
              <Icon size={14} strokeWidth={2.4} aria-hidden="true" />
              {CATEGORY_LABELS[category]}
            </span>
            <p className="sf-die-text">{prompt ? prompt.text : "••••"}</p>
          </button>
        );
      })}
    </div>
  );
}

export function StoryForge() {
  const [state, dispatch] = useReducer(reduceGame, undefined, createInitialState);
  const [prefs, setPrefs] = useState<StoryPrefs>({
    ...DEFAULT_PREFS,
    playerNames: [...DEFAULT_PREFS.playerNames],
  });
  const [hydrated, setHydrated] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [pickReroll, setPickReroll] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resetNote, setResetNote] = useState("");
  const reduced = usePrefersReducedMotion();
  const persistSkip = useRef(true);

  useEffect(() => {
    const loaded = loadPrefs(typeof window === "undefined" ? null : window.localStorage);
    setPrefs(loaded);
    dispatch({ type: "hydrate", prefs: loaded });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (persistSkip.current) {
      persistSkip.current = false;
      return;
    }
    setPrefs((current) => {
      const next = persistFromState(state, current);
      savePrefs(next, window.localStorage);
      return next;
    });
    // Persist selected preference fields only; full `state` would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hydrated,
    state.mode,
    state.difficulty,
    state.timerPreset,
    state.muted,
    state.playerNames,
    state.playerCount,
    state.storiesCompleted,
  ]);

  useEffect(() => {
    if (state.tableStatus !== "turn" || state.timerPreset === 0) return;
    const id = window.setInterval(() => dispatch({ type: "tick" }), 1000);
    return () => window.clearInterval(id);
  }, [state.tableStatus, state.timerPreset]);

  useEffect(() => {
    if (state.timerExpired && state.tableStatus === "turn") {
      playTone(state.muted, 330);
    }
  }, [state.timerExpired, state.tableStatus, state.muted]);

  const currentName = playerLabel(state.playerNames, state.currentPlayerIndex);
  const canFinish = everyoneHasGone(state.turnsTaken, state.playerCount);
  const legendary = state.roll ? isLegendaryRoll(state.roll) : false;
  const favorited = state.roll
    ? isFavorited(prefs, state.roll.seed, state.roll.mode, state.roll.difficulty)
    : false;

  function doRoll(seed = generateSeed()) {
    setPickReroll(false);
    setCopied(false);
    if (reduced) {
      dispatch({ type: "roll", seed });
      playTone(state.muted, 520);
      return;
    }
    setRolling(true);
    vibrate(18);
    playTone(state.muted, 480);
    window.setTimeout(() => {
      dispatch({ type: "roll", seed });
      setRolling(false);
      playTone(state.muted, 640);
    }, 620);
  }

  function favoriteCurrent() {
    const roll = state.roll ?? state.lastFinished;
    if (!roll) return;
    const prompts =
      "prompts" in roll && typeof roll.prompts.character === "object"
        ? {
            character: state.roll!.prompts.character.text,
            place: state.roll!.prompts.place.text,
            object: state.roll!.prompts.object.text,
            problem: state.roll!.prompts.problem.text,
            twist: state.roll!.prompts.twist.text,
          }
        : (state.lastFinished?.prompts as FavoriteRoll["prompts"]);
    if (!prompts) return;
    const next = upsertFavorite(prefs, {
      seed: "seed" in roll ? roll.seed : state.lastFinished!.seed,
      mode: "mode" in roll ? (roll.mode as Mode) : state.mode,
      difficulty: "difficulty" in roll ? (roll.difficulty as Difficulty) : state.difficulty,
      title: "title" in roll ? roll.title : state.lastFinished!.title,
      prompts,
      savedAt: Date.now(),
    });
    setPrefs(next);
    savePrefs(next, window.localStorage);
  }

  async function copySeed(seed: string) {
    try {
      await navigator.clipboard.writeText(seed);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="story-forge">
      <div className="sf-sky" aria-hidden="true">
        <div className="sf-stars" />
        <div className="sf-stars-2" />
        <div className="sf-veil" />
        {legendary && !reduced ? <div className="sf-shooting" /> : null}
      </div>
      <div className="sf-shell">
        <header className="flex items-center justify-between gap-3">
          <p className="sf-kicker">Cosmonaut Story Forge</p>
          <button
            type="button"
            className="sf-btn sf-btn-ghost"
            style={{ minHeight: 44, padding: "8px 12px" }}
            onClick={() => dispatch({ type: "toggle-mute" })}
            aria-label={state.muted ? "Unmute optional sounds" : "Mute sounds"}
          >
            {state.muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </header>

        {state.phase === "landing" && (
          <Landing
            state={state}
            hydrated={hydrated}
            stories={prefs.storiesCompleted}
            favorites={prefs.favorites.length}
            onMode={(mode) => dispatch({ type: "set-mode", mode })}
            onDifficulty={(difficulty) => dispatch({ type: "set-difficulty", difficulty })}
            onTimer={(seconds) => dispatch({ type: "set-timer", seconds })}
            onStart={() => dispatch({ type: "open-setup" })}
            onHowTo={() => dispatch({ type: "open-howto" })}
            onVault={() => dispatch({ type: "open-vault" })}
          />
        )}

        {state.phase === "howto" && (
          <HowTo onBack={() => dispatch({ type: "back-to-landing" })} />
        )}

        {state.phase === "setup" && (
          <Setup
            state={state}
            onBack={() => dispatch({ type: "back-to-landing" })}
            onCount={(count) => dispatch({ type: "set-player-count", count })}
            onName={(index, name) => dispatch({ type: "set-player-name", index, name })}
            onSeed={(seed) => dispatch({ type: "set-seed-draft", seed })}
            onBegin={() => {
              dispatch({ type: "begin-table" });
              doRoll(state.seedDraft.trim() ? state.seedDraft : generateSeed());
            }}
          />
        )}

        {state.phase === "table" && (
          <TableScreen
            state={state}
            rolling={rolling}
            pickReroll={pickReroll}
            currentName={currentName}
            canFinish={canFinish}
            favorited={favorited}
            onPick={(category) => {
              if (!pickReroll) return;
              setPickReroll(false);
              dispatch({ type: "reroll", category });
              playTone(state.muted, 560);
            }}
            onStartTurn={() => {
              dispatch({ type: "start-turn" });
              playTone(state.muted, 390);
            }}
            onNext={() => dispatch({ type: "next-player" })}
            onRerollMode={() => setPickReroll((value) => !value)}
            onNewStory={() => {
              dispatch({ type: "new-story" });
              doRoll();
            }}
            onFavorite={favoriteCurrent}
            onFinish={() => dispatch({ type: "finish" })}
            onCopy={() => state.roll && void copySeed(state.roll.seed)}
            copied={copied}
          />
        )}

        {state.phase === "celebration" && state.lastFinished && (
          <Celebration
            state={state}
            favorited={isFavorited(
              prefs,
              state.lastFinished.seed,
              state.lastFinished.mode,
              state.lastFinished.difficulty,
            )}
            copied={copied}
            onCopy={() => void copySeed(state.lastFinished!.seed)}
            onFavorite={favoriteCurrent}
            onReplay={() =>
              dispatch({
                type: "replay-seed",
                seed: state.lastFinished!.seed,
                mode: state.lastFinished!.mode,
                difficulty: state.lastFinished!.difficulty,
              })
            }
            onAgain={() => dispatch({ type: "play-again" })}
            onHome={() => dispatch({ type: "back-to-landing" })}
          />
        )}

        {state.phase === "vault" && (
          <Vault
            prefs={prefs}
            resetNote={resetNote}
            onBack={() => dispatch({ type: "back-to-landing" })}
            onReplay={(item) =>
              dispatch({
                type: "replay-seed",
                seed: item.seed,
                mode: item.mode,
                difficulty: item.difficulty,
              })
            }
            onRemove={(item) => {
              const next = removeFavorite(prefs, item.seed, item.mode, item.difficulty);
              setPrefs(next);
              savePrefs(next, window.localStorage);
            }}
            onReset={() => {
              resetStoryForgeStorage(window.localStorage);
              const fresh = {
                ...DEFAULT_PREFS,
                playerNames: [...DEFAULT_PREFS.playerNames],
              };
              setPrefs(fresh);
              dispatch({ type: "hydrate", prefs: fresh });
              dispatch({ type: "back-to-landing" });
              setResetNote("Story Forge data cleared on this device.");
            }}
          />
        )}
      </div>
    </div>
  );
}

function Landing({
  state,
  hydrated,
  stories,
  favorites,
  onMode,
  onDifficulty,
  onTimer,
  onStart,
  onHowTo,
  onVault,
}: {
  state: GameState;
  hydrated: boolean;
  stories: number;
  favorites: number;
  onMode: (mode: Mode) => void;
  onDifficulty: (difficulty: Difficulty) => void;
  onTimer: (seconds: TimerPreset) => void;
  onStart: () => void;
  onHowTo: () => void;
  onVault: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col gap-6 pt-8">
      <div>
        <h1 className="sf-title">Cosmonaut Story Forge</h1>
        <p className="sf-lede">
          Pass the phone. Roll five story dice. Make something wonderfully untrue together.
        </p>
      </div>
      <section className="sf-panel" aria-labelledby="mode-label">
        <h2 id="mode-label" className="m-0 text-sm font-bold tracking-wide text-[var(--sf-muted)]">
          Mode
        </h2>
        <div className="sf-chip-row mt-3">
          {MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              className="sf-chip"
              aria-pressed={state.mode === mode}
              onClick={() => onMode(mode)}
            >
              {MODE_LABELS[mode]}
            </button>
          ))}
        </div>
        <p className="mt-3 mb-0 text-sm text-[var(--sf-subtle)]">{MODE_BLURBS[state.mode]}</p>
      </section>
      <div className="grid gap-3 sm:grid-cols-2">
        <section className="sf-panel">
          <h2 className="m-0 text-sm font-bold tracking-wide text-[var(--sf-muted)]">Vocabulary</h2>
          <div className="sf-chip-row mt-3">
            {DIFFICULTIES.map((difficulty) => (
              <button
                key={difficulty}
                type="button"
                className="sf-chip"
                aria-pressed={state.difficulty === difficulty}
                onClick={() => onDifficulty(difficulty)}
              >
                {difficulty === "everyone" ? "Everyone" : "Kid Friendly"}
              </button>
            ))}
          </div>
        </section>
        <section className="sf-panel">
          <h2 className="m-0 text-sm font-bold tracking-wide text-[var(--sf-muted)]">Timer</h2>
          <div className="sf-chip-row mt-3">
            {TIMER_PRESETS.map((seconds) => (
              <button
                key={seconds}
                type="button"
                className="sf-chip"
                aria-pressed={state.timerPreset === seconds}
                onClick={() => onTimer(seconds)}
              >
                {seconds === 0 ? "Off" : `${seconds}s`}
              </button>
            ))}
          </div>
        </section>
      </div>
      <div className="sf-actions mt-2">
        <button type="button" className="sf-btn sf-btn-primary" onClick={onStart}>
          <Dices size={18} aria-hidden="true" />
          Start a Story
        </button>
        <button type="button" className="sf-btn sf-btn-ghost" onClick={onHowTo}>
          <BookOpen size={18} aria-hidden="true" />
          How to Play
        </button>
        <button type="button" className="sf-btn sf-btn-ghost" onClick={onVault}>
          <Archive size={18} aria-hidden="true" />
          Story Vault
        </button>
      </div>
      <p className="mt-auto text-sm text-[var(--sf-subtle)]">
        {hydrated
          ? `${stories} stor${stories === 1 ? "y" : "ies"} completed · ${favorites} saved`
          : "Local-only. No accounts. Works offline after load."}
      </p>
    </main>
  );
}

function HowTo({ onBack }: { onBack: () => void }) {
  return (
    <main className="flex flex-1 flex-col gap-5 pt-6">
      <button type="button" className="sf-btn sf-btn-ghost self-start" onClick={onBack}>
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="sf-title" style={{ fontSize: "2rem" }}>How to play</h1>
      <ol className="m-0 flex list-decimal flex-col gap-3 pl-5 text-[1.02rem] leading-relaxed text-[var(--sf-muted)]">
        <li>Pick a mode. Family is the default; Cozy Spooky stays playful.</li>
        <li>Add 2 to 5 players. Names are optional.</li>
        <li>Roll five story dice: character, place, object, problem, and a wild twist.</li>
        <li>Pass the phone. Each person continues the story out loud.</li>
        <li>You may reroll one die per story. After everyone has a turn, finish and celebrate.</li>
      </ol>
      <p className="sf-lede">No typing required. The story lives in the room.</p>
    </main>
  );
}

function Setup({
  state,
  onBack,
  onCount,
  onName,
  onSeed,
  onBegin,
}: {
  state: GameState;
  onBack: () => void;
  onCount: (count: number) => void;
  onName: (index: number, name: string) => void;
  onSeed: (seed: string) => void;
  onBegin: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col gap-5 pt-6">
      <button type="button" className="sf-btn sf-btn-ghost self-start" onClick={onBack}>
        <ArrowLeft size={16} /> Back
      </button>
      <div>
        <h1 className="sf-title" style={{ fontSize: "2.2rem" }}>Who is telling?</h1>
        <p className="sf-lede">Names are optional. Player 1, Player 2, and friends work just fine.</p>
      </div>
      <div className="sf-meter" role="group" aria-label="Number of players">
        {Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => MIN_PLAYERS + i).map((count) => (
          <button
            key={count}
            type="button"
            className="sf-chip"
            aria-pressed={state.playerCount === count}
            onClick={() => onCount(count)}
          >
            {count}
          </button>
        ))}
      </div>
      <div className="grid gap-3">
        {Array.from({ length: state.playerCount }, (_, index) => (
          <label key={index} className="grid gap-1 text-sm text-[var(--sf-muted)]">
            Player {index + 1}
            <input
              className="sf-field"
              value={state.playerNames[index] ?? ""}
              placeholder={`Player ${index + 1}`}
              maxLength={24}
              onChange={(event) => onName(index, event.target.value)}
            />
          </label>
        ))}
      </div>
      <label className="grid gap-1 text-sm text-[var(--sf-muted)]">
        Replay seed (optional)
        <input
          className="sf-field"
          value={state.seedDraft}
          placeholder="COSMO-7F3K"
          autoCapitalize="characters"
          onChange={(event) => onSeed(event.target.value)}
        />
      </label>
      <button type="button" className="sf-btn sf-btn-primary" onClick={onBegin}>
        <Wand2 size={18} /> Roll the dice
      </button>
    </main>
  );
}

function TableScreen({
  state,
  rolling,
  pickReroll,
  currentName,
  canFinish,
  favorited,
  copied,
  onPick,
  onStartTurn,
  onNext,
  onRerollMode,
  onNewStory,
  onFavorite,
  onFinish,
  onCopy,
}: {
  state: GameState;
  rolling: boolean;
  pickReroll: boolean;
  currentName: string;
  canFinish: boolean;
  favorited: boolean;
  copied: boolean;
  onPick: (category: Category) => void;
  onStartTurn: () => void;
  onNext: () => void;
  onRerollMode: () => void;
  onNewStory: () => void;
  onFavorite: () => void;
  onFinish: () => void;
  onCopy: () => void;
}) {
  const names = activePlayerNames(state.playerNames, state.playerCount);
  return (
    <main className="flex flex-1 flex-col gap-4 pt-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="sf-kicker">{state.roll?.seed ?? "Shuffling"}</p>
          <h1 className="mt-1 line-clamp-3 font-[family-name:var(--sf-font-display)] text-xl tracking-tight text-[var(--sf-star)] sm:text-2xl">
            {state.roll?.title ?? "The dice are listening"}
          </h1>
        </div>
        {state.timerPreset > 0 && (
          <p className={`sf-timer${state.timerExpired ? " is-done" : ""}`} aria-live="polite">
            {state.timerRemaining === null
              ? `${Math.floor(state.timerPreset / 60)}:${String(state.timerPreset % 60).padStart(2, "0")}`
              : `${Math.floor(state.timerRemaining / 60)}:${String(state.timerRemaining % 60).padStart(2, "0")}`}
          </p>
        )}
      </div>
      <div className="sf-constellation" aria-label="Player turns">
        {names.map((name, index) => (
          <span
            key={name + index}
            className={`sf-star-slot${state.turnsTaken[index] > 0 ? " is-lit" : ""}`}
            title={name}
          />
        ))}
      </div>
      <DiceBoard state={state} rolling={rolling} pickReroll={pickReroll} onPick={onPick} />
      <section className="sf-panel">
        <p className="m-0 text-sm uppercase tracking-[0.16em] text-[var(--sf-subtle)]">Begin the story</p>
        <p className="mt-2 mb-0 text-xl font-semibold">{currentName}</p>
        <p className="mt-1 mb-0 text-[var(--sf-muted)]">{turnPromptFor(state.totalTurns)}</p>
        {state.challenge && state.tableStatus === "turn" && (
          <p className="mt-3 mb-0 rounded-[14px] border border-[var(--sf-border)] px-3 py-2 text-sm">
            Challenge: {state.challenge.text}
          </p>
        )}
        {pickReroll && (
          <p className="mt-3 mb-0 text-sm text-[var(--sf-accent)]">Tap one die to reroll it.</p>
        )}
        {state.timerExpired && state.tableStatus === "turn" && (
          <p className="mt-3 mb-0 text-sm text-[var(--sf-accent)]">Time is up — finish the thought whenever you like.</p>
        )}
      </section>
      <div className="sf-sticky sf-actions">
        {state.tableStatus !== "turn" ? (
          <button type="button" className="sf-btn sf-btn-primary" onClick={onStartTurn} disabled={!state.roll || rolling}>
            Start Turn
          </button>
        ) : (
          <button type="button" className="sf-btn sf-btn-primary" onClick={onNext}>
            Next Player
          </button>
        )}
        <button
          type="button"
          className="sf-btn sf-btn-ghost"
          onClick={onRerollMode}
          disabled={!state.roll || state.rerollsRemaining <= 0 || rolling}
        >
          <RotateCcw size={16} />
          {state.rerollsRemaining > 0 ? "Reroll one die" : "Reroll used"}
        </button>
        <button type="button" className="sf-btn sf-btn-ghost" onClick={onNewStory}>
          New Story
        </button>
        <button type="button" className="sf-btn sf-btn-ghost" onClick={onFavorite} disabled={!state.roll || favorited}>
          <Heart size={16} />
          {favorited ? "Saved" : "Favorite"}
        </button>
        <button type="button" className="sf-btn sf-btn-ghost" onClick={onCopy} disabled={!state.roll}>
          <Copy size={16} />
          {copied ? "Copied" : "Copy seed"}
        </button>
        {canFinish && (
          <button type="button" className="sf-btn sf-btn-accent" onClick={onFinish}>
            <Sparkles size={16} />
            Finish the Story
          </button>
        )}
      </div>
    </main>
  );
}

function Celebration({
  state,
  favorited,
  copied,
  onCopy,
  onFavorite,
  onReplay,
  onAgain,
  onHome,
}: {
  state: GameState;
  favorited: boolean;
  copied: boolean;
  onCopy: () => void;
  onFavorite: () => void;
  onReplay: () => void;
  onAgain: () => void;
  onHome: () => void;
}) {
  const story = state.lastFinished!;
  return (
    <main className="flex flex-1 flex-col gap-5 pt-6">
      <p className="sf-kicker">Story complete</p>
      <h1 className="sf-title">{story.title}</h1>
      <p className="sf-lede">
        {story.playerOrder.join(" → ")} · {story.totalTurns} turn{story.totalTurns === 1 ? "" : "s"} · {story.seed}
      </p>
      <ul className="m-0 grid list-none gap-2 p-0">
        {CATEGORIES.map((category) => (
          <li key={category} className="sf-panel">
            <p className="m-0 text-xs uppercase tracking-[0.16em] text-[var(--sf-subtle)]">
              {CATEGORY_LABELS[category]}
            </p>
            <p className="mt-1 mb-0 font-[family-name:var(--sf-font-display)] text-lg">{story.prompts[category]}</p>
          </li>
        ))}
      </ul>
      <div className="sf-actions">
        <button type="button" className="sf-btn sf-btn-primary" onClick={onAgain}>
          Play Again
        </button>
        <button type="button" className="sf-btn sf-btn-ghost" onClick={onReplay}>
          Replay this seed
        </button>
        <button type="button" className="sf-btn sf-btn-ghost" onClick={onFavorite} disabled={favorited}>
          <Heart size={16} /> {favorited ? "Saved" : "Favorite"}
        </button>
        <button type="button" className="sf-btn sf-btn-ghost" onClick={onCopy}>
          <Copy size={16} /> {copied ? "Copied" : "Copy seed"}
        </button>
        <button type="button" className="sf-btn sf-btn-ghost" onClick={onHome}>
          Home
        </button>
      </div>
    </main>
  );
}

function Vault({
  prefs,
  resetNote,
  onBack,
  onReplay,
  onRemove,
  onReset,
}: {
  prefs: StoryPrefs;
  resetNote: string;
  onBack: () => void;
  onReplay: (item: FavoriteRoll) => void;
  onRemove: (item: FavoriteRoll) => void;
  onReset: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col gap-5 pt-6">
      <button type="button" className="sf-btn sf-btn-ghost self-start" onClick={onBack}>
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="sf-title" style={{ fontSize: "2.1rem" }}>Story Vault</h1>
      <p className="sf-lede">Favorite rolls live on this device only.</p>
      {prefs.favorites.length === 0 ? (
        <p className="sf-panel m-0 text-[var(--sf-muted)]">Nothing saved yet. Favorite a roll after the dice land.</p>
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0">
          {prefs.favorites.map((item) => (
            <li key={`${item.seed}-${item.mode}-${item.difficulty}`} className="sf-panel">
              <p className="m-0 font-[family-name:var(--sf-font-display)] text-lg">{item.title}</p>
              <p className="mt-1 mb-3 text-sm text-[var(--sf-subtle)]">
                {item.seed} · {MODE_LABELS[item.mode]}
              </p>
              <div className="sf-actions">
                <button type="button" className="sf-btn sf-btn-primary" onClick={() => onReplay(item)}>
                  Replay
                </button>
                <button type="button" className="sf-btn sf-btn-ghost" onClick={() => onRemove(item)}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="sf-btn sf-btn-ghost self-start" onClick={onReset}>
        Reset Story Forge data
      </button>
      {resetNote ? <p className="m-0 text-sm text-[var(--sf-accent)]">{resetNote}</p> : null}
    </main>
  );
}

export function previewRoll(seed: string, mode: Mode, difficulty: Difficulty) {
  return rollStory(seed, mode, difficulty);
}
