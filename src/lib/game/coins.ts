import type {
  Coin,
  CoinType,
  GameState,
  GameConfig,
  GameCallbacks,
  Lane,
  Obstacle,
} from "./types";
import {
  COIN_VALUES,
  COIN_RARITY,
  COIN_SPAWN_CHANCE,
  COIN_TRAIL_CHANCE,
  COIN_TRAIL_LENGTH,
  COIN_COLLECT_RADIUS,
} from "./constants";
import { COIN_PARTICLE_COLORS } from "./sprites/coins";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pickCoinType(): CoinType {
  const total = COIN_RARITY.reduce((s, r) => s + r.weight, 0);
  let roll = Math.random() * total;
  for (const entry of COIN_RARITY) {
    roll -= entry.weight;
    if (roll <= 0) return entry.type;
  }
  return "gold";
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---------------------------------------------------------------------------
// Coin spawning
// ---------------------------------------------------------------------------

export function spawnCoinsForLane(
  lane: Lane,
  config: GameConfig,
  nextId: { value: number },
): Coin[] {
  const { cellSize, gridColumns } = config;
  const spawnChance = COIN_SPAWN_CHANCE[lane.type];
  if (spawnChance === 0 || Math.random() > spawnChance) return [];

  const newCoins: Coin[] = [];

  if (lane.type === "grass") {
    // Trail or single coin
    if (Math.random() < COIN_TRAIL_CHANCE) {
      // Gold coin trail
      const trailLen =
        COIN_TRAIL_LENGTH.min +
        Math.floor(
          Math.random() * (COIN_TRAIL_LENGTH.max - COIN_TRAIL_LENGTH.min + 1),
        );
      const startX = 1 + Math.floor(Math.random() * (gridColumns - trailLen - 1));
      for (let i = 0; i < trailLen; i++) {
        const gridX = startX + i;
        newCoins.push({
          id: nextId.value++,
          type: "gold",
          gridX,
          laneY: lane.y,
          worldX: gridX * cellSize,
          collected: false,
          logId: null,
        });
      }
    } else {
      // Single coin
      const gridX = 1 + Math.floor(Math.random() * (gridColumns - 2));
      newCoins.push({
        id: nextId.value++,
        type: pickCoinType(),
        gridX,
        laneY: lane.y,
        worldX: gridX * cellSize,
        collected: false,
        logId: null,
      });
    }
  } else if (lane.type === "road") {
    // 1-2 coins placed in gaps between obstacles
    const occupiedRanges = lane.obstacles.map((obs) => ({
      left: obs.worldX / cellSize - 1,
      right: obs.worldX / cellSize + obs.widthCells + 1,
    }));

    const count = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      // Try a few random positions
      for (let attempt = 0; attempt < 5; attempt++) {
        const gridX = 1 + Math.floor(Math.random() * (gridColumns - 2));
        const inObstacle = occupiedRanges.some(
          (r) => gridX >= r.left && gridX <= r.right,
        );
        if (!inObstacle) {
          newCoins.push({
            id: nextId.value++,
            type: pickCoinType(),
            gridX,
            laneY: lane.y,
            worldX: gridX * cellSize,
            collected: false,
            logId: null,
          });
          break;
        }
      }
    }
  } else if (lane.type === "water") {
    // Coin on middle cell of random logs (50% per log)
    const logs = lane.obstacles.filter((o) => o.type === "log");
    for (const log of logs) {
      if (Math.random() < 0.5) {
        const midCell = Math.floor(log.widthCells / 2);
        const gridX = Math.round(log.worldX / cellSize) + midCell;
        newCoins.push({
          id: nextId.value++,
          type: pickCoinType(),
          gridX,
          laneY: lane.y,
          worldX: log.worldX + midCell * cellSize,
          collected: false,
          logId: log.id,
        });
      }
    }
  }

  return newCoins;
}

// ---------------------------------------------------------------------------
// Coin update — move coins on logs
// ---------------------------------------------------------------------------

export function updateCoins(state: GameState, config: GameConfig): void {
  const { cellSize, fixedTimestep } = config;

  for (const coin of state.coins) {
    if (coin.collected) continue;
    if (coin.logId === null) continue;

    // Find the log this coin is riding
    const lane = state.lanes.find((l) => l.y === coin.laneY);
    if (!lane) continue;

    const log = lane.obstacles.find(
      (o: Obstacle) => o.id === coin.logId,
    );
    if (!log) {
      // Log disappeared — remove the coin
      coin.collected = true;
      continue;
    }

    // Move coin with the log
    coin.worldX += log.speed * fixedTimestep;
    coin.gridX = Math.round(coin.worldX / cellSize);
  }
}

// ---------------------------------------------------------------------------
// Coin collection
// ---------------------------------------------------------------------------

export function checkCoinCollection(
  state: GameState,
  config: GameConfig,
  callbacks: GameCallbacks,
): void {
  if (!state.player.alive || state.phase !== "playing") return;

  const { player } = state;
  const { cellSize } = config;
  const radius = cellSize * COIN_COLLECT_RADIUS;

  const playerCenterX = player.worldPos.x + cellSize / 2;
  const playerCenterY = player.worldPos.y + cellSize / 2;

  for (const coin of state.coins) {
    if (coin.collected) continue;

    const coinCenterX = coin.worldX + 8; // 16x16 sprite centered in cell
    const coinCenterY = coin.laneY * cellSize + 8;

    const dx = playerCenterX - coinCenterX;
    const dy = playerCenterY - coinCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < radius) {
      coin.collected = true;
      const bonus = COIN_VALUES[coin.type];
      state.coinsCollected++;
      state.coinBonusScore += bonus;

      // Spawn collection particles
      spawnCoinCollectParticles(state, coin, config);

      // Fire callback
      callbacks.onCoinCollect(coin, bonus);
    }
  }
}

// ---------------------------------------------------------------------------
// Coin collection particles
// ---------------------------------------------------------------------------

function spawnCoinCollectParticles(
  state: GameState,
  coin: Coin,
  config: GameConfig,
): void {
  const { cellSize } = config;
  const cx = coin.worldX + 8;
  const cy = coin.laneY * cellSize + 8;
  const colors = COIN_PARTICLE_COLORS[coin.type] ?? COIN_PARTICLE_COLORS.gold;

  const count = 6 + Math.floor(Math.random() * 7); // 6-12
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const speed = 25 + Math.random() * 35;
    state.particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.25 + Math.random() * 0.15,
      maxLife: 0.4,
      color: pickRandom(colors),
      size: 1 + Math.floor(Math.random() * 2),
      shape: "circle",
    });
  }
}

// ---------------------------------------------------------------------------
// Prune collected / off-screen coins
// ---------------------------------------------------------------------------

export function pruneCoins(state: GameState, pruneY: number): void {
  for (let i = state.coins.length - 1; i >= 0; i--) {
    if (state.coins[i].collected || state.coins[i].laneY > pruneY) {
      state.coins.splice(i, 1);
    }
  }
}
