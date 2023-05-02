export function drawSegment(ctx, [mx, my], [tx, ty], color) {
  const scale = 1.2;
  ctx.beginPath();
  ctx.moveTo(mx * scale, my * scale);
  ctx.lineTo(tx * scale, ty * scale);
  ctx.lineWidth = 5;
  ctx.strokeStyle = color;
  ctx.stroke();
}

export function drawPoint(ctx, x, y, r, color) {
  const scale = 1.2;
  ctx.beginPath();
  ctx.arc(x * scale, y * scale, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}
