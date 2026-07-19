/**
 * Draws a Lincoln-style top hat on the cat with the East Turkistan flag.
 * Tall crown sits above the head so the cat's face stays visible.
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

/** Lincoln-style top hat with East Turkistan flag, above the cat's face. */
export function drawFlagHat(ctx: CanvasRenderingContext2D, rect: CatSpriteRect) {
  const { drawX, drawY, drawW, drawH } = rect;

  // Head sits upper-right; brim rests on top of skull (not over eyes)
  const headCenterX = drawX + drawW * 0.78;
  const brimY = drawY + drawH * 0.07;
  const brimW = drawW * 0.44;
  const crownW = drawW * 0.3;
  const crownH = drawH * 0.52;
  const crownLeft = headCenterX - crownW / 2;
  const crownTop = brimY - crownH;

  ctx.save();

  // Wide flat brim (Lincoln hat) — sits on head, face stays below
  ctx.fillStyle = "#141414";
  ctx.beginPath();
  ctx.ellipse(headCenterX, brimY, brimW / 2, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(
    headCenterX - brimW / 2,
    brimY - 2,
    brimW,
    3,
  );

  // Tall stovepipe crown rising upward
  ctx.fillStyle = "#1c1c1c";
  ctx.fillRect(crownLeft, crownTop, crownW, crownH);

  // Slight taper at the top like a classic top hat
  ctx.beginPath();
  ctx.moveTo(crownLeft, crownTop);
  ctx.lineTo(crownLeft + crownW * 0.08, crownTop - 3);
  ctx.lineTo(crownLeft + crownW * 0.92, crownTop - 3);
  ctx.lineTo(crownLeft + crownW, crownTop);
  ctx.closePath();
  ctx.fill();

  // Hat band
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(crownLeft, brimY - crownH + 4, crownW, 3);

  // East Turkistan flag on the front of the tall crown
  const flagW = crownW * 0.82;
  const flagH = crownH * 0.38;
  const flagX = headCenterX - flagW / 2;
  const flagY = crownTop + crownH * 0.22;
  drawEastTurkistanFlag(ctx, flagX, flagY, flagW, flagH);

  ctx.restore();
}
