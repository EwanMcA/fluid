

export const draw = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, imageData: ImageData) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#555';

  ctx.putImageData(imageData, 0, 0);
};
