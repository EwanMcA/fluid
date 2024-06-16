import { useEffect } from 'react';

import { draw } from './utils';

const Canvas = ({ width, height, canvasRef }) => {
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    }

    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    }
  }, []);

  return <canvas id="canvas" ref={canvasRef} width={width} height={height} />;
};

export default Canvas;
