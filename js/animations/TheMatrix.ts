import {Animation} from "../Animation.js";
import {Color} from "../Color.js";
import {Pixel} from "../Pixel.js";
import {random} from "../util.js";
import {AnimationFade} from "../AnimationFade.js";
import {AnimationMove} from "../AnimationMove.js";

export class TheMatrix extends Animation {

  static category = "Movie FX"
  static title = "The Matrix"
  static description = "bla"
  static presetDir = "The Matrix";


  constructor(matrix) {
    super(matrix);

    const startColor = matrix.preset.color("Start color", 255, 255, 255);
    const endColor = matrix.preset.color("End color", 0, 128, 0);
    const fade = matrix.preset.value("Fade length", 60);
    const speed = matrix.preset.value("Fall speed", 0.3, 0.1, 2, 0.1);
    const density = matrix.preset.value("Amount of rain", 1, 1, 20, 0.1);


    matrix.scheduler.interval(60, () => {

      //start new trail

      let y = matrix.height - 1;
      let x = random(0,matrix.width-1)
      let pixels=[];

      matrix.scheduler.interval(10, () => {

        let color = new Color(startColor.r, startColor.g, startColor.b);
        const p=new Pixel(matrix, x, y, color);
        pixels.push(p);
        new AnimationFade(matrix, color, endColor, fade)

        y=y-1;
        return(y>=0)

      })
    })

  }
}
