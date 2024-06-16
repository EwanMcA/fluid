import { SimulationState } from "./types";

const simulate = (simState: SimulationState) => {
  for (let i = 0; i < simState.width; i++) {
    for (let j = 0; j < simState.height; j++) {
      // set field to a random value between 0 and 255
      simState.dye[i][j] = Math.floor(Math.random() * 256);
    }
  }

  return simState;
};

export default simulate;
