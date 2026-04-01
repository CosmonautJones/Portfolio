import type { DeathCause, RunSummary } from "./types";

const CARD_WIDTH = 600;
const CARD_HEIGHT = 400;
const BG_COLOR = "#1a1c2c";
const BORDER_COLOR = "#ffcd75";
const TEXT_COLOR = "#f4f4f4";
const SECONDARY_COLOR = "#94b0c2";
const MUTED_COLOR = "#566c86";
const HIGHLIGHT_COLOR = "#ffcd75";
const SUCCESS_COLOR = "#38b764";

function getDeathMessage(cause: DeathCause | null): string {
  switch (cause) {
    case "vehicle": return "Squished by traffic!";
    case "train": return "Hit by a train!";
    case "water": return "Fell in the water!";
    case "idle_timeout": return "Too slow!";
    case "off_screen": return "Left behind!";
    default: return "Game Over";
  }
}

function getDeathColor(cause: DeathCause | null): string {
  switch (cause) {
    case "vehicle": return "#ef7d57";
    case "train": return "#ffff00";
    case "water": return "#41a6f6";
    case "idle_timeout": return "#ffcd75";
    case "off_screen": return "#94b0c2";
    default: return TEXT_COLOR;
  }
}

function padScore(score: number): string {
  return String(score).padStart(4, "0");
}

/**
 * Generate a canvas-based run summary card as a PNG data URL.
 * Runs entirely client-side — no server call needed.
 */
export function generateRunSummaryCard(summary: RunSummary): string {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Border
  ctx.strokeStyle = BORDER_COLOR;
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, CARD_WIDTH - 8, CARD_HEIGHT - 8);

  // Inner border
  ctx.strokeStyle = "#c4a35a";
  ctx.lineWidth = 1;
  ctx.strokeRect(8, 8, CARD_WIDTH - 16, CARD_HEIGHT - 16);

  // Title
  ctx.font = "bold 28px monospace";
  ctx.fillStyle = TEXT_COLOR;
  ctx.textAlign = "center";
  ctx.fillText("ClaudeBot's Adventure", CARD_WIDTH / 2, 50);

  // Decorative line
  const gradient = ctx.createLinearGradient(100, 60, CARD_WIDTH - 100, 60);
  gradient.addColorStop(0, "transparent");
  gradient.addColorStop(0.5, BORDER_COLOR);
  gradient.addColorStop(1, "transparent");
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100, 62);
  ctx.lineTo(CARD_WIDTH - 100, 62);
  ctx.stroke();

  // Death cause
  ctx.font = "16px monospace";
  ctx.fillStyle = getDeathColor(summary.deathCause);
  ctx.fillText(getDeathMessage(summary.deathCause), CARD_WIDTH / 2, 90);

  // Score
  ctx.font = "bold 48px monospace";
  ctx.fillStyle = TEXT_COLOR;
  ctx.fillText(padScore(summary.score), CARD_WIDTH / 2, 150);

  // New high score badge
  if (summary.isNewHighScore) {
    ctx.font = "bold 18px monospace";
    ctx.fillStyle = HIGHLIGHT_COLOR;
    ctx.fillText("NEW HIGH SCORE!", CARD_WIDTH / 2, 175);
  }

  // Stats grid
  const statsY = summary.isNewHighScore ? 200 : 185;
  const stats = [
    { label: "LEVEL", value: String(summary.level), color: HIGHLIGHT_COLOR },
    { label: "COINS", value: String(summary.coinsCollected), color: HIGHLIGHT_COLOR },
    { label: "BONUS", value: `+${summary.coinBonus}`, color: "#a7f070" },
    {
      label: "TIME",
      value: formatSurvivalTime(summary.survivalTimeMs),
      color: SECONDARY_COLOR,
    },
  ];

  const colWidth = (CARD_WIDTH - 60) / stats.length;
  ctx.textAlign = "center";

  for (let i = 0; i < stats.length; i++) {
    const x = 30 + colWidth * i + colWidth / 2;

    ctx.font = "10px monospace";
    ctx.fillStyle = MUTED_COLOR;
    ctx.fillText(stats[i].label, x, statsY);

    ctx.font = "bold 22px monospace";
    ctx.fillStyle = stats[i].color;
    ctx.fillText(stats[i].value, x, statsY + 26);
  }

  // Personal bests beaten
  if (summary.personalBestsBeaten.length > 0) {
    const pbY = statsY + 55;
    ctx.font = "bold 14px monospace";
    ctx.fillStyle = SUCCESS_COLOR;
    ctx.textAlign = "center";

    const labels: Record<string, string> = {
      bestScore: "BEST SCORE",
      mostCoins: "MOST COINS",
      longestSurvivalMs: "LONGEST RUN",
      highestLevel: "HIGHEST LEVEL",
      highestCombo: "BEST COMBO",
    };

    const beaten = summary.personalBestsBeaten.map(
      (k) => labels[k] ?? k,
    );
    ctx.fillText(
      `New Record: ${beaten.join(", ")}`,
      CARD_WIDTH / 2,
      pbY,
    );
  }

  // Challenges completed
  if (summary.challengesCompleted.length > 0) {
    const chalY = statsY + 75;
    ctx.font = "14px monospace";
    ctx.fillStyle = SUCCESS_COLOR;
    ctx.textAlign = "center";
    ctx.fillText(
      `${summary.challengesCompleted.length} Challenge${summary.challengesCompleted.length === 1 ? "" : "s"} Completed!`,
      CARD_WIDTH / 2,
      chalY,
    );
  }

  // Watermark
  ctx.font = "11px monospace";
  ctx.fillStyle = MUTED_COLOR;
  ctx.textAlign = "center";
  ctx.fillText("travisjohnjones.com/adventure", CARD_WIDTH / 2, CARD_HEIGHT - 18);

  return canvas.toDataURL("image/png");
}

/** Copy a data URL image to clipboard */
export async function copyRunSummaryToClipboard(
  dataUrl: string,
): Promise<boolean> {
  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob }),
    ]);
    return true;
  } catch {
    return false;
  }
}

/** Download a data URL image as a file */
export function downloadRunSummary(dataUrl: string, score: number): void {
  const link = document.createElement("a");
  link.download = `adventure-score-${score}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function formatSurvivalTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  if (minutes > 0) {
    return `${minutes}:${String(remaining).padStart(2, "0")}`;
  }
  return `${seconds}s`;
}

/** Determine if a run is "notable" enough to offer sharing */
export function isNotableRun(summary: RunSummary): boolean {
  return (
    summary.isNewHighScore ||
    summary.personalBestsBeaten.length > 0 ||
    summary.challengesCompleted.length > 0 ||
    summary.score >= 50
  );
}
