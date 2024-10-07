export const draw = (ctx: CanvasRenderingContext2D, field) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const fieldWidth = field.length;
  const fieldHeight = field[0].length;
  const scaleX = ctx.canvas.width / fieldWidth;
  const scaleY = ctx.canvas.height / fieldHeight;

  for (let i = 1; i < fieldWidth - 1; i++) {
    for (let j = 1; j < fieldHeight - 1; j++) {
      //const value = (field[i-1][j-1] + field[i+1][j-1]
          //+ field[i-1][j + 1] + field[i+1][j+1])*10 / 4;
      const value = field[i][j];

      // fill in scaled up canvas image data
      for (let x = 0; x < scaleX; x++) {
        for (let y = 0; y < scaleY; y++) {
          const index = ((i * scaleX + x) + (j * scaleY + y) * ctx.canvas.width) * 4;
          imageData.data[index] = 255 * value;
          imageData.data[index + 1] = 255 * value;
          imageData.data[index + 2] = 255 * value;
          imageData.data[index + 3] = 255;
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
};
