import type { InputAction } from "./types";

export const KEY_MAP: Record<string, InputAction> = {
  ArrowUp: "move_up",
  w: "move_up",
  W: "move_up",
  ArrowDown: "move_down",
  s: "move_down",
  S: "move_down",
  ArrowLeft: "move_left",
  a: "move_left",
  A: "move_left",
  ArrowRight: "move_right",
  d: "move_right",
  D: "move_right",
  Escape: "pause",
  p: "pause",
  P: "pause",
};

const SWIPE_THRESHOLD = 30;

export function createInputHandler(onAction: (action: InputAction) => void) {
  let touchStartX = 0;
  let touchStartY = 0;

  function handleKeyDown(e: KeyboardEvent) {
    const action = KEY_MAP[e.key];
    if (action) {
      e.preventDefault();
      onAction(action);
    }
  }

  function handleTouchStart(e: TouchEvent) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }

  function handleTouchEnd(e: TouchEvent) {
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    const magnitude = Math.sqrt(dx * dx + dy * dy);

    if (magnitude > SWIPE_THRESHOLD) {
      if (Math.abs(dx) > Math.abs(dy)) {
        onAction(dx > 0 ? "move_right" : "move_left");
      } else {
        onAction(dy > 0 ? "move_down" : "move_up");
      }
    } else {
      // Tap = move up
      onAction("move_up");
    }
  }

  function destroy() {
    // No-op: the React component manages event listener attachment/removal
  }

  return { handleKeyDown, handleTouchStart, handleTouchEnd, destroy };
}
