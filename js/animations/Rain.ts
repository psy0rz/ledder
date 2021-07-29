import {Animation} from "../Animation.js";
import {random} from "../util.js";
import {AnimationMove} from "../AnimationMove.js";
import {Pixel} from "../Pixel.js";
import {AnimationFade} from "../AnimationFade.js";
import {Color} from "../Color.js";

export class Rain extends Animation {

  static category = "Misc"
  static title = "Rain"
  static description = "not finished"
  static presetDir = "Rain"


  constructor(matrix) {
    super(matrix);

    const startColor = matrix.preset.color("Start color", 255, 255, 255);
    const endColor = matrix.preset.color("End color", 0, 128, 0);
    const fade = matrix.preset.value("Fade length", 60);
    const speed = matrix.preset.value("Fall speed", 0.3, 0.1, 2, 0.1);
    const density = matrix.preset.value("Amount of rain", 1, 1, 20, 0.1);

    matrix.scheduler.interval(20, () => {

      let color=new Color(startColor.r, startColor.g, startColor.b);
      const p = new Pixel(matrix, random(0, matrix.width - 2), random(0,matrix.height - 1), color);
      new AnimationFade(matrix, color, endColor, fade)

      const mover = new AnimationMove(matrix, {value:1}, {value:0}, {value:-speed.value})
      mover.addPixel(p);

      //destroy at end
      matrix.scheduler.interval((matrix.height)/speed.value, () => {
          mover.destroy();
          return false;
      })

      //schedule creation of next star at random time
      return (density.value);

    })

  }
}

