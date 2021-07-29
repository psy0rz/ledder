import {Animation} from "../Animation.js";
import {Matrix} from "../Matrix.js";
import {Pixel} from "../Pixel.js";
import {AnimationBlink} from "../AnimationBlink.js";
import {AnimationMove} from "../AnimationMove.js";
import {Color} from "../Color.js";

export class AnimationStriptest extends Animation {

  static title="Strip test"
  static description="To verify functionality of a led strip."
  static presetDir="Strip test"

  constructor(matrix: Matrix) {
    super(matrix);

    //ends
    new Pixel(matrix, 0, 0, new Color(255, 0, 255));
    new Pixel(matrix, matrix.width - 1, 0, new Color(255, 0, 255));

    //blinkers
    for (let x = 1; x < 4; x++)
      new AnimationBlink(matrix, x , x).addPixel(new Pixel(matrix, x +2, 0, new Color(255, 255, 255)));

    //rgb
    new Pixel(matrix, 7,0, new Color(255,0,0));
    new Pixel(matrix, 8,0, new Color(0,255,0));
    new Pixel(matrix, 9,0, new Color(0,0,255));

    //mover to test smoothness
    const m = new Pixel(matrix, 0, 0, new Color(255, 255, 255));
    new AnimationMove(matrix, {value:1}, {value: 1}, {value:0}).addPixel(m);
    matrix.scheduler.interval(matrix.width, () => {
      m.x = 0;
    })


  }
}
