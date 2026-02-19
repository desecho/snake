import { HIGH_SCORE_KEY } from "./constants";

export function loadHighScore(): number {
  try {
    const raw = window.localStorage.getItem(HIGH_SCORE_KEY);
    if (raw === null) {
      return 0;
    }

    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export function saveHighScore(score: number): void {
  try {
    window.localStorage.setItem(HIGH_SCORE_KEY, String(score));
  } catch {
    // Ignore storage failures (private mode, blocked storage, etc.).
  }
}
