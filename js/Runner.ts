import {Matrix} from "./Matrix.js";
import * as animations from "./animations/all.js";

export class Runner {
  matrix: Matrix

  constructor(matrix: Matrix) {
    this.matrix = matrix

  }

  /**
   * Runs specified animation with specified preset
   *
   * @param animationName
   * @param presetName
   */
  run(animationName: string, presetName: string) {
    if (animationName in animations) {
      this.matrix.clear();
      new animations[animationName](this.matrix);
      return true;
    } else
      return false;
  }



}
