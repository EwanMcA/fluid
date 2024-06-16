import { useRef, useEffect } from 'react';

export const draw = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#555';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        draw(canvasRef.current, ctx);
      }
    }

    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    }
  }, []);

  return <canvas id="canvas" ref={canvasRef} width={1400} height={750} />;
};

export default Canvas;
