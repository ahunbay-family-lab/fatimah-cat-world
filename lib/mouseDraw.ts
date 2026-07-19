import { type Mouse } from "@/lib/catGame";

/** Draw a small mouse at its position. */
export function drawMouse(
  ctx: CanvasRenderingContext2D,
  mouse: Mouse,
  frame: number,
) {
  if (mouse.collected) return;

  const x = mouse.x;
  const y = mouse.y;
  const wiggle = Math.sin(frame / 6 + mouse.id) * 0.8;

  ctx.save();

  // Tail
  ctx.strokeStyle = "#b8b8b8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + mouse.height * 0.55);
  ctx.quadraticCurveTo(
    x - 10,
    y + mouse.height * 0.35 + wiggle,
    x - 14,
    y + mouse.height * 0.2,
  );
  ctx.stroke();

  // Body
  ctx.fillStyle = "#9a9a9a";
  ctx.beginPath();
  ctx.ellipse(
    x + mouse.width * 0.45,
    y + mouse.height * 0.55,
    mouse.width * 0.38,
    mouse.height * 0.38,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Head
  ctx.fillStyle = "#a8a8a8";
  ctx.beginPath();
  ctx.arc(x + mouse.width * 0.78, y + mouse.height * 0.45, mouse.height * 0.32, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.fillStyle = "#f2b8c4";
  ctx.beginPath();
  ctx.arc(x + mouse.width * 0.68, y + mouse.height * 0.18, 3.5, 0, Math.PI * 2);
  ctx.arc(x + mouse.width * 0.88, y + mouse.height * 0.2, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = "#111111";
  ctx.beginPath();
  ctx.arc(x + mouse.width * 0.85, y + mouse.height * 0.42, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = "#f2b8c4";
  ctx.beginPath();
  ctx.arc(x + mouse.width * 0.95, y + mouse.height * 0.5, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/** Mouse counter in the top-left corner of the game canvas. */
export function drawGoldHud(ctx: CanvasRenderingContext2D, gold: number) {
  const label = `Mouse: ${Math.floor(gold)}`;

  ctx.save();
  ctx.font = "bold 18px ui-monospace, SFMono-Regular, Menlo, monospace";
  const textW = ctx.measureText(label).width;

  ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
  ctx.strokeStyle = "#b8860b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(10, 8, textW + 36, 30, 6);
  ctx.fill();
  ctx.stroke();

  // Coin icon
  ctx.fillStyle = "#ffd700";
  ctx.beginPath();
  ctx.arc(26, 23, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#b8860b";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#b8860b";
  ctx.font = "bold 11px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textAlign = "center";
  ctx.fillText("G", 26, 27);

  ctx.fillStyle = "#5c4a12";
  ctx.font = "bold 18px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textAlign = "left";
  ctx.fillText(label, 40, 28);
  ctx.restore();
}
