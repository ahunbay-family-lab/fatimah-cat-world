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

export const MOUSE_WIDTH = 22;
export const MOUSE_HEIGHT = 16;
export const MOUSE_ROW_COUNT = 5;
export const MOUSE_SPACING = 90;
export const GOLD_PER_MOUSE = 2;
export const MOUSE_DOG_GAP = 70;

export const CLOUD_HEIGHT = 26;
export const CELEBRATION_SCORE_INTERVAL = 200;
export const CELEBRATION_FRAMES = 150;

export type Obstacle = {
  x: number;
  width: number;
  height: number;
};

export type Mouse = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
};

export type CloudPlatform = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  mice: Mouse[];
};

let nextMouseId = 0;
let nextCloudId = 0;

export function createObstacle(x: number): Obstacle {
  const big = Math.random() > 0.55;
  return {
    x,
    width: big ? DOG_WIDTH + 10 : DOG_WIDTH,
    height: big ? DOG_HEIGHT + 10 : DOG_HEIGHT,
  };
}

export function createMouseRow(startX: number): Mouse[] {
  const mice: Mouse[] = [];
  for (let i = 0; i < MOUSE_ROW_COUNT; i++) {
    mice.push({
      id: nextMouseId++,
      x: startX + i * MOUSE_SPACING,
      y: GROUND_Y - MOUSE_HEIGHT,
      width: MOUSE_WIDTH,
      height: MOUSE_HEIGHT,
      collected: false,
    });
  }
  return mice;
}

export function mouseRowWidth(): number {
  return (MOUSE_ROW_COUNT - 1) * MOUSE_SPACING + MOUSE_WIDTH;
}

function createCloudMouse(cloudX: number, platformY: number, offset: number): Mouse {
  return {
    id: nextMouseId++,
    x: cloudX + offset,
    y: platformY - MOUSE_HEIGHT,
    width: MOUSE_WIDTH,
    height: MOUSE_HEIGHT,
    collected: false,
  };
}

/** Cloud platform with mice sitting on top. */
export function createCloud(x: number, platformY: number): CloudPlatform {
  const width = 160 + Math.floor(Math.random() * 50);
  const padding = 18;
  const usable = width - padding * 2 - MOUSE_WIDTH;
  const mice = [0, 1, 2, 3].map((index) =>
    createCloudMouse(
      x,
      platformY,
      padding + Math.floor((usable * index) / 3),
    ),
  );
  return {
    id: nextCloudId++,
    x,
    y: platformY,
    width,
    height: CLOUD_HEIGHT,
    mice,
  };
}

/** Spawn a group of clouds — some close, some far apart. */
export function spawnCloudGroup(startX: number): CloudPlatform[] {
  const pattern = Math.random();
  if (pattern < 0.35) {
    return [createCloud(startX, 132)];
  }
  if (pattern < 0.7) {
    return [
      createCloud(startX, 132),
      createCloud(startX + 175, 98),
      createCloud(startX + 350, 115),
    ];
  }
  return [
    createCloud(startX, 128),
    createCloud(startX + 340, 88),
  ];
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
  pad = 8,
): boolean {
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

export function formatGold(gold: number): string {
  return String(Math.floor(gold));
}
