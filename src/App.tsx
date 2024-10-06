import { useEffect, useRef } from "react";

import Simulation, { CELL_TO_PIXEL_RATIO } from "./simulation";

import { draw } from "./utils";
import Canvas from "./Canvas";
import styles from "./App.module.css";

const WIDTH = 240;
const HEIGHT = 135;

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    document.title = "Fluid Simulation";
    const ctx = canvasRef.current?.getContext("2d");
    const simulation = new Simulation(WIDTH, HEIGHT, 50);

    setInterval(() => {
      simulation.step();

      if (ctx) {
        draw(ctx, simulation.getState().dye);
      }
    }, 1000 / 60);
  }, []);

  return (
    <div className={styles.app_container}>
      <h1>Fluid Simulation</h1>
      <Canvas canvasRef={canvasRef} width={WIDTH * CELL_TO_PIXEL_RATIO} height={HEIGHT * CELL_TO_PIXEL_RATIO} />
    </div>
  );
}

export default App;
