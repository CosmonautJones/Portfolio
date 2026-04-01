import type {
  Weather,
  WeatherType,
  GameState,
  GameConfig,
  GameCallbacks,
} from "./types";
import {
  WEATHER_SCORE_THRESHOLDS,
  WEATHER_TRANSITION_DURATION,
  RAIN_SLIDE_DISTANCE,
  WIND_DRIFT_PER_SECOND,
} from "./constants";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

// ---------------------------------------------------------------------------
// Create initial weather state
// ---------------------------------------------------------------------------

export function createWeather(): Weather {
  return {
    type: "clear",
    intensity: 0,
    windDirection: 1,
  };
}

// ---------------------------------------------------------------------------
// Determine target weather from score
// ---------------------------------------------------------------------------

function getTargetWeather(score: number): WeatherType {
  for (const threshold of WEATHER_SCORE_THRESHOLDS) {
    if (score >= threshold.minScore) {
      return threshold.type;
    }
  }
  return "clear";
}

// ---------------------------------------------------------------------------
// Update weather — transition smoothly between states
// ---------------------------------------------------------------------------

export function updateWeather(
  state: GameState,
  config: GameConfig,
  callbacks: GameCallbacks,
): void {
  const targetType = getTargetWeather(state.score);
  const dt = config.fixedTimestep;
  const transitionSpeed = dt / WEATHER_TRANSITION_DURATION;

  if (targetType !== state.weather.type) {
    // Fade out current weather
    state.weather.intensity -= transitionSpeed;

    if (state.weather.intensity <= 0) {
      // Switch to new weather type
      const oldType = state.weather.type;
      state.weather.type = targetType;
      state.weather.intensity = 0;

      // Randomize wind direction on weather change
      if (targetType === "wind") {
        state.weather.windDirection = Math.random() < 0.5 ? -1 : 1;
      }

      if (oldType !== targetType) {
        callbacks.onWeatherChange?.(state.weather);
      }
    }
  } else {
    // Fade in / maintain target intensity
    if (state.weather.type === "clear") {
      state.weather.intensity = 0;
    } else {
      state.weather.intensity = clamp(
        state.weather.intensity + transitionSpeed,
        0,
        1,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Apply rain slide — called after hop landing
// ---------------------------------------------------------------------------

export function applyRainSlide(
  state: GameState,
  config: GameConfig,
): void {
  if (state.weather.type !== "rain" || state.weather.intensity < 0.3) return;
  if (state.rainSlideApplied) return;

  const { player } = state;
  const { cellSize, gridColumns } = config;

  // Slide in the direction the player was moving, or random if vertical
  const slideDir =
    player.facing === "left"
      ? -1
      : player.facing === "right"
        ? 1
        : Math.random() < 0.5
          ? -1
          : 1;

  const slideAmount =
    RAIN_SLIDE_DISTANCE * cellSize * state.weather.intensity * slideDir;
  player.worldPos.x += slideAmount;
  player.worldPos.x = clamp(player.worldPos.x, 0, (gridColumns - 1) * cellSize);
  player.gridPos.x = Math.round(player.worldPos.x / cellSize);

  state.rainSlideApplied = true;
}

// ---------------------------------------------------------------------------
// Apply wind drift — called each tick
// ---------------------------------------------------------------------------

export function applyWindDrift(
  state: GameState,
  config: GameConfig,
): void {
  if (state.weather.type !== "wind" || state.weather.intensity < 0.3) return;

  const { player } = state;
  const { cellSize, gridColumns, fixedTimestep } = config;

  // Don't drift during hop animation
  if (player.hopTarget !== null) return;

  const driftAmount =
    WIND_DRIFT_PER_SECOND *
    cellSize *
    state.weather.intensity *
    state.weather.windDirection *
    fixedTimestep;

  state.windDriftAccumulator += driftAmount;

  // Apply drift when it exceeds a threshold (smoother visual)
  if (Math.abs(state.windDriftAccumulator) >= 0.5) {
    player.worldPos.x += state.windDriftAccumulator;
    player.worldPos.x = clamp(
      player.worldPos.x,
      0,
      (gridColumns - 1) * cellSize,
    );
    player.gridPos.x = Math.round(player.worldPos.x / cellSize);
    state.windDriftAccumulator = 0;
  }
}
