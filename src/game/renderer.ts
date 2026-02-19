import { BOARD_HEIGHT, BOARD_WIDTH, CELL_SIZE, GRID_COLS, GRID_ROWS } from "./constants";
import type { GameState, Point } from "./types";

function drawCell(ctx: CanvasRenderingContext2D, point: Point, color: string): void {
  const x = point.x * CELL_SIZE;
  const y = point.y * CELL_SIZE;
  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
}

export function createRenderer(canvas: HTMLCanvasElement) {
  canvas.width = BOARD_WIDTH;
  canvas.height = BOARD_HEIGHT;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("2D rendering context is unavailable");
  }

  ctx.imageSmoothingEnabled = false;

  const drawGrid = (): void => {
    ctx.strokeStyle = "#21364f";
    ctx.lineWidth = 1;

    for (let x = 0; x <= GRID_COLS; x += 1) {
      const xpos = x * CELL_SIZE + 0.5;
      ctx.beginPath();
      ctx.moveTo(xpos, 0);
      ctx.lineTo(xpos, BOARD_HEIGHT);
      ctx.stroke();
    }

    for (let y = 0; y <= GRID_ROWS; y += 1) {
      const ypos = y * CELL_SIZE + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, ypos);
      ctx.lineTo(BOARD_WIDTH, ypos);
      ctx.stroke();
    }
  };

  const drawOverlay = (state: GameState): void => {
    let title = "";
    let subtitle = "";

    if (state.status === "ready") {
      title = "Ready";
      subtitle = "Press an arrow key or WASD";
    } else if (state.status === "paused") {
      title = "Paused";
      subtitle = "Press Space to continue";
    } else if (state.status === "gameover") {
      title = "Game Over";
      subtitle = "Press Enter or R to restart";
    }

    if (!title) {
      return;
    }

    ctx.fillStyle = "#000000aa";
    ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

    ctx.fillStyle = "#d9f0ff";
    ctx.textAlign = "center";
    ctx.font = "bold 28px Courier New";
    ctx.fillText(title, BOARD_WIDTH / 2, BOARD_HEIGHT / 2 - 10);

    ctx.fillStyle = "#a9cbe8";
    ctx.font = "16px Courier New";
    ctx.fillText(subtitle, BOARD_WIDTH / 2, BOARD_HEIGHT / 2 + 20);
  };

  const render = (state: GameState): void => {
    ctx.fillStyle = "#071625";
    ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

    drawGrid();
    drawCell(ctx, state.food, "#ff5f7d");

    for (let idx = state.snake.length - 1; idx >= 0; idx -= 1) {
      const segment = state.snake[idx];
      const color = idx === 0 ? "#b2ffd0" : "#80f4b3";
      drawCell(ctx, segment, color);
    }

    drawOverlay(state);
  };

  return { render };
}
