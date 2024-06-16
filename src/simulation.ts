import { SimulationState } from "./types";

const simulate = (simState: SimulationState) => {
  for (let i = 0; i < simState.width; i++) {
    for (let j = 0; j < simState.height; j++) {
      // vary parabolically with respect to i
      const wave = (Date.now() / 1000) % 10
      const t = Math.pow(i - simState.width * wave + wave, 2) / Math.pow(simState.width * wave + wave, 2);

      simState.dye[i][j] = Math.floor(t * 255);
    }
  }

  return simState;
};

export default simulate;
