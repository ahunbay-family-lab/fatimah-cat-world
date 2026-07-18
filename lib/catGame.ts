/** Shared sizes and helpers for the cat runner game. */

export const GAME_WIDTH = 900;
export const GAME_HEIGHT = 280;
export const GROUND_Y = 230;

export const CAT_WIDTH = 84;
export const CAT_HEIGHT = 56;
export const CAT_X = 70;
export const JUMP_VELOCITY = -12;
export const GRAVITY = 0.55;

export const DOG_WIDTH = 72;
export const DOG_HEIGHT = 62;
export const BASE_SPEED = 6;
export const MAX_SPEED = 14;
export const SPEED_GROWTH = 0.0008;

export type Obstacle = {
  x: number;
  width: number;
  height: number;
};

export function createObstacle(x: number): Obstacle {
  const big = Math.random() > 0.55;
  return {
    x,
    width: big ? DOG_WIDTH + 10 : DOG_WIDTH,
    height: big ? DOG_HEIGHT + 10 : DOG_HEIGHT,
  };
}

export function boxesOverlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): boolean {
  // Slightly shrink hitboxes so near-misses feel fair
  const pad = 8;
  return (
    ax + pad < bx + bw - pad &&
    ax + aw - pad > bx + pad &&
    ay + pad < by + bh - pad &&
    ay + ah - pad > by + pad
  );
}

export function formatScore(score: number): string {
  return String(Math.floor(score)).padStart(5, "0");
}
