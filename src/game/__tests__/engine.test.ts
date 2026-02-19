import { describe, expect, it } from "vitest";

import {
  INITIAL_TICK_MS,
  MIN_TICK_MS,
  SPEED_STEP_MS,
  SPEED_UP_EVERY,
  GRID_COLS
} from "../constants";
import { createInitialState, queueDirection, restart, spawnFood, step } from "../engine";
import type { GameState, Point } from "../types";

function makeRunningState(overrides: Partial<GameState> = {}): GameState {
  return {
    snake: [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ],
    direction: "right",
    queuedDirection: null,
    food: { x: 2, y: 2 },
    score: 0,
    highScore: 0,
    status: "running",
    tickMs: INITIAL_TICK_MS,
    ...overrides
  };
}

function includesPoint(points: Point[], target: Point): boolean {
  return points.some((point) => point.x === target.x && point.y === target.y);
}

describe("engine", () => {
  it("creates expected initial state", () => {
    const state = createInitialState(7, () => 0);

    expect(state.status).toBe("ready");
    expect(state.direction).toBe("right");
    expect(state.snake).toHaveLength(3);
    expect(state.score).toBe(0);
    expect(state.highScore).toBe(7);
    expect(includesPoint(state.snake, state.food)).toBe(false);
  });

  it("rejects immediate reverse direction", () => {
    const state = makeRunningState();

    queueDirection(state, "left");
    expect(state.queuedDirection).toBeNull();

    queueDirection(state, "up");
    expect(state.queuedDirection).toBe("up");
  });

  it("moves snake one cell without growing when food is not eaten", () => {
    const state = makeRunningState({ food: { x: 0, y: 0 } });
    const next = step(state);

    expect(next.snake[0]).toEqual({ x: 11, y: 10 });
    expect(next.snake).toHaveLength(state.snake.length);
    expect(next.score).toBe(0);
  });

  it("grows snake and increments score when food is eaten", () => {
    const state = makeRunningState({ food: { x: 11, y: 10 } });
    const next = step(state, () => 0);

    expect(next.snake).toHaveLength(state.snake.length + 1);
    expect(next.score).toBe(1);
    expect(next.highScore).toBe(1);
    expect(includesPoint(next.snake, next.food)).toBe(false);
  });

  it("detects wall collisions", () => {
    const state = makeRunningState({
      snake: [
        { x: GRID_COLS - 1, y: 2 },
        { x: GRID_COLS - 2, y: 2 },
        { x: GRID_COLS - 3, y: 2 }
      ]
    });

    const next = step(state);
    expect(next.status).toBe("gameover");
  });

  it("detects self collision", () => {
    const state = makeRunningState({
      direction: "left",
      snake: [
        { x: 5, y: 5 },
        { x: 5, y: 6 },
        { x: 4, y: 6 },
        { x: 4, y: 5 },
        { x: 4, y: 4 },
        { x: 5, y: 4 }
      ]
    });

    const next = step(state);
    expect(next.status).toBe("gameover");
  });

  it("spawns food outside snake body", () => {
    const snake = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 }
    ];

    const food = spawnFood(snake, () => 0);
    expect(food).not.toBeNull();
    expect(includesPoint(snake, food as Point)).toBe(false);
  });

  it("reduces tick speed after each speed milestone and respects minimum", () => {
    let state = makeRunningState();

    for (let index = 0; index < SPEED_UP_EVERY; index += 1) {
      const head = state.snake[0];
      state = {
        ...state,
        food: { x: head.x + 1, y: head.y }
      };
      state = step(state, () => 0.5);
    }

    expect(state.tickMs).toBe(INITIAL_TICK_MS - SPEED_STEP_MS);

    const floorState = makeRunningState({
      score: SPEED_UP_EVERY - 1,
      tickMs: MIN_TICK_MS,
      food: { x: 11, y: 10 }
    });

    const next = step(floorState, () => 0.5);
    expect(next.tickMs).toBe(MIN_TICK_MS);
  });

  it("updates high score when surpassed", () => {
    const state = makeRunningState({
      score: 5,
      highScore: 5,
      food: { x: 11, y: 10 }
    });

    const next = step(state, () => 0.5);
    expect(next.score).toBe(6);
    expect(next.highScore).toBe(6);
  });

  it("restarts with preserved high score", () => {
    const restarted = restart(11, () => 0.2);

    expect(restarted.highScore).toBe(11);
    expect(restarted.score).toBe(0);
    expect(restarted.status).toBe("ready");
    expect(restarted.direction).toBe("right");
  });
});
