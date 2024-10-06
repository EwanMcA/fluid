import { SimulationState } from "./types";

const GRAVITY = 9.8;
const DELTA_T = 1 / 100;
export const CELL_TO_PIXEL_RATIO = 5;

function interpolate(
  inputX: number,
  inputY: number,
  cellWidth: number,
  cellHeight: number,
  fieldWidth: number,
  fieldHeight: number,
  getter: (x: number, y: number) => number,
): number {
  const clampedX = Math.max(0, Math.min(inputX, (fieldWidth - 1) * cellWidth));
  const clampedY = Math.max(
    0,
    Math.min(inputY, (fieldHeight - 1) * cellHeight),
  );

  const cell_i = Math.floor(clampedX / cellWidth);
  const next_cell_i = Math.min(cell_i + 1, fieldWidth - 1);
  const cell_j = Math.floor(clampedY / cellHeight);
  const next_cell_j = Math.min(cell_j + 1, fieldHeight - 1);

  const ratio_adjacent_x = (clampedX - cell_i * cellWidth) / cellWidth;
  const ratio_adjacent_y = (clampedY - cell_j * cellHeight) / cellHeight;

  const f = getter(cell_i, cell_j);
  const f_right = getter(next_cell_i, cell_j);
  const f_down = getter(cell_i, next_cell_j);
  const f_down_right = getter(next_cell_i, next_cell_j);

  return (1 - ratio_adjacent_x) * (1 - ratio_adjacent_y) * f +
    ratio_adjacent_x * (1 - ratio_adjacent_y) * f_right +
    (1 - ratio_adjacent_x) * ratio_adjacent_y * f_down +
    ratio_adjacent_x * ratio_adjacent_y * f_down_right;
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
    const velocity = Array.from({ length: width }, () =>
      Array.from({ length: height }, () => ({ left: 0, top: 0 })),
    );
    const nextVelocity = Array.from({ length: width }, () =>
      Array.from({ length: height }, () => ({ left: 0, top: 0 })),
    );
    const density = Array.from({ length: width }, () =>
      Array.from({ length: height }, () => ({ left: 0, top: 0 })),
    );

    // for scalar quantities like dye, we just make an array of arrays of floats
    const dye: Float32Array[] = Array.from({ length: width }, () =>
      new Float32Array(height).fill(0),
    );
    const map: Uint8Array[] = Array.from({ length: width }, () =>
      new Uint8Array(height).fill(1),
    );

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

    for (let j = 0; j < height; j++) {
      this.simulationState.map[0][j] = 0;
      // Let the dye flow out of the right side of the simulation
      //this.simulationState.map[width - 1][j] = 0;
    }

    const rect = document.querySelector("canvas")?.getBoundingClientRect() || {
      x: 0,
      y: 0,
    };
    window.addEventListener("mousemove", (e) => {
      const x = (e.clientX - rect.x) / CELL_TO_PIXEL_RATIO;
      const y = (e.clientY - rect.y) / CELL_TO_PIXEL_RATIO;
      for (let i = -5; i < 6; i++) {
        for (let j = -5; j < 6; j++) {
          if (Math.pow(i, 2) + Math.pow(j, 2) > 32) continue;
          if (this.simulationState.map[Math.floor(x) + i][Math.floor(y) + j] === 1) {
            this.simulationState.dye[Math.floor(x) + i][Math.floor(y) + j] = 15;
          }
        }
      }
    });
  }

  public addCurrent() {
    for (let j = 1; j < this.height; j++) {
      this.simulationState.velocity[2][j] = { left: 20, top: 0 };
    }
  }

  public addDye() {
    for (let i = Math.floor(this.height/3); i < Math.floor(this.height*2/3); i++) {
      this.simulationState.dye[1][i] = 10;
    }
  }

  public step() {
    //this.applyGravity();
    //this.addDye();
    this.addCurrent();
    const velocity = this.simulationState.velocity;
    const map = this.simulationState.map;
    const relaxationFactor = 1.9;

    for (let n = 0; n < this.velocityIterations; n++) {
      for (let i = 1; i < this.width - 2; i++) {
        for (let j = 1; j < this.height - 2; j++) {
          if (map[i][j] === 0) {
            continue;
          }

          const openSides =
            map[i][j + 1] + map[i + 1][j] + map[i][j - 1] + map[i - 1][j];

          if (openSides === 0) {
            continue;
          }

          // calculate fluid divergence
          const divergence =
            velocity[i + 1][j].left -
            velocity[i][j].left +
            velocity[i][j + 1].top -
            velocity[i][j].top;
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
    this.advectDye();
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
        this.simulationState.nextVelocity[i][j] = {
          ...this.simulationState.velocity[i][j],
        };
      }
    }
  }

  public updateVelocity() {
    for (let i = 0; i < this.width - 1; i++) {
      for (let j = 0; j < this.height - 1; j++) {
        this.simulationState.velocity[i][j] = {
          ...this.simulationState.nextVelocity[i][j],
        };
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

          const verticalVelocity =
            (this.simulationState.velocity[i - 1][j].top +
              this.simulationState.velocity[i][j].top +
              this.simulationState.velocity[i - 1][j + 1].top +
              this.simulationState.velocity[i][j + 1].top) /
            4;

          const x = this.cellWidth * i - horizontalVelocity * DELTA_T;
          const y =
            this.cellHeight * j +
            this.cellHeight / 2 -
            verticalVelocity * DELTA_T;

          this.simulationState.nextVelocity[i][j].left = interpolate(
            x,
            y,
            this.cellWidth,
            this.cellHeight,
            this.width,
            this.height,
            (x: number, y: number) => this.simulationState.velocity[x][y].left,
          );
        }

        // calculate new vertical velocity
        if (this.simulationState.map[i][j - 1] !== 0) {
          const horizontalVelocity =
            (this.simulationState.velocity[i][j - 1].left +
              this.simulationState.velocity[i + 1][j - 1].left +
              this.simulationState.velocity[i][j].left +
              this.simulationState.velocity[i + 1][j].left) /
            4;
          const verticalVelocity = this.simulationState.velocity[i][j].top;

          const x =
            this.cellWidth * i +
            this.cellWidth / 2 -
            horizontalVelocity * DELTA_T;
          const y = this.cellHeight * j - verticalVelocity * DELTA_T;

          this.simulationState.nextVelocity[i][j].top = interpolate(
            x,
            y,
            this.cellWidth,
            this.cellHeight,
            this.width,
            this.height,
            (x: number, y: number) => this.simulationState.velocity[x][y].top,
          );
        }
      }
    }

    this.updateVelocity();
  }

  public advectDye() {
    for (let i = 1; i < this.width - 1; i++) {
      for (let j = 1; j < this.height - 1; j++) {
        if (this.simulationState.map[i][j] === 0) {
          continue;
        }

        const horizontalVelocity =
          (this.simulationState.velocity[i][j].left +
            this.simulationState.velocity[i + 1][j].left) /
          2;
        const verticalVelocity =
          (this.simulationState.velocity[i][j].top +
            this.simulationState.velocity[i][j + 1].top) /
          2;

        const x =
          this.cellWidth * i +
          this.cellWidth / 2 -
          horizontalVelocity * DELTA_T;
        const y =
          this.cellHeight * j +
          this.cellHeight / 2 -
          verticalVelocity * DELTA_T;

        this.simulationState.dye[i][j] = interpolate(
          x,
          y,
          this.cellWidth,
          this.cellHeight,
          this.width,
          this.height,
          (x: number, y: number) => this.simulationState.dye[x][y],
        );
      }
    }
  }
}

export default Simulation;
