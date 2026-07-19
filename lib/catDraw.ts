import {
  CAT_HEIGHT,
  CAT_WIDTH,
  CAT_X,
  GAME_HEIGHT,
  GAME_WIDTH,
  GROUND_Y,
  formatScore,
  type Obstacle,
} from "@/lib/catGame";
import { drawFlagHat } from "@/lib/flagHat";
import { drawGoldHud } from "@/lib/mouseDraw";
import type { GameSprites } from "@/lib/sprites";

export function drawSky(ctx: CanvasRenderingContext2D) {
  const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
  gradient.addColorStop(0, "#7ec8e3");
  gradient.addColorStop(0.55, "#c9e8f5");
  gradient.addColorStop(1, "#e8d5a3");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  ctx.fillStyle = "#f4c15d";
  ctx.beginPath();
  ctx.arc(GAME_WIDTH - 80, 52, 32, 0, Math.PI * 2);
  ctx.fill();
}

export function drawGround(ctx: CanvasRenderingContext2D, groundOffset: number) {
  ctx.fillStyle = "#c4a35a";
  ctx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);

  ctx.strokeStyle = "#8a7340";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(GAME_WIDTH, GROUND_Y);
  ctx.stroke();

  ctx.strokeStyle = "#a88b4a";
  ctx.lineWidth = 1.5;
  const spacing = 28;
  const offset = groundOffset % spacing;
  for (let x = -offset; x < GAME_WIDTH; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y + 12);
    ctx.lineTo(x + 12, GROUND_Y + 12);
    ctx.stroke();
  }
}

function getSpriteDrawRect(
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const scale = Math.min(width / image.width, height / image.height);
  const drawW = image.width * scale;
  const drawH = image.height * scale;
  return {
    drawX: x + (width - drawW) / 2,
    drawY: y + height - drawH,
    drawW,
    drawH,
  };
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const { drawX, drawY, drawW, drawH } = getSpriteDrawRect(
    image,
    x,
    y,
    width,
    height,
  );
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, drawX, drawY, drawW, drawH);
}

/** High-res tabby cat facing right, with a running leg cycle. */
export function drawCat(
  ctx: CanvasRenderingContext2D,
  sprites: GameSprites | null,
  y: number,
  frame: number,
  isPlaying: boolean,
  isOnSurface: boolean,
  isCelebrating = false,
  celebrationFrame = 0,
) {
  if (isCelebrating) {
    drawCelebrationCat(ctx, sprites, celebrationFrame);
    return;
  }

  const x = CAT_X;
  const bob = isPlaying && isOnSurface ? Math.sin(frame / 4) * 1.2 : 0;

  if (sprites) {
    let image = sprites.cat;

    if (isPlaying && isOnSurface && sprites.catRuns.length > 0) {
      const runIndex = Math.floor(frame / 5) % sprites.catRuns.length;
      image = sprites.catRuns[runIndex] ?? sprites.cat;
    } else if (isPlaying && !isOnSurface) {
      image = sprites.catRuns[0] ?? sprites.cat;
    } else if (sprites.catRuns[1]) {
      image = sprites.catRuns[1];
    }

    const catYPos = y + bob;
    drawImageCover(ctx, image, x, catYPos, CAT_WIDTH, CAT_HEIGHT);
    const spriteRect = getSpriteDrawRect(image, x, catYPos, CAT_WIDTH, CAT_HEIGHT);
    drawFlagHat(ctx, spriteRect);
    return;
  }

  ctx.fillStyle = "#e08a3c";
  ctx.fillRect(x, y, CAT_WIDTH, CAT_HEIGHT);
  drawFlagHat(ctx, {
    drawX: x,
    drawY: y,
    drawW: CAT_WIDTH,
    drawH: CAT_HEIGHT,
  });
}

type RobotPose = {
  hop: number;
  tilt: number;
  glitch: number;
  leftArm: number;
  rightArm: number;
  knee: number;
};

const ROBOT_POSES: RobotPose[] = [
  { hop: -10, tilt: -0.12, glitch: -4, leftArm: -2.35, rightArm: -0.45, knee: 6 },
  { hop: 0, tilt: 0.04, glitch: 4, leftArm: -1.75, rightArm: -1.55, knee: -4 },
  { hop: -8, tilt: 0.12, glitch: -3, leftArm: -0.35, rightArm: -2.25, knee: 5 },
  { hop: 0, tilt: -0.05, glitch: 3, leftArm: 0.35, rightArm: 0.55, knee: -3 },
  { hop: -12, tilt: 0.1, glitch: -5, leftArm: -2.1, rightArm: -0.2, knee: 7 },
  { hop: -2, tilt: -0.08, glitch: 5, leftArm: -1.4, rightArm: -1.7, knee: -5 },
  { hop: -9, tilt: 0.14, glitch: -4, leftArm: -0.2, rightArm: -2.4, knee: 6 },
  { hop: 0, tilt: 0, glitch: 4, leftArm: 0.5, rightArm: 0.4, knee: -2 },
];

function drawRobotArm(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
) {
  const upperLength = 20;
  const lowerLength = 17;
  const elbowAngle = angle + 0.75 * Math.sign(angle || 1);

  const elbowX = x + Math.cos(angle) * upperLength;
  const elbowY = y + Math.sin(angle) * upperLength;
  const handX = elbowX + Math.cos(elbowAngle) * lowerLength;
  const handY = elbowY + Math.sin(elbowAngle) * lowerLength;

  ctx.strokeStyle = "#d97706";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(elbowX, elbowY);
  ctx.lineTo(handX, handY);
  ctx.stroke();

  ctx.fillStyle = "#b8b8b8";
  for (const joint of [
    { px: x, py: y, radius: 4 },
    { px: elbowX, py: elbowY, radius: 3 },
    { px: handX, py: handY, radius: 3 },
  ]) {
    ctx.beginPath();
    ctx.arc(joint.px, joint.py, joint.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Cat stands on two legs and does a stiff robot dance. */
function drawCelebrationCat(
  ctx: CanvasRenderingContext2D,
  sprites: GameSprites | null,
  celebrationFrame: number,
) {
  const pose = ROBOT_POSES[Math.floor(celebrationFrame / 5) % ROBOT_POSES.length];
  const footX = CAT_X + 44;
  const footY = GROUND_Y;
  const standHeight = CAT_WIDTH + 8;
  const standWidth = CAT_HEIGHT + 6;
  const image = sprites?.cat ?? null;

  ctx.save();
  ctx.translate(footX + pose.glitch, footY + pose.hop);
  ctx.rotate(pose.tilt);
  ctx.rotate(-Math.PI / 2 + 0.1);

  drawRobotArm(ctx, -22, -standHeight + 8, pose.leftArm);
  drawRobotArm(ctx, 22, -standHeight + 8, pose.rightArm);

  if (image) {
    drawImageCover(ctx, image, -standWidth / 2, -standHeight - 6, standWidth, standHeight);
    const spriteRect = getSpriteDrawRect(
      image,
      -standWidth / 2,
      -standHeight - 6,
      standWidth,
      standHeight,
    );
    drawFlagHat(ctx, spriteRect);
  } else {
    ctx.fillStyle = "#e08a3c";
    ctx.fillRect(-standWidth / 2, -standHeight - 6, standWidth, standHeight);
    drawFlagHat(ctx, {
      drawX: -standWidth / 2,
      drawY: -standHeight - 6,
      drawW: standWidth,
      drawH: standHeight,
    });
  }

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#3d5a40";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-14, 8, 24, 16, 4);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(2, 8 + pose.knee, 24, 16, 4);
  ctx.fill();
  ctx.stroke();

  ctx.restore();

  drawCelebrateBubble(ctx, footX, footY - standHeight - 36 + pose.hop);

  if (celebrationFrame % 10 < 5) {
    ctx.save();
    ctx.strokeStyle = "rgba(61, 90, 64, 0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(footX - 50, footY - 4);
    ctx.lineTo(footX - 30, footY - 18);
    ctx.moveTo(footX + 50, footY - 6);
    ctx.lineTo(footX + 28, footY - 20);
    ctx.stroke();
    ctx.restore();
  }
}

function drawCelebrateBubble(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
  ctx.strokeStyle = "#3d5a40";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x - 34, y - 30, 68, 34, 10);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 8, y + 4);
  ctx.lineTo(x, y + 14);
  ctx.lineTo(x + 10, y + 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#1f3d2a";
  ctx.font = "bold 18px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textAlign = "center";
  ctx.fillText("🎉", x, y - 8);
  ctx.restore();
}

/**
 * High-res brown dog facing LEFT toward the cat.
 * Alternates bark / closed mouth frames.
 */
export function drawDog(
  ctx: CanvasRenderingContext2D,
  sprites: GameSprites | null,
  obstacle: Obstacle,
  frame: number,
) {
  const x = obstacle.x;
  const h = obstacle.height;
  const w = obstacle.width;
  const y = GROUND_Y - h;
  const barking = Math.floor(frame / 8) % 2 === 0;

  if (sprites) {
    const image = barking ? sprites.dogBark : sprites.dog;
    drawImageCover(ctx, image, x, y, w, h);

    if (barking) {
      // Bark lines in front of the dog's face (left side)
      ctx.strokeStyle = "#3a1f12";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + h * 0.28);
      ctx.lineTo(x - 8, y + h * 0.22);
      ctx.moveTo(x + 4, y + h * 0.36);
      ctx.lineTo(x - 10, y + h * 0.36);
      ctx.moveTo(x + 4, y + h * 0.44);
      ctx.lineTo(x - 8, y + h * 0.5);
      ctx.stroke();
    }
    return;
  }

  ctx.fillStyle = "#8b5a2b";
  ctx.fillRect(x, y, w, h);
}

type HudStatus = "ready" | "playing" | "celebrating" | "gameover";

export function drawHud(
  ctx: CanvasRenderingContext2D,
  status: HudStatus,
  score: number,
  highScore: number,
  gold: number,
) {
  drawGoldHud(ctx, gold);

  ctx.fillStyle = "#2c2416";
  ctx.font = "bold 16px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textAlign = "right";
  ctx.fillText(
    `HI ${formatScore(highScore)}  ${formatScore(score)}`,
    GAME_WIDTH - 16,
    28,
  );

  if (status === "ready") {
    ctx.textAlign = "center";
    ctx.font = "bold 22px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText("Press Space to start", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10);
    ctx.font = "14px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText(
      "Jump on clouds for mice, dodge dogs!",
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 16,
    );
  }

  if (status === "celebrating") {
    ctx.textAlign = "center";
    ctx.font = "bold 22px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillStyle = "#1f3d2a";
    ctx.fillText("Celebration time! 🎉", GAME_WIDTH / 2, GAME_HEIGHT / 2);
  }

  if (status === "gameover") {
    ctx.textAlign = "center";
    ctx.font = "bold 26px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText("GAME OVER", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 8);
    ctx.font = "14px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText(
      "Press Space or Enter to retry",
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 18,
    );
  }
}
