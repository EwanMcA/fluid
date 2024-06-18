import { useEffect, useRef} from 'react'

import Simulation from './simulation'

import { draw } from './utils'
import Canvas from './Canvas'
import styles from './App.module.css'

const WIDTH = 300;
const HEIGHT = 150;

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    document.title = 'Fluid Simulation'
    const ctx = canvasRef.current?.getContext('2d');
    const simulation = new Simulation(WIDTH, HEIGHT, 80);
      
    setInterval(() => {
      simulation.step();

      if (ctx) {
        draw(ctx, simulation.getState().velocity);
      }
    }, 1000 / 40);
  }, [])

  return (
    <div className={styles.app_container}>
      <h1>Fluid Simulation</h1>
      <Canvas canvasRef={canvasRef} width={WIDTH*5} height={HEIGHT*5} />
    </div>
  )
}

export default App
