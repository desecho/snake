import "./styles.css";

import { createInitialState, queueDirection, restart, step, togglePause } from "./game/engine";
import { bindKeyboardInput } from "./game/input";
import { createRenderer } from "./game/renderer";
import { loadHighScore, saveHighScore } from "./game/storage";
import type { GameState } from "./game/types";

const canvas = document.querySelector<HTMLCanvasElement>("#game");
const scoreNode = document.querySelector<HTMLSpanElement>("#score");
const highScoreNode = document.querySelector<HTMLSpanElement>("#high-score");
const statusNode = document.querySelector<HTMLParagraphElement>("#status-text");

if (!canvas || !scoreNode || !highScoreNode || !statusNode) {
  throw new Error("Game DOM structure is incomplete");
}

const scoreElement = scoreNode;
const highScoreElement = highScoreNode;
const statusElement = statusNode;

const renderer = createRenderer(canvas);
let state = createInitialState(loadHighScore());

function statusMessage(currentState: GameState): string {
  if (currentState.status === "ready") {
    return "Press an arrow key or WASD to start";
  }

  if (currentState.status === "paused") {
    return "Paused. Press Space to continue";
  }

  if (currentState.status === "gameover") {
    return "Game over. Press Enter or R to restart";
  }

  return "Running";
}

function updateHud(currentState: GameState): void {
  scoreElement.textContent = String(currentState.score);
  highScoreElement.textContent = String(currentState.highScore);
  statusElement.textContent = statusMessage(currentState);
}

function restartGame(): void {
  state = restart(state.highScore);
  updateHud(state);
  renderer.render(state);
}

const unbindKeyboard = bindKeyboardInput(window, {
  onDirection(direction) {
    queueDirection(state, direction);
  },
  onPause() {
    togglePause(state);
  },
  onRestart() {
    if (state.status === "running" || state.status === "paused" || state.status === "gameover") {
      restartGame();
    }
  }
});

window.addEventListener("beforeunload", () => {
  unbindKeyboard();
});

let lastFrameTime = performance.now();
let accumulator = 0;

function animate(now: number): void {
  const delta = now - lastFrameTime;
  lastFrameTime = now;

  if (state.status === "running") {
    accumulator += delta;

    while (accumulator >= state.tickMs) {
      const tickDuration = state.tickMs;
      const previousHighScore = state.highScore;
      state = step(state);
      if (state.highScore > previousHighScore) {
        saveHighScore(state.highScore);
      }

      accumulator -= tickDuration;

      if (state.status !== "running") {
        accumulator = 0;
        break;
      }
    }
  } else {
    accumulator = 0;
  }

  updateHud(state);
  renderer.render(state);
  window.requestAnimationFrame(animate);
}

updateHud(state);
renderer.render(state);
window.requestAnimationFrame(animate);
