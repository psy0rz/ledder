//twinkle random pixels in specified list by applying AnimationFade to them.
import {Animation} from "./Animation.js";
import {AnimationFade} from "./AnimationFade.js";
import {random} from "./util.js";
import {Color} from "./Color.js";
import {Matrix} from "./Matrix.js";


export class AnimationTwinkle extends Animation {
  constructor(matrix: Matrix, pixels) {
    super(matrix);

    const intervalControl = matrix.control.value("Twinkle speed", 2, 1, 10, 0.1);
    const fadeColor = matrix.control.color("Twinkle color");
    const fadeSpeed = matrix.control.value("Twinkle fade speed", 30, 1, 120, 0.1)

    matrix.scheduler.intervalControlled(intervalControl, () => {
      if (pixels.length) {
        const p = pixels[random(0, pixels.length - 1)];

        let target =p.color;
        p.color = new Color(255, 255, 255);
        let fader=new AnimationFade(matrix, p.color, target, fadeSpeed, {value: 0.1})
        fader.promise.then(()=>{
          p.color=target;
        })
      }
    })
  }
}
