import {
  GRID_COLS,
  GRID_ROWS,
  INITIAL_TICK_MS,
  MIN_TICK_MS,
  SPEED_STEP_MS,
  SPEED_UP_EVERY
} from "./constants";
import type { Direction, GameState, Point, RandomFn } from "./types";

const DIRECTION_VECTORS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const OPPOSITES: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left"
};

function pointKey(point: Point): string {
  return `${point.x},${point.y}`;
}

function isOutOfBounds(point: Point): boolean {
  return point.x < 0 || point.y < 0 || point.x >= GRID_COLS || point.y >= GRID_ROWS;
}

function pointsEqual(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

function createInitialSnake(): Point[] {
  const centerX = Math.floor(GRID_COLS / 2);
  const centerY = Math.floor(GRID_ROWS / 2);

  return [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY }
  ];
}

function clampIndex(value: number, maxExclusive: number): number {
  const floored = Math.floor(value);
  if (floored < 0) {
    return 0;
  }

  if (floored >= maxExclusive) {
    return maxExclusive - 1;
  }

  return floored;
}

export function spawnFood(snake: Point[], rng: RandomFn = Math.random): Point | null {
  const occupied = new Set(snake.map(pointKey));
  const free: Point[] = [];

  for (let y = 0; y < GRID_ROWS; y += 1) {
    for (let x = 0; x < GRID_COLS; x += 1) {
      const candidate = { x, y };
      if (!occupied.has(pointKey(candidate))) {
        free.push(candidate);
      }
    }
  }

  if (free.length === 0) {
    return null;
  }

  const randomIndex = clampIndex(rng() * free.length, free.length);
  return free[randomIndex];
}

function canTurn(current: Direction, next: Direction): boolean {
  return OPPOSITES[current] !== next;
}

export function createInitialState(highScore: number, rng: RandomFn = Math.random): GameState {
  const snake = createInitialSnake();
  const food = spawnFood(snake, rng) ?? { x: 0, y: 0 };

  return {
    snake,
    direction: "right",
    queuedDirection: null,
    food,
    score: 0,
    highScore,
    status: "ready",
    tickMs: INITIAL_TICK_MS
  };
}

export function queueDirection(state: GameState, next: Direction): void {
  if (state.status === "gameover") {
    return;
  }

  // Keep one buffered turn per tick to avoid impossible double-turn reversals.
  if (state.queuedDirection !== null) {
    return;
  }

  if (!canTurn(state.direction, next)) {
    return;
  }

  state.queuedDirection = next;

  if (state.status === "ready") {
    state.status = "running";
  }
}

export function togglePause(state: GameState): void {
  if (state.status === "running") {
    state.status = "paused";
    return;
  }

  if (state.status === "paused") {
    state.status = "running";
  }
}

function withDirection(state: GameState): Direction {
  return state.queuedDirection ?? state.direction;
}

export function step(state: GameState, rng: RandomFn = Math.random): GameState {
  if (state.status !== "running") {
    return state;
  }

  const direction = withDirection(state);
  const vector = DIRECTION_VECTORS[direction];
  const head = state.snake[0];
  const candidateHead: Point = {
    x: head.x + vector.x,
    y: head.y + vector.y
  };

  const eatsFood = pointsEqual(candidateHead, state.food);
  const bodyForCollision = eatsFood ? state.snake : state.snake.slice(0, -1);

  if (isOutOfBounds(candidateHead) || bodyForCollision.some((part) => pointsEqual(part, candidateHead))) {
    return {
      ...state,
      direction,
      queuedDirection: null,
      status: "gameover"
    };
  }

  const nextSnake = [candidateHead, ...state.snake];
  let nextScore = state.score;
  let nextFood = state.food;
  let nextTickMs = state.tickMs;
  let nextStatus: GameState["status"] = state.status;

  if (eatsFood) {
    nextScore += 1;
    if (nextScore % SPEED_UP_EVERY === 0) {
      nextTickMs = Math.max(MIN_TICK_MS, state.tickMs - SPEED_STEP_MS);
    }

    const spawnedFood = spawnFood(nextSnake, rng);
    if (spawnedFood === null) {
      nextStatus = "gameover";
    } else {
      nextFood = spawnedFood;
    }
  } else {
    nextSnake.pop();
  }

  return {
    ...state,
    snake: nextSnake,
    direction,
    queuedDirection: null,
    food: nextFood,
    score: nextScore,
    highScore: Math.max(state.highScore, nextScore),
    status: nextStatus,
    tickMs: nextTickMs
  };
}

export function restart(highScore: number, rng: RandomFn = Math.random): GameState {
  return createInitialState(highScore, rng);
}
