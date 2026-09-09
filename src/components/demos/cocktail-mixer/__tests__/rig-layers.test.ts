/** @vitest-environment node */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const rigSource = readFileSync(
  fileURLToPath(new URL("../pixi/rig.ts", import.meta.url)),
  "utf8",
);

describe("mixer rig layers", () => {
  it("does not mount rim-highlight.png as a free sprite", () => {
    // That plate is an S-curve. As a sibling sprite it hangs in empty air
    // beside the bowl. Front glass already bakes the key light.
    expect(rigSource).not.toContain('"rim-highlight.png"');
  });
});
