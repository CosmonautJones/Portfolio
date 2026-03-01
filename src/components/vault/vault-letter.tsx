"use client";

export function VaultLetter() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div
        className="max-w-md rounded-lg p-8"
        style={{
          background: "linear-gradient(135deg, rgba(255,253,245,0.03) 0%, rgba(255,253,245,0.01) 100%)",
          border: "1px solid rgba(255,253,245,0.06)",
        }}
      >
        <div
          className="space-y-4 text-sm leading-relaxed text-muted-foreground/90"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}
        >
          <p>To whoever found this place,</p>

          <p>
            If you&apos;re reading this, you&apos;re my kind of person. You didn&apos;t just
            scroll past — you poked around, typed commands, followed hunches. That&apos;s the
            same instinct that makes a great developer.
          </p>

          <p>
            I built this site the way I build everything: with curiosity as the compass.
            Every easter egg, every hidden command, every secret page — they&apos;re love
            letters to the people who explore rather than consume.
          </p>

          <p>
            The internet used to feel like this. Full of surprises. Personal
            pages with hidden corners. I wanted to bring a little of that back.
          </p>

          <p>
            Thanks for being the kind of person who looks under the hood. The world
            needs more of you.
          </p>

          <p className="mt-6 text-right text-foreground/70">
            — Travis
          </p>
        </div>
      </div>
    </div>
  );
}
