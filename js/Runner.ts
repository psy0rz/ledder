import {Matrix} from "./Matrix.js";
import * as animations from "./animations/all.js";
import {PresetStore} from "./PresetStore.js";

export class Runner {
  matrix: Matrix
  presetStore: PresetStore

  constructor(matrix:Matrix, presetStore:PresetStore) {
    this.matrix = matrix
    this.presetStore=presetStore

  }

  /**
   * Runs specified animation with specified preset
   *
   * @param animationName
   * @param presetName
   */
  run(animationName: string, presetName:string ) {
    if (animationName in animations) {
      this.matrix.clear();
      new animations[animationName](this.matrix);
      return true;
    } else
      return false;
  }

  /**
   * Returns list of all animations and all preset names
   */
  async presets()
  {
    let ret={};

    for (const [name, animation] of Object.entries(animations))
    {
      ret[name]=await this.presetStore.getPresets(name);
    }
    return (ret);
  }


}
