/**
 * Draws a large hat with the East Turkistan flag (Kökbayraq):
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

  // Thick white border so the flag stays extremely visible
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - 3, y - 3, width + 6, height + 6);
  ctx.strokeStyle = "#003366";
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 3, y - 3, width + 6, height + 6);

  ctx.fillStyle = FLAG_BLUE;
  ctx.fillRect(x, y, width, height);

  // Crescent (two overlapping circles)
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

  // Five-pointed star to the right of the crescent
  ctx.fillStyle = "#ffffff";
  const starSize = Math.min(width, height) * 0.18;
  drawStar(ctx, x + width * 0.64, y + height * 0.42, 5, starSize, starSize * 0.4);

  ctx.restore();
}

/**
 * Oversized hat on the cat’s head with a huge East Turkistan flag badge.
 * Drawn above the sprite so it stays extremely visible.
 */
export function drawFlagHat(
  ctx: CanvasRenderingContext2D,
  catX: number,
  catY: number,
  catWidth: number,
  catHeight: number,
) {
  // Sit the hat on the upper-right head area (cat faces right)
  const hatCenterX = catX + catWidth * 0.7;
  const hatTop = catY - catHeight * 0.55;
  const brimWidth = catWidth * 0.85;
  const crownWidth = catWidth * 0.72;
  const crownHeight = catHeight * 0.48;

  ctx.save();

  // Soft shadow under brim
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.beginPath();
  ctx.ellipse(
    hatCenterX,
    hatTop + crownHeight + 7,
    brimWidth * 0.5,
    6,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Hat crown
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(hatCenterX - crownWidth / 2, hatTop, crownWidth, crownHeight);

  // Rounded top of crown
  ctx.beginPath();
  ctx.ellipse(
    hatCenterX,
    hatTop + 4,
    crownWidth / 2,
    8,
    0,
    Math.PI,
    0,
    true,
  );
  ctx.fill();

  // Brim
  ctx.fillStyle = "#111111";
  ctx.beginPath();
  ctx.ellipse(
    hatCenterX,
    hatTop + crownHeight,
    brimWidth / 2,
    8,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Huge flag badge covering most of the hat front
  const flagW = crownWidth * 0.92;
  const flagH = crownHeight * 0.82;
  const flagX = hatCenterX - flagW / 2;
  const flagY = hatTop + crownHeight * 0.1;
  drawEastTurkistanFlag(ctx, flagX, flagY, flagW, flagH);

  // Extra tall flag on a pole — impossible to miss
  const poleX = hatCenterX + crownWidth * 0.48;
  const poleTop = hatTop - 28;
  ctx.strokeStyle = "#444444";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(poleX, hatTop + 6);
  ctx.lineTo(poleX, poleTop);
  ctx.stroke();
  drawEastTurkistanFlag(ctx, poleX + 1, poleTop, 34, 22);

  ctx.restore();
}
