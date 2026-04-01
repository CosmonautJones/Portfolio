"use client";

import type { CoinType } from "@/lib/game/types";
import { COIN_TYPE_COLORS } from "./game-helpers";

interface ScorePopupsProps {
  canvasWidth: number;
  scorePopups: number[];
  coinPopups: { id: number; value: number; type: CoinType }[];
  combo: number;
}

export function ScorePopups({
  canvasWidth,
  scorePopups,
  coinPopups,
  combo,
}: ScorePopupsProps) {
  return (
    <>
      {/* Score popups -- positioned near center of canvas */}
      {scorePopups.map((id) => (
        <div
          key={id}
          className="absolute pointer-events-none font-bold font-mono"
          style={{
            top: "40%",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: canvasWidth * 0.06,
            color: "#a7f070",
            textShadow: "1px 1px 0 #1a1c2c, 0 0 4px rgba(167, 240, 112, 0.5)",
            animation: "scorePopup 0.6s ease-out forwards",
          }}
        >
          +1
        </div>
      ))}

      {/* Combo indicator -- shows when combo >= 2 */}
      {combo >= 2 && (
        <div
          key={combo}
          className="absolute pointer-events-none font-bold"
          style={{
            top: "48%",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: canvasWidth * 0.048,
            color: combo >= 6 ? "#ef7d57" : combo >= 4 ? "#ffcd75" : "#a7f070",
            textShadow: `1px 1px 0 #1a1c2c, 0 0 8px ${combo >= 6 ? "#ef7d57" : combo >= 4 ? "#ffcd75" : "#a7f070"}80`,
            animation: "comboPop 0.3s ease-out forwards, comboFade 1.5s ease-in 0s forwards",
            whiteSpace: "nowrap",
          }}
        >
          x{combo} COMBO
        </div>
      )}

      {/* Coin collection popups */}
      {coinPopups.map((popup) => (
        <div
          key={popup.id}
          className="absolute pointer-events-none font-bold font-mono"
          style={{
            top: "35%",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: canvasWidth * 0.055,
            color: COIN_TYPE_COLORS[popup.type],
            textShadow: `1px 1px 0 #1a1c2c, 0 0 6px ${COIN_TYPE_COLORS[popup.type]}80`,
            animation: "coinPopup 0.8s ease-out forwards",
          }}
        >
          +{popup.value}
        </div>
      ))}
    </>
  );
}
