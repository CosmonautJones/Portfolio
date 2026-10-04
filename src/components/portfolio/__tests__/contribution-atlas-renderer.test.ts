/** @vitest-environment jsdom */
import { afterEach, expect, it, vi } from "vitest";
import { initializeContributionAtlas } from "../contribution-atlas-renderer";
import snapshot from "@/lib/data/github-contributions-snapshot.json";

let dispose: (() => void) | undefined;
afterEach(() => { dispose?.(); dispose = undefined; document.body.replaceChildren(); document.documentElement.removeAttribute("style"); document.documentElement.removeAttribute("class"); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function setup() {
  document.body.innerHTML = `<div id="root"><div id="scene"><canvas id="atlas-canvas"></canvas><div id="tooltip"></div></div>${["total", "active", "peak", "day-label", "day-description", "day-date", "scene-hint", "view-name"].map((id) => `<span id="${id}"></span>`).join("")}${["top-view", "landscape-view", "replay", "reset-camera", "show-peak", "previous-day", "next-day"].map((id) => `<button id="${id}"></button>`).join("")}<input id="inspect-date" type="date"><input id="height-scale" type="range"><output id="height-value"></output></div>`;
  const fills: string[] = [];
  const context = { fillStyle: "", beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), closePath: vi.fn(), clearRect: vi.fn(), save: vi.fn(), restore: vi.fn(), stroke: vi.fn(), fillText: vi.fn(), setTransform: vi.fn(), fill() { fills.push(this.fillStyle); } };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context as unknown as CanvasRenderingContext2D);
  const frames = new Map<number, FrameRequestCallback>();
  let frameId = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++frameId, callback); return frameId; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  const motion = new EventTarget();
  vi.stubGlobal("matchMedia", () => Object.assign(motion, { matches: true }));
  const disconnect = vi.fn();
  vi.stubGlobal("ResizeObserver", class { observe = vi.fn(); disconnect = disconnect; });
  vi.stubGlobal("devicePixelRatio", 1);
  const theme: Record<string, string> = { "--background": "#0e1514", "--foreground": "#e4ece8", "--signal": "#f0b04a", "--muted": "#1b2625", "--rule-strong": "#43504a", "--border": "#304039", "--muted-foreground": "#9aaba5", "--font-mono": "monospace" };
  vi.stubGlobal("getComputedStyle", () => ({ getPropertyValue: (name: string) => theme[name] }));
  const root = document.querySelector("#root") as HTMLElement;
  vi.spyOn(root.querySelector("#scene")!, "getBoundingClientRect").mockReturnValue({ width: 1000, height: 420 } as DOMRect);
  dispose = initializeContributionAtlas(root, snapshot);
  function draw() { const pending = [...frames.values()]; frames.clear(); pending.forEach((callback) => callback(3000)); }
  return { root, theme, fills, draw, frames, disconnect };
}

it("redraws the calendar when the site's signal changes and stops observing on disposal", async () => {
  const { theme, fills, draw, frames, disconnect } = setup();
  draw();
  expect(fills).toContain("#f0b04a");
  theme["--signal"] = "#5ec4d6";
  document.documentElement.className = "dark theme-ocean";
  await Promise.resolve();
  fills.length = 0;
  draw();
  expect(fills).toContain("#5ec4d6");
  expect(fills).not.toContain("#f0b04a");
  dispose?.(); dispose = undefined;
  document.documentElement.className = "theme-ember";
  await Promise.resolve();
  expect(frames.size).toBe(0);
  expect(disconnect).toHaveBeenCalled();
});

it("selects exact dates, keeps navigation within the calendar, and removes its listeners", () => {
  const { root } = setup();
  const date = root.querySelector("#inspect-date") as HTMLInputElement;
  date.value = snapshot.from;
  date.dispatchEvent(new Event("change"));
  expect(root.querySelector("#day-description")!.textContent).toBe(`${snapshot.days[0].count} contributions`);
  expect(root.querySelector("#previous-day")).toHaveProperty("disabled", true);
  (root.querySelector("#next-day") as HTMLButtonElement).click();
  expect(date.value).toBe(snapshot.days[1].date);
  date.value = snapshot.to;
  date.dispatchEvent(new Event("change"));
  expect(root.querySelector("#next-day")).toHaveProperty("disabled", true);
  dispose?.(); dispose = undefined;
  (root.querySelector("#previous-day") as HTMLButtonElement).click();
  expect(date.value).toBe(snapshot.to);
});
