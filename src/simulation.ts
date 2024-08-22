import { Cell, SimulationState } from "./types";

const GRAVITY = 9.8;
const DELTA_T = 1/200;

function interpolate(inputX: number, inputY: number, cellWidth: number, cellHeight: number, velocityField: Cell[][], component: keyof Cell) {
    const clampedX = Math.max(0, Math.min(inputX, (velocityField.length - 1) * cellWidth));
    const clampedY = Math.max(0, Math.min(inputY, (velocityField[0].length - 1) * cellHeight));

    const x0 = Math.floor(clampedX / cellWidth);
    const x1 = Math.min(x0 + 1, velocityField.length - 1);
    const y0 = Math.floor(clampedY / cellHeight);
    const y1 = Math.min(y0 + 1, velocityField[0].length - 1);

    const tx = (clampedX - x0 * cellWidth) / cellWidth;
    const ty = (clampedY - y0 * cellHeight) / cellHeight;

    const v00 = velocityField[x0][y0][component];
    const v10 = velocityField[x1][y0][component];
    const v01 = velocityField[x0][y1][component];
    const v11 = velocityField[x1][y1][component];

    const vx0 = v00 * (1 - tx) + v10 * tx;
    const vx1 = v01 * (1 - tx) + v11 * tx;

    return vx0 * (1 - ty) + vx1 * ty;
}

class Simulation {
  width: number;
  height: number;
  velocityIterations: number;
  cellWidth: number;
  cellHeight: number;
  private simulationState: SimulationState;

  constructor(width: number, height: number, velocityIterations: number) {
    // for the offset grid we make an array of arrays, each element of which is an object with left and top properties
    const velocity= Array.from({ length: width }, () => Array.from({ length: height }, () => ({ left: 0, top: 0 })));
    const nextVelocity= Array.from({ length: width }, () => Array.from({ length: height }, () => ({ left: 0, top: 0 })));
    const density = Array.from({ length: width }, () => Array.from({ length: height }, () => ({ left: 0, top: 0 })));
    
    // for scalar quantities like dye, we just make an array of arrays of floats
    const dye: Float32Array[] = Array.from({ length: width }, () => new Float32Array(height).fill(0));
    const map: Uint8Array[] = Array.from({ length: width }, () => new Uint8Array(height).fill(1));

    this.width = width;
    this.height = height;
    this.cellWidth = 0.01;
    this.cellHeight = 0.01;
    this.velocityIterations = velocityIterations;

    this.simulationState = {
      dye,
      velocity,
      nextVelocity,
      density,
      map,
    };

    for (let i = 0; i < width; i++) {
      this.simulationState.map[i][0] = 0;
      this.simulationState.map[i][height - 1] = 0;
    }

    for (let i = 0; i < height; i++) {
      this.simulationState.velocity[2][i] = { left: 1000, top: 0 };
    }

    const rect = document.querySelector('canvas')?.getBoundingClientRect() || { x: 0, y: 0 };
    window.addEventListener('click', (e) => {
      const x = (e.clientX - rect.x) / 5;
      const y = (e.clientY - rect.y) / 5;
      this.simulationState.velocity[Math.floor(x)+2][Math.floor(y)].left = 1000;
      this.simulationState.velocity[Math.floor(x)-2][Math.floor(y)].left = -1000;
    });
  }

  public step() {
    this.applyGravity();
    const velocity = this.simulationState.velocity;
    const map = this.simulationState.map;
    const relaxationFactor = 1.9;

    for (let n = 0; n < this.velocityIterations; n++) {
      for (let i = 1; i < this.width - 2; i++) {
        for (let j = 1; j < this.height - 2; j++) {

          if (map[i][j] === 0) {
            continue;
          }

          const openSides = map[i][j + 1] + map[i + 1][j] + map[i][j - 1] + map[i - 1][j];

          if (openSides === 0) {
            continue;
          }

          // calculate fluid divergence
          const divergence = velocity[i + 1][j].left - velocity[i][j].left
          + velocity[i][j + 1].top - velocity[i][j].top;
          const divergenceFactor = (divergence / openSides) * relaxationFactor;
          
          // update velocities (zero out velocities leading into solid cells)
          velocity[i][j].top += divergenceFactor * map[i][j - 1];
          velocity[i][j].left += divergenceFactor * map[i - 1][j];
          velocity[i + 1][j].left -= divergenceFactor * map[i + 1][j];
          velocity[i][j + 1].top -= divergenceFactor * map[i][j + 1];
        }
      }
    }

    this.advect();
  }

  public applyGravity() {
    for (let i = 1; i < this.width - 1; i++) {
      for (let j = 1; j < this.height - 1; j++) {
        this.simulationState.velocity[i][j].top += GRAVITY * DELTA_T;
      }
    } 
  }

  public getState() {
    return this.simulationState;
  }

  public resetNextVelocity() {
    for (let i = 0; i < this.width - 1; i++) {
      for (let j = 0; j < this.height - 1; j++) {
        this.simulationState.nextVelocity[i][j] = { ...this.simulationState.velocity[i][j] };
      }
    }
  }

  public updateVelocity() {
    for (let i = 0; i < this.width - 1; i++) {
      for (let j = 0; j < this.height - 1; j++) {
        this.simulationState.velocity[i][j] = { ...this.simulationState.nextVelocity[i][j] };
      }
    }
  }

  public advect() {
    this.resetNextVelocity();

    for (let i = 1; i < this.width - 1; i++) {
        for (let j = 1; j < this.height - 1; j++) {
            if (this.simulationState.map[i][j] === 0) {
                continue;
            }

            // calculate new horizontal velocity
            if (this.simulationState.map[i - 1][j] !== 0) {
                const horizontalVelocity = this.simulationState.velocity[i][j].left;

                const verticalVelocity = (
                    this.simulationState.velocity[i - 1][j].top + this.simulationState.velocity[i][j].top +
                    this.simulationState.velocity[i - 1][j + 1].top + this.simulationState.velocity[i][j + 1].top
                ) / 4;

                const x = (this.cellWidth * i) - horizontalVelocity * DELTA_T;
                const y = (this.cellHeight * j + this.cellHeight / 2) - verticalVelocity * DELTA_T;

                this.simulationState.nextVelocity[i][j].left = interpolate(
                    x, y, this.cellWidth, this.cellHeight, this.simulationState.velocity, 'left'
                );
            }

            // calculate new vertical velocity
            if (this.simulationState.map[i][j - 1] !== 0) {
                const horizontalVelocity = (
                    this.simulationState.velocity[i][j - 1].left + this.simulationState.velocity[i + 1][j - 1].left +
                    this.simulationState.velocity[i][j].left + this.simulationState.velocity[i + 1][j].left
                ) / 4;
                const verticalVelocity = this.simulationState.velocity[i][j].top;

                const x = (this.cellWidth * i + this.cellWidth / 2) - horizontalVelocity * DELTA_T;
                const y = (this.cellHeight * j) - verticalVelocity * DELTA_T;

                this.simulationState.nextVelocity[i][j].top = interpolate(
                    x, y, this.cellWidth, this.cellHeight, this.simulationState.velocity, 'top'
                );
            }
        }
    }

    this.updateVelocity();
  }
}

export default Simulation;
