export type Cell = { left: number, top: number };

export type SimulationState = {
  velocity: Cell[][];
  nextVelocity: Cell[][];
  density: Cell[][]
  dye: Float32Array[];
  map: Uint8Array[];
};

