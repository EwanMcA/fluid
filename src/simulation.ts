import { SimulationState } from "./types";

const simulate = (simState: SimulationState) => {
  for (let i = 0; i < simState.width; i++) {
    for (let j = 0; j < simState.height; j++) {
      const wave = (((Date.now() / 1000) % 5) / 5) * simState.width;
      const t = -(1/50000) * Math.pow((i - wave), 2) + 1;

      simState.dye[i][j] = Math.floor(t * 255);
    }
  }

  return simState;
};

export default simulate;
