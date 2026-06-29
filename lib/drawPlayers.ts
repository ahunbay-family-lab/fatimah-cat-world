const AVATAR_HEIGHT = 88;
const AVATAR_WIDTH = 52;

function drawCatFace(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
) {
  context.fillStyle = "#ffffff";
  context.beginPath();
  context.arc(centerX - 7, centerY - 2, 3, 0, Math.PI * 2);
  context.arc(centerX + 7, centerY - 2, 3, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#1e293b";
  context.beginPath();
  context.arc(centerX - 7, centerY - 2, 1.5, 0, Math.PI * 2);
  context.arc(centerX + 7, centerY - 2, 1.5, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "#ffffff";
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(centerX, centerY + 1);
  context.lineTo(centerX - 2, centerY + 4);
  context.lineTo(centerX + 2, centerY + 4);
  context.closePath();
  context.fill();

  context.beginPath();
  context.moveTo(centerX - 14, centerY);
  context.lineTo(centerX - 20, centerY - 2);
  context.moveTo(centerX - 14, centerY + 4);
  context.lineTo(centerX - 20, centerY + 4);
  context.moveTo(centerX + 14, centerY);
  context.lineTo(centerX + 20, centerY - 2);
  context.moveTo(centerX + 14, centerY + 4);
  context.lineTo(centerX + 20, centerY + 4);
  context.stroke();
}

export function drawBoyPlayer(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
) {
  const top = centerY - AVATAR_HEIGHT / 2;
  const left = centerX - AVATAR_WIDTH / 2;

  context.fillStyle = "#111827";
  context.fillRect(left + 14, top + 58, 10, 24);
  context.fillRect(left + 28, top + 58, 10, 24);

  context.fillStyle = "#ffffff";
  context.fillRect(left + 10, top + 34, 32, 26);
  context.fillStyle = "#e2e8f0";
  context.fillRect(left + 10, top + 34, 32, 4);

  context.fillStyle = "#f5c99b";
  context.beginPath();
  context.arc(centerX, top + 24, 12, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#1e293b";
  context.beginPath();
  context.arc(centerX - 4, top + 23, 1.5, 0, Math.PI * 2);
  context.arc(centerX + 4, top + 23, 1.5, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "#b45309";
  context.lineWidth = 2;
  context.beginPath();
  context.arc(centerX, top + 27, 4, 0.1, Math.PI - 0.1);
  context.stroke();

  context.fillStyle = "#f8fafc";
  context.beginPath();
  context.ellipse(centerX, top + 12, 14, 7, 0, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "#cbd5e1";
  context.lineWidth = 1;
  context.stroke();
}

export function drawGirlPlayer(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
) {
  const top = centerY - AVATAR_HEIGHT / 2;
  const left = centerX - AVATAR_WIDTH / 2;

  context.fillStyle = "#2563eb";
  context.fillRect(left + 14, top + 62, 10, 22);
  context.fillRect(left + 28, top + 62, 10, 22);
  context.fillStyle = "#1d4ed8";
  context.fillRect(left + 14, top + 62, 10, 4);
  context.fillRect(left + 28, top + 62, 10, 4);

  context.fillStyle = "#f472b6";
  context.beginPath();
  context.roundRect(left + 8, top + 34, 36, 30, 6);
  context.fill();

  drawCatFace(context, centerX, top + 48);

  context.fillStyle = "#f5c99b";
  context.beginPath();
  context.arc(centerX, top + 26, 10, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#1e293b";
  context.beginPath();
  context.arc(centerX - 3, top + 25, 1.5, 0, Math.PI * 2);
  context.arc(centerX + 3, top + 25, 1.5, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#111827";
  context.beginPath();
  context.ellipse(centerX, top + 16, 18, 14, 0, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.moveTo(left + 2, top + 20);
  context.quadraticCurveTo(centerX, top + 42, left + AVATAR_WIDTH - 2, top + 20);
  context.lineTo(left + AVATAR_WIDTH - 2, top + 34);
  context.quadraticCurveTo(centerX, top + 48, left + 2, top + 34);
  context.closePath();
  context.fill();
}

export function getPlayerAvatarCenterY(paddleY: number, paddleHeight: number) {
  return paddleY + paddleHeight / 2;
}

export const PLAYER_AVATAR_OFFSET = {
  leftX: 72,
  rightX: 728,
} as const;
