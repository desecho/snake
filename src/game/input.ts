import type { Direction } from "./types";

type InputHandlers = {
  onDirection: (direction: Direction) => void;
  onPause: () => void;
  onRestart: () => void;
};

const DIRECTION_BY_KEY: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  W: "up",
  s: "down",
  S: "down",
  a: "left",
  A: "left",
  d: "right",
  D: "right"
};

const RESTART_KEYS = new Set(["Enter", "r", "R"]);

export function bindKeyboardInput(target: Window, handlers: InputHandlers): () => void {
  const onKeyDown = (event: KeyboardEvent): void => {
    const mappedDirection = DIRECTION_BY_KEY[event.key];
    if (mappedDirection) {
      event.preventDefault();
      handlers.onDirection(mappedDirection);
      return;
    }

    if (event.code === "Space") {
      event.preventDefault();
      handlers.onPause();
      return;
    }

    if (RESTART_KEYS.has(event.key)) {
      handlers.onRestart();
    }
  };

  target.addEventListener("keydown", onKeyDown);

  return () => {
    target.removeEventListener("keydown", onKeyDown);
  };
}
