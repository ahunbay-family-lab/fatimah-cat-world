import {
  DINO_X,
  GAME_HEIGHT,
  GAME_WIDTH,
  GROUND_Y,
  formatScore,
  type Obstacle,
} from "@/lib/trexGame";

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

export function drawDino(
  ctx: CanvasRenderingContext2D,
  y: number,
  frame: number,
  isPlaying: boolean,
) {
  const x = DINO_X;
  const legSwing = Math.floor(frame / 6) % 2;

  ctx.fillStyle = "#3d5a40";
  ctx.fillRect(x + 8, y + 14, 28, 26);
  ctx.fillRect(x + 26, y + 2, 18, 16);
  ctx.fillRect(x + 40, y + 8, 8, 8);
  ctx.fillStyle = "#f5f0e1";
  ctx.fillRect(x + 36, y + 6, 4, 4);
  ctx.fillStyle = "#3d5a40";
  ctx.fillRect(x, y + 22, 10, 8);

  if (isPlaying) {
    if (legSwing === 0) {
      ctx.fillRect(x + 12, y + 40, 8, 8);
      ctx.fillRect(x + 26, y + 40, 8, 4);
    } else {
      ctx.fillRect(x + 12, y + 40, 8, 4);
      ctx.fillRect(x + 26, y + 40, 8, 8);
    }
  } else {
    ctx.fillRect(x + 12, y + 40, 8, 8);
    ctx.fillRect(x + 26, y + 40, 8, 8);
  }
}

export function drawCactus(ctx: CanvasRenderingContext2D, obstacle: Obstacle) {
  const x = obstacle.x;
  const y = GROUND_Y - obstacle.height;
  ctx.fillStyle = "#2f6b3a";
  ctx.fillRect(x + obstacle.width / 2 - 5, y, 10, obstacle.height);
  ctx.fillRect(x, y + 10, 8, 6);
  ctx.fillRect(x, y + 10, 4, 16);
  ctx.fillRect(x + obstacle.width - 8, y + 18, 8, 6);
  ctx.fillRect(x + obstacle.width - 4, y + 18, 4, 14);
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
    ctx.fillText("Jump over the cacti!", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 16);
  }

  if (status === "gameover") {
    ctx.textAlign = "center";
    ctx.font = "bold 26px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText("GAME OVER", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 8);
    ctx.font = "14px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText("Press Space or Enter to retry", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 18);
  }
}
