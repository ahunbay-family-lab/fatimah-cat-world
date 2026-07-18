/** Shared sizes and helpers for the T-Rex runner game. */

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 240;
export const GROUND_Y = 200;

export const DINO_WIDTH = 44;
export const DINO_HEIGHT = 48;
export const DINO_X = 60;
export const JUMP_VELOCITY = -11.5;
export const GRAVITY = 0.55;

export const CACTUS_WIDTH = 22;
export const CACTUS_HEIGHT = 44;
export const BASE_SPEED = 6;
export const MAX_SPEED = 14;
export const SPEED_GROWTH = 0.0008;

export type Obstacle = {
  x: number;
  width: number;
  height: number;
};

export function createObstacle(x: number): Obstacle {
  const tall = Math.random() > 0.55;
  return {
    x,
    width: tall ? CACTUS_WIDTH + 6 : CACTUS_WIDTH,
    height: tall ? CACTUS_HEIGHT + 10 : CACTUS_HEIGHT,
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
  const pad = 4;
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
