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
  const bumpCount = Math.max(3, Math.round(width / 55));
  const bumps = Array.from({ length: bumpCount }, (_, index) => {
    const t = (index + 0.5) / bumpCount;
    const wobble = Math.sin(index * 1.7 + cloud.id) * 0.04;
    return {
      cx: x + width * (0.12 + t * 0.76),
      r: height * (0.52 + Math.abs(Math.sin(index * 2.1)) * 0.22 + wobble),
    };
  });

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
