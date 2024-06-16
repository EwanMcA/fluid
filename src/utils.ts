
export const draw = (ctx: CanvasRenderingContext2D, field: Float32Array[]) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const fieldWidth = field.length;

  for (let i = 0; i < fieldWidth; i++) {
    for (let j = 0; j < field[i].length; j++) {
      const value = field[i][j];
      const cell = j * fieldWidth + i;
      imageData.data[cell * 4] = value;
      imageData.data[cell * 4 + 1] = value;
      imageData.data[cell * 4 + 2] = value;
      imageData.data[cell * 4 + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
};
