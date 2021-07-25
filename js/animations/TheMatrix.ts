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
    const fade = matrix.preset.value("Fade white interval", 60, 1, 120, 1);
    const fadeout = matrix.preset.value("Fade out interval", 60, 1, 120, 1);
    const speed = matrix.preset.value("Fall interval", 10, 1, 20, 1);
    const createinterval = matrix.preset.value("Create interval", 1, 1, 40, 1);


    let xActive = []

    matrix.scheduler.intervalControlled(createinterval, () => {

      //start new trail
      let y = matrix.height - 1;
      let pixels = []

      let x = random(0, matrix.width - 1)

      //1 trail per column max.
      if (xActive[x]!==undefined && xActive[x].length)
        return

      xActive[x]=[]

      //add pixels to trail
      matrix.scheduler.interval(random(speed.value - 1, speed.value + 1), () => {

        if (y >= 0) {
          let color = new Color(startColor.r, startColor.g, startColor.b);
          const p = new Pixel(matrix, x, y, color);
          pixels.unshift(p);
          xActive[x].push(p);
          new AnimationFade(matrix, color, endColor, fade)

        }

        if (y<matrix.height/2)
        {
          //fade out
          const p=pixels.pop();
          if (p)
            new AnimationFade(matrix, p.color, new Color(0,0,0), fadeout)
        }
        y = y - 1;

        //remove
        if (y < -20) {
          //remove all
          matrix.removePixels(xActive[x])
          xActive[x]=[];
          return false
        }


      })
    })

  }
}
