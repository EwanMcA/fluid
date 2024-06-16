import { useEffect, useRef} from 'react'
import './App.css'

import { SimulationState } from './types'

import simulate from './simulation'
import { draw } from './utils'
import Canvas from './Canvas'

const WIDTH = 1500;
const HEIGHT = 750;

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    document.title = 'Fluid Simulation'
    const ctx = canvasRef.current?.getContext('2d');
    const simState: SimulationState = {
      width: WIDTH,
      height: HEIGHT * 4,
      dye: new Array(WIDTH).fill(0).map(() => new Float32Array(HEIGHT * 4)),
      density: new Array(WIDTH).fill(0).map(() => new Float32Array(HEIGHT * 4)),
      velocity: new Array(WIDTH).fill(0).map(() => new Float32Array(HEIGHT * 4)),
    }
      
    setInterval(() => {
      console.log('Starting simulation');
      simulate(simState);

      if (ctx) {
        draw(ctx, simState.dye);
      }
    }, 1000 / 60);
  }, [])

  return (
    <>
      <h1>Fluid Simulation</h1>
      <Canvas canvasRef={canvasRef} width={WIDTH} height={HEIGHT} />
    </>
  )
}

export default App
