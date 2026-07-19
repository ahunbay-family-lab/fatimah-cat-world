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
  isOnGround: boolean,
) {
  const x = CAT_X;
  const bob = isPlaying && isOnGround ? Math.sin(frame / 4) * 1.2 : 0;

  if (sprites) {
    let image = sprites.cat;

    if (isPlaying && isOnGround && sprites.catRuns.length > 0) {
      // Cycle leg frames while running on the ground
      const runIndex = Math.floor(frame / 5) % sprites.catRuns.length;
      image = sprites.catRuns[runIndex] ?? sprites.cat;
    } else if (isPlaying && !isOnGround) {
      // Stretched leap pose in the air
      image = sprites.catRuns[0] ?? sprites.cat;
    } else if (sprites.catRuns[1]) {
      // Idle / ready pose with legs gathered
      image = sprites.catRuns[1];
    }

    const catYPos = y + bob;
    drawImageCover(ctx, image, x, catYPos, CAT_WIDTH, CAT_HEIGHT);
    const spriteRect = getSpriteDrawRect(image, x, catYPos, CAT_WIDTH, CAT_HEIGHT);
    drawFlagHat(ctx, spriteRect);
    return;
  }

  // Fallback while images load
  ctx.fillStyle = "#e08a3c";
  ctx.fillRect(x, y, CAT_WIDTH, CAT_HEIGHT);
  drawFlagHat(ctx, {
    drawX: x,
    drawY: y,
    drawW: CAT_WIDTH,
    drawH: CAT_HEIGHT,
  });
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

type HudStatus = "ready" | "playing" | "gameover";

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
      "Jump over dogs, collect mice for gold!",
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 16,
    );
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
