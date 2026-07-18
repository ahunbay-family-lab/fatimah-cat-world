/**
 * Draws a baseball cap on the cat with the East Turkistan flag (Kökbayraq).
 * The cap sits on the cat’s head — not floating above it.
 */

const FLAG_BLUE = "#0099FF";

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

/** Baseball cap with East Turkistan flag, anchored on the cat’s head. */
export function drawFlagHat(
  ctx: CanvasRenderingContext2D,
  catX: number,
  catY: number,
  catWidth: number,
  catHeight: number,
) {
  // Head area: cat faces right, so the skull is upper-right of the sprite box
  const headCenterX = catX + catWidth * 0.7;
  const headTopY = catY + catHeight * 0.04;
  const crownW = catWidth * 0.42;
  const crownH = catHeight * 0.2;
  const crownLeft = headCenterX - crownW * 0.45;
  const crownTop = headTopY;

  ctx.save();

  // Cap crown (sits on top of head)
  ctx.fillStyle = "#1c1c1c";
  ctx.beginPath();
  ctx.moveTo(crownLeft, crownTop + crownH);
  ctx.lineTo(crownLeft, crownTop + crownH * 0.25);
  ctx.quadraticCurveTo(
    headCenterX,
    crownTop - crownH * 0.15,
    crownLeft + crownW,
    crownTop + crownH * 0.25,
  );
  ctx.lineTo(crownLeft + crownW, crownTop + crownH);
  ctx.closePath();
  ctx.fill();

  // Brim sticks forward (cat faces right) over the forehead
  ctx.fillStyle = "#141414";
  ctx.beginPath();
  ctx.ellipse(
    headCenterX + crownW * 0.18,
    crownTop + crownH * 0.88,
    crownW * 0.42,
    4.5,
    0.12,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Strap lines hugging the sides of the head so it looks attached
  ctx.strokeStyle = "#2a2a2a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(crownLeft + 3, crownTop + crownH * 0.55);
  ctx.quadraticCurveTo(
    crownLeft - 2,
    crownTop + crownH * 0.95,
    crownLeft + 6,
    crownTop + crownH + 2,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(crownLeft + crownW - 3, crownTop + crownH * 0.55);
  ctx.quadraticCurveTo(
    crownLeft + crownW + 2,
    crownTop + crownH * 0.95,
    crownLeft + crownW - 6,
    crownTop + crownH + 2,
  );
  ctx.stroke();

  // East Turkistan flag patch on the front of the cap
  const flagW = crownW * 0.72;
  const flagH = crownH * 0.62;
  const flagX = headCenterX - flagW * 0.42;
  const flagY = crownTop + crownH * 0.18;
  drawEastTurkistanFlag(ctx, flagX, flagY, flagW, flagH);

  ctx.restore();
}
