import {Matrix} from "./led/Matrix.js";
import {PresetStore} from "./PresetStore.js";
import {PresetValues} from "./led/PresetValues.js";

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

      let animationClass=await this.presetStore.loadAnimation(animationName)
      console.log("Runner: starting", animationName, preset)
      this.matrix.reset()

      if (preset)
        this.matrix.preset.load(preset);
      new animationClass(this.matrix)
  }

  //load presetName and run
  async runName(animationName, presetName)
  {
    let preset=undefined
    let animationClass=await this.presetStore.loadAnimation(animationName)
    if (presetName) {
      preset = await this.presetStore.load(animationClass.presetDir, presetName)
    }

    await this.run(animationName, preset)
  }


}


