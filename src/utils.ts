
export const draw = (ctx: CanvasRenderingContext2D, field) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const fieldWidth = field.length;
  const scale = ctx.canvas.width / fieldWidth;

  for (let i = 1; i < fieldWidth - 1; i++) {
    for (let j = 1; j < field[i].length - 1; j++) {
      const value = field[i + 1][j].left - field[i][j].left
          + field[i][j + 1].top - field[i][j].top;

      const cell = (j * fieldWidth * scale + i) * 4 * scale;
      for (let s = 0; s < scale; s++) {
        for (let t = 0; t < scale; t++) {
          const pixel = cell + s * 4 + t * fieldWidth * scale * 4
          imageData.data[pixel] = value < 0 ? -1 * value : 0;
          imageData.data[pixel + 1] = 0;
          imageData.data[pixel + 2] = value > 0 ? value : 0;
          imageData.data[pixel + 3] = 255;
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
};
