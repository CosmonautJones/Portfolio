import { RetroPanel } from "./RetroPanel";

export function ControlsPanel() {
  const controls = [
    { keys: "WASD / Arrows", action: "Move" },
    { keys: "P / Esc", action: "Pause" },
  ];

  const touch = [
    { gesture: "Tap", action: "Move up" },
    { gesture: "Swipe", action: "Move direction" },
  ];

  return (
    <RetroPanel title="Controls">
      <div className="space-y-1.5">
        {controls.map((c) => (
          <div
            key={c.keys}
            className="flex items-center justify-between font-mono text-[11px]"
          >
            <span
              className="px-1 py-0.5 rounded-sm text-[10px]"
              style={{
                background: "#333c57",
                color: "#f4f4f4",
              }}
            >
              {c.keys}
            </span>
            <span style={{ color: "#94b0c2" }}>{c.action}</span>
          </div>
        ))}
        <div
          className="my-1"
          style={{
            height: 1,
            background: "linear-gradient(to right, transparent, #333c57, transparent)",
          }}
        />
        <div className="font-mono text-[9px] text-center" style={{ color: "#566c86" }}>
          TOUCH
        </div>
        {touch.map((t) => (
          <div
            key={t.gesture}
            className="flex items-center justify-between font-mono text-[11px]"
          >
            <span style={{ color: "#566c86" }}>{t.gesture}</span>
            <span style={{ color: "#94b0c2" }}>{t.action}</span>
          </div>
        ))}
      </div>
    </RetroPanel>
  );
}
