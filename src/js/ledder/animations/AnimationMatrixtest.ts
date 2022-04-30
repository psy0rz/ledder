
import {Pixel} from "../Pixel.js";
import {Animation} from "../Animation.js";
import {AnimationBlink} from "../AnimationBlink.js";
import {AnimationMove} from "../AnimationMove.js";
import {Matrix} from "../Matrix.js";
import {Color} from "../Color.js";

export default class AnimationMatrixtest extends Animation {

  static title="Matrix test screen"
  static presetDir="Matrix test"
  static description="To verify correct orientation and color configuration of a matrix"


  /**
   * Test matrix orientation, border limit, colors and smoothness.
   * @param matrix
   */
  constructor(matrix: Matrix) {
        super(matrix);


        //color bar
        for (let x = 0; x < matrix.width; x++) {
            const c = 255 / matrix.width * (x + 1);
            new Pixel(matrix, x, 4, new Color(c, 0, 0));
            new Pixel(matrix, x, 3, new Color(0, c, 0));
            new Pixel(matrix, x, 2, new Color(0, 0, c));
            new Pixel(matrix, x, 1, new Color(c, c, c));
        }

        //corners
        new Pixel(matrix, 0, 0, new Color(255, 255, 0));

        new Pixel(matrix, matrix.width - 1, matrix.height - 1, new Color(255, 0, 255));
        new Pixel(matrix, 0, matrix.height - 1, new Color(255, 0, 255));
        new Pixel(matrix, matrix.width - 1, 0, new Color(255, 0, 255));

        //blinkers to test update rate (the first one should almost look static and half brightness)
        for (let x = 1; x < 4; x++)
            new AnimationBlink(matrix, x, x).addPixel(new Pixel(matrix, x - 1, 5, new Color(255, 255, 255)));


        //rounding test. pixel on float coordinates, should be 3 white pixels on xy 5 6 7
        new Pixel(matrix, 5.1, 5.1, new Color(255, 255, 255));
        new Pixel(matrix, 6.5, 6.5, new Color(255, 255, 255));
        new Pixel(matrix, 7.9, 7.9, new Color(255, 255, 255));


        //mover to test smoothness
        const m = new Pixel(matrix, 0, 6, new Color(255, 255, 255));
        new AnimationMove(matrix, {value: 1}, {value: 1}, {value: 0} ).addPixel(m);
        matrix.scheduler.interval(matrix.width, () => {
            m.x = 0;
            return true
        })
    }

}
