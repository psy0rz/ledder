import {Matrix} from "./Matrix.js";
import * as animations from "./animations/all.js";

export class Runner {
  matrix: Matrix;

  constructor(matrix) {
    this.matrix = matrix;
  }

  /**
   * Loads and runs specified animation. (should be exported by all.js)
   * @param name
   */
  run(name: string) {
    if (name in animations) {
      this.matrix.clear();
      new animations[name](this.matrix);
      return true;
    } else
      return false;
  }


}
