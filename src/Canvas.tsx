import { useRef, useEffect } from 'react';

import { draw } from './Utils';

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
      const height = canvasRef.current.height;
      const width = canvasRef.current.width;

      if (ctx) {
        const imageData = new Array( height * width * 4).fill(0).map(() => Math.random() * 255);
        draw(canvasRef.current, ctx, new ImageData(new Uint8ClampedArray(imageData), width, height));
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
