/**
 * Draws a hat with the East Turkistan flag (Kökbayraq):
 * light blue field, white crescent, white star.
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

/** Draw the East Turkistan flag into a rectangle. */
export function drawEastTurkistanFlag(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  ctx.save();

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - 2, y - 2, width + 4, height + 4);
  ctx.strokeStyle = "#003366";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);

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

/** Hat sized to sit on the cat’s head with a visible flag badge. */
export function drawFlagHat(
  ctx: CanvasRenderingContext2D,
  catX: number,
  catY: number,
  catWidth: number,
  catHeight: number,
) {
  const hatCenterX = catX + catWidth * 0.68;
  const hatTop = catY - catHeight * 0.22;
  const brimWidth = catWidth * 0.52;
  const crownWidth = catWidth * 0.46;
  const crownHeight = catHeight * 0.26;

  ctx.save();

  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(
    hatCenterX,
    hatTop + crownHeight + 4,
    brimWidth * 0.48,
    4,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(hatCenterX - crownWidth / 2, hatTop, crownWidth, crownHeight);

  ctx.beginPath();
  ctx.ellipse(
    hatCenterX,
    hatTop + 3,
    crownWidth / 2,
    5,
    0,
    Math.PI,
    0,
    true,
  );
  ctx.fill();

  ctx.fillStyle = "#111111";
  ctx.beginPath();
  ctx.ellipse(
    hatCenterX,
    hatTop + crownHeight,
    brimWidth / 2,
    5,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  const flagW = crownWidth * 0.88;
  const flagH = crownHeight * 0.78;
  const flagX = hatCenterX - flagW / 2;
  const flagY = hatTop + crownHeight * 0.12;
  drawEastTurkistanFlag(ctx, flagX, flagY, flagW, flagH);

  ctx.restore();
}
