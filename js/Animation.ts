import {Matrix} from "./Matrix.js";
import {DrawContainer} from "./DrawContainer.js";

export class Animation extends DrawContainer {

    nextFrame: number;
    intervalFrames: number;

    constructor()
    {
      super();
      this.nextFrame=0;
    }


    setup(matrix) {

    }

    loop(matrix, frameNr) {

    }

    render(matrix: Matrix) {
      for (let i = 0, n = this.pixels.length; i < n; ++i)
      {
        const p = this.pixels[i];
        p.render(matrix);
      }
    }
}
