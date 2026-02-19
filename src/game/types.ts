export type Direction = "up" | "down" | "left" | "right";

export type Point = {
  x: number;
  y: number;
};

export type GameStatus = "ready" | "running" | "paused" | "gameover";

export type RandomFn = () => number;

export interface GameState {
  snake: Point[];
  direction: Direction;
  queuedDirection: Direction | null;
  food: Point;
  score: number;
  highScore: number;
  status: GameStatus;
  tickMs: number;
}
