import type { CloudPlatform } from "@/lib/catGame";

/** Draw a fluffy cloud platform. */
export function drawCloud(
  ctx: CanvasRenderingContext2D,
  cloud: CloudPlatform,
  frame: number,
) {
  const { x, y, width, height } = cloud;
  const bob = Math.sin(frame / 20 + cloud.id) * 1.5;

  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  ctx.strokeStyle = "rgba(180, 210, 230, 0.9)";
  ctx.lineWidth = 1.5;

  const baseY = y + bob;
  const bumps = [
    { cx: x + width * 0.2, r: height * 0.55 },
    { cx: x + width * 0.45, r: height * 0.7 },
    { cx: x + width * 0.72, r: height * 0.6 },
  ];

  ctx.beginPath();
  ctx.moveTo(x, baseY + height * 0.45);
  for (const bump of bumps) {
    ctx.arc(bump.cx, baseY + height * 0.35, bump.r, Math.PI, 0);
  }
  ctx.lineTo(x + width, baseY + height);
  ctx.lineTo(x, baseY + height);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}
