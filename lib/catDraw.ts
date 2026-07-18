import {
  CAT_X,
  GAME_HEIGHT,
  GAME_WIDTH,
  GROUND_Y,
  formatScore,
  type Obstacle,
} from "@/lib/catGame";

export function drawSky(ctx: CanvasRenderingContext2D) {
  const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
  gradient.addColorStop(0, "#7ec8e3");
  gradient.addColorStop(0.55, "#c9e8f5");
  gradient.addColorStop(1, "#e8d5a3");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  ctx.fillStyle = "#f4c15d";
  ctx.beginPath();
  ctx.arc(GAME_WIDTH - 70, 48, 28, 0, Math.PI * 2);
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

/** Tabby cat: orange fur, black stripes, green eyes, white belly. */
export function drawCat(
  ctx: CanvasRenderingContext2D,
  y: number,
  frame: number,
  isPlaying: boolean,
) {
  const x = CAT_X;
  const legSwing = Math.floor(frame / 6) % 2;
  const fur = "#e08a3c";
  const stripe = "#1a1a1a";
  const belly = "#ffffff";

  // Tail
  ctx.fillStyle = fur;
  ctx.fillRect(x, y + 22, 10, 8);
  ctx.fillStyle = stripe;
  ctx.fillRect(x + 2, y + 24, 6, 3);

  // Body
  ctx.fillStyle = fur;
  ctx.fillRect(x + 10, y + 16, 26, 22);
  // White belly
  ctx.fillStyle = belly;
  ctx.fillRect(x + 16, y + 24, 14, 12);

  // Black stripes on body
  ctx.fillStyle = stripe;
  ctx.fillRect(x + 14, y + 18, 3, 18);
  ctx.fillRect(x + 22, y + 18, 3, 10);
  ctx.fillRect(x + 30, y + 18, 3, 18);

  // Head
  ctx.fillStyle = fur;
  ctx.fillRect(x + 28, y + 4, 18, 16);
  // Ears
  ctx.fillRect(x + 28, y, 6, 6);
  ctx.fillRect(x + 40, y, 6, 6);
  ctx.fillStyle = "#f2b8c4";
  ctx.fillRect(x + 30, y + 2, 3, 3);
  ctx.fillRect(x + 41, y + 2, 3, 3);

  // Head stripe
  ctx.fillStyle = stripe;
  ctx.fillRect(x + 35, y + 4, 3, 10);

  // Green eyes
  ctx.fillStyle = "#3dbe4a";
  ctx.fillRect(x + 32, y + 8, 4, 4);
  ctx.fillRect(x + 40, y + 8, 4, 4);
  ctx.fillStyle = "#0f1a12";
  ctx.fillRect(x + 33, y + 9, 2, 2);
  ctx.fillRect(x + 41, y + 9, 2, 2);

  // Nose + mouth
  ctx.fillStyle = "#f2b8c4";
  ctx.fillRect(x + 37, y + 13, 3, 2);
  ctx.fillStyle = stripe;
  ctx.fillRect(x + 36, y + 16, 5, 1);

  // Legs
  ctx.fillStyle = fur;
  if (isPlaying) {
    if (legSwing === 0) {
      ctx.fillRect(x + 14, y + 38, 8, 10);
      ctx.fillRect(x + 28, y + 38, 8, 6);
    } else {
      ctx.fillRect(x + 14, y + 38, 8, 6);
      ctx.fillRect(x + 28, y + 38, 8, 10);
    }
  } else {
    ctx.fillRect(x + 14, y + 38, 8, 10);
    ctx.fillRect(x + 28, y + 38, 8, 10);
  }

  // Paws
  ctx.fillStyle = belly;
  ctx.fillRect(x + 14, y + 46, 8, 2);
  ctx.fillRect(x + 28, y + 46, 8, 2);
}

/** Brown dog with droopy ears, black eyes, and a barking mouth. */
export function drawDog(
  ctx: CanvasRenderingContext2D,
  obstacle: Obstacle,
  frame: number,
) {
  const x = obstacle.x;
  const h = obstacle.height;
  const w = obstacle.width;
  const y = GROUND_Y - h;
  const fur = "#8b5a2b";
  const darkFur = "#5c3a18";
  const barking = Math.floor(frame / 8) % 2 === 0;

  // Body
  ctx.fillStyle = fur;
  ctx.fillRect(x + 6, y + h * 0.35, w - 10, h * 0.45);

  // Head
  ctx.fillRect(x + w - 22, y + 4, 18, 16);

  // Droopy ears
  ctx.fillStyle = darkFur;
  ctx.fillRect(x + w - 24, y + 8, 6, 16);
  ctx.fillRect(x + w - 8, y + 8, 6, 16);

  // Black eyes
  ctx.fillStyle = "#111111";
  ctx.fillRect(x + w - 18, y + 9, 3, 3);
  ctx.fillRect(x + w - 12, y + 9, 3, 3);

  // Snout
  ctx.fillStyle = "#c48952";
  ctx.fillRect(x + w - 16, y + 13, 10, 7);

  // Nose
  ctx.fillStyle = "#111111";
  ctx.fillRect(x + w - 8, y + 14, 3, 3);

  // Barking mouth
  if (barking) {
    ctx.fillStyle = "#3a1f12";
    ctx.fillRect(x + w - 14, y + 18, 8, 4);
    // Bark lines
    ctx.strokeStyle = "#3a1f12";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + w - 2, y + 12);
    ctx.lineTo(x + w + 4, y + 10);
    ctx.moveTo(x + w - 2, y + 16);
    ctx.lineTo(x + w + 5, y + 16);
    ctx.moveTo(x + w - 2, y + 20);
    ctx.lineTo(x + w + 4, y + 22);
    ctx.stroke();
  } else {
    ctx.fillStyle = "#3a1f12";
    ctx.fillRect(x + w - 14, y + 19, 8, 2);
  }

  // Legs
  ctx.fillStyle = fur;
  ctx.fillRect(x + 10, y + h - 12, 7, 12);
  ctx.fillRect(x + w - 18, y + h - 12, 7, 12);

  // Tail
  ctx.fillStyle = darkFur;
  ctx.fillRect(x, y + h * 0.4, 8, 5);
}

type HudStatus = "ready" | "playing" | "gameover";

export function drawHud(
  ctx: CanvasRenderingContext2D,
  status: HudStatus,
  score: number,
  highScore: number,
) {
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
    ctx.fillText("Jump over the barking dogs!", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 16);
  }

  if (status === "gameover") {
    ctx.textAlign = "center";
    ctx.font = "bold 26px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText("GAME OVER", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 8);
    ctx.font = "14px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText("Press Space or Enter to retry", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 18);
  }
}
