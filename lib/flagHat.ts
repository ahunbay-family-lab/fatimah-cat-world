/**
 * Draws a baseball cap on the cat with the East Turkistan flag (Kökbayraq).
 * Positioned using the cat sprite’s real drawn bounds so it sits on the head.
 */

const FLAG_BLUE = "#0099FF";

export type CatSpriteRect = {
  drawX: number;
  drawY: number;
  drawW: number;
  drawH: number;
};

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outer: number,
  inner: number,
) {
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / spikes) * i - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

export function drawEastTurkistanFlag(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  ctx.save();

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - 1.5, y - 1.5, width + 3, height + 3);
  ctx.strokeStyle = "#003366";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 1.5, y - 1.5, width + 3, height + 3);

  ctx.fillStyle = FLAG_BLUE;
  ctx.fillRect(x, y, width, height);

  const cx = x + width * 0.38;
  const cy = y + height * 0.5;
  const outerR = Math.min(width, height) * 0.3;
  const innerR = outerR * 0.72;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = FLAG_BLUE;
  ctx.beginPath();
  ctx.arc(cx + outerR * 0.38, cy - outerR * 0.08, innerR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  const starSize = Math.min(width, height) * 0.18;
  drawStar(ctx, x + width * 0.64, y + height * 0.42, 5, starSize, starSize * 0.4);

  ctx.restore();
}

/** Baseball cap with East Turkistan flag, anchored on the cat’s drawn head. */
export function drawFlagHat(ctx: CanvasRenderingContext2D, rect: CatSpriteRect) {
  const { drawX, drawY, drawW, drawH } = rect;

  // Head sits upper-right in the sprite (cat faces right)
  const headCenterX = drawX + drawW * 0.8;
  const brimY = drawY + drawH * 0.19;
  const crownW = drawW * 0.34;
  const crownH = drawH * 0.17;
  const crownLeft = headCenterX - crownW * 0.5;
  const crownTop = brimY - crownH + 2;

  ctx.save();

  // Cap crown — overlaps the top of the skull
  ctx.fillStyle = "#1c1c1c";
  ctx.beginPath();
  ctx.moveTo(crownLeft, brimY);
  ctx.lineTo(crownLeft, crownTop + crownH * 0.3);
  ctx.quadraticCurveTo(
    headCenterX,
    crownTop - crownH * 0.08,
    crownLeft + crownW,
    crownTop + crownH * 0.3,
  );
  ctx.lineTo(crownLeft + crownW, brimY);
  ctx.closePath();
  ctx.fill();

  // Brim over the forehead
  ctx.fillStyle = "#141414";
  ctx.beginPath();
  ctx.ellipse(
    headCenterX + crownW * 0.12,
    brimY + 1,
    crownW * 0.38,
    3.5,
    0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Side straps pressed against the head
  ctx.strokeStyle = "#2a2a2a";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(crownLeft + 2, brimY - crownH * 0.35);
  ctx.quadraticCurveTo(
    crownLeft - 1,
    brimY - crownH * 0.05,
    crownLeft + 4,
    brimY + 1,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(crownLeft + crownW - 2, brimY - crownH * 0.35);
  ctx.quadraticCurveTo(
    crownLeft + crownW + 1,
    brimY - crownH * 0.05,
    crownLeft + crownW - 4,
    brimY + 1,
  );
  ctx.stroke();

  // East Turkistan flag patch on the cap front
  const flagW = crownW * 0.7;
  const flagH = crownH * 0.58;
  const flagX = headCenterX - flagW * 0.48;
  const flagY = crownTop + crownH * 0.22;
  drawEastTurkistanFlag(ctx, flagX, flagY, flagW, flagH);

  ctx.restore();
}
