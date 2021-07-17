import {Matrix} from "./Matrix.js";
import * as animations from "./animations/all.js";
import {PresetStore} from "./PresetStore.js";
import {PresetControl} from "./PresetControl.js";

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
   * @param presetName
   */
  run(animationName: string, presetName: string) {
    if (animationName in animations) {
      console.log("Runner: starting", animationName, presetName)
      this.matrix.clear()
      if (presetName)
        this.matrix.preset.load(this.presetStore.load(animationName, presetName));
      new animations[animationName](this.matrix)
      return true
    } else
      return false
  }
}
