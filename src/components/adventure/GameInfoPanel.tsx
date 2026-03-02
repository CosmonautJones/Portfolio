import { RetroPanel } from "./RetroPanel";
import { LEVEL_THRESHOLDS } from "@/lib/game/constants";

export function GameInfoPanel() {
  const levels = LEVEL_THRESHOLDS.map((threshold, i) => ({
    level: i + 1,
    score: threshold,
  }));

  return (
    <RetroPanel title="Levels">
      <div className="space-y-0.5">
        {levels.map(({ level, score }) => (
          <div
            key={level}
            className="flex items-center justify-between font-mono text-[11px]"
          >
            <span style={{ color: "#ffcd75" }}>LVL {level}</span>
            <span style={{ color: "#566c86" }}>
              {score === 0 ? "Start" : `${score}+`}
            </span>
          </div>
        ))}
      </div>
      <div
        className="my-1.5"
        style={{
          height: 1,
          background: "linear-gradient(to right, transparent, #333c57, transparent)",
        }}
      />
      <p className="font-mono text-[9px] text-center" style={{ color: "#566c86" }}>
        Speed increases with score. Trains appear more often at higher levels.
      </p>
    </RetroPanel>
  );
}
