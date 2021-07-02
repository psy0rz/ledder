import {Matrix} from "./Matrix.js";
import {PixelContainer} from "./PixelContainer.js";

export class Animation extends PixelContainer {

    matrix: Matrix;

    constructor(matrix)
    {
      super();
      this.matrix=matrix;
    }


}
