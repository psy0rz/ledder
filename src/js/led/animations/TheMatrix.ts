import {Animation} from "../Animation.js";
import {Color} from "../Color.js";
import {Pixel} from "../Pixel.js";
import {random} from "../util.js";
import {AnimationFade} from "../AnimationFade.js";

/**
 * "Rules" of the matrix rain code, by watching the original scene: https://www.youtube.com/watch?v=8ZdpA3p9ZMY :
 *
 * - Every column has a rain trail at random moments
 * - Most trails have the same speed but around 10% as falling with about 50% speed
 * - The trails have a "head" that starts white and quickly fades to dark a green tail. The tail slowly fades out to black
 * - A new trail can only start if the previous head has left the screen. (previous tail may still exist)

 */

export default class TheMatrix extends Animation {

  static category = "Movie FX"
  static title = "The Matrix"
  static description = "Rain code from The Matrix. "
  static presetDir = "The Matrix";



  constructor(matrix) {
    super(matrix);

    const startColor = matrix.preset.color("Start color", 255, 255, 255);
    const endColor = matrix.preset.color("Tail color", 0, 128, 0);
    const fadeStart = matrix.preset.value("Start fade interval", 10, 1, 120, 1);
    const fadeTail = matrix.preset.value("Tail fade interval", 30, 1, 120, 1);
    const speed = matrix.preset.value("Fall interval", 5, 1, 30, 0.1);
    const createinterval = matrix.preset.value("Create interval", 1, 1, 40, 1);

    const slowprecentage = matrix.preset.value("Slow trials (percent)", 10, 0, 100, 1);
    const speedSlow = matrix.preset.value("Slow fall interval", 10, 1, 100, 1);

    const black = new Color(0, 0, 0)


    let trails = []

    matrix.scheduler.intervalControlled(createinterval, () => {

      //start new trail
      let x = random(0, matrix.width - 1)
      let y = matrix.height - 1;

      //1 trail-head per column max.
      if (trails[x])
        return

      trails[x] = true

      let thisSpeed;
      if (random(1,100)<=slowprecentage.value)
        thisSpeed=speedSlow.value
      else
        thisSpeed=speed.value

      matrix.scheduler.interval(thisSpeed, () => {

        //add pixel to trail
        if (y >= 0) {
          let color = new Color(startColor.r, startColor.g, startColor.b);
          const p = new Pixel(matrix, x, y, color);

          //first fade to end color
          new AnimationFade(matrix, color, endColor, fadeStart).promise.then(() => {
            //then fade to black
            new AnimationFade(matrix, color, black, fadeTail).promise.then(() => {
              //then destroy
              matrix.removePixel(p)
            })
          })
        } else {
          trails[x] = false;
          return false
        }
        y--;
      })
    })
  }
}


