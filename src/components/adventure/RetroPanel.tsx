interface RetroPanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function RetroPanel({ title, children, className = "" }: RetroPanelProps) {
  return (
    <div
      className={`rounded-sm ${className}`}
      style={{
        background: "#1a1c2c",
        border: "2px solid #333c57",
        boxShadow: "inset 0 0 0 1px #1a1c2c, inset 0 0 0 3px rgba(51, 60, 87, 0.3)",
      }}
    >
      <div className="px-3 pt-2 pb-1">
        <h3
          className="font-bold font-mono text-xs uppercase tracking-wider text-center"
          style={{
            color: "#ffcd75",
            textShadow: "0 0 6px rgba(255, 205, 117, 0.4)",
          }}
        >
          {title}
        </h3>
      </div>
      <div
        className="mx-2 mb-1"
        style={{
          height: 1,
          background: "linear-gradient(to right, transparent, #333c57, transparent)",
        }}
      />
      <div className="px-3 pb-2">{children}</div>
    </div>
  );
}
