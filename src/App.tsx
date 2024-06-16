import { useEffect, useRef} from 'react'
import './App.css'

import Simulation from './simulation'

import { draw } from './utils'
import Canvas from './Canvas'

const WIDTH = 150;
const HEIGHT = 70;

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    document.title = 'Fluid Simulation'
    const ctx = canvasRef.current?.getContext('2d');
    const simulation = new Simulation(WIDTH, HEIGHT, 5);
      
    setInterval(() => {
      simulation.step();

      if (ctx) {
        draw(ctx, simulation.getState().velocity);
      }
    }, 1000 / 20);
  }, [])

  return (
    <>
      <h1>Fluid Simulation</h1>
      <Canvas canvasRef={canvasRef} width={WIDTH*10} height={HEIGHT*10} />
    </>
  )
}

export default App
