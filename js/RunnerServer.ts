import {Matrix} from "./Matrix.js";
import * as animations from "./animations/all.js";
import {PresetStore} from "./PresetStore.js";
import {PresetValues} from "./PresetValues.js";

/**
 * Server side runner
 */
export class RunnerServer {
  matrix: Matrix
  private presetStore: PresetStore

  constructor(matrix: Matrix, presetStore: PresetStore) {
    this.matrix = matrix
    this.presetStore = presetStore

  }

  /**
   * Runs specified animation with specified preset
   *
   * @param animationName
   * @param preset
   */
  async run(animationName: string, preset: PresetValues) {

    if (animationName in animations) {
      console.log("Runner: starting", animationName, preset)
      this.matrix.reset()

      const animationClass=animations[animationName];

      if (preset)
        this.matrix.preset.load(preset);
      new animationClass(this.matrix)
      return true
    } else
      return false
  }


}


