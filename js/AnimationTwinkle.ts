//twinkle random pixels in specified list by applying AnimationFade to them.
import {Animation} from "./Animation.js";
import {AnimationFade} from "./AnimationFade.js";
import {random} from "./util.js";
import {Color} from "./Color.js";

export class AnimationTwinkle extends Animation {
  constructor(matrix, pixels) {
    super(matrix);

    const intervalControl = matrix.preset.value("Twinkle speed", 2, 1, 10, 0.1);
    const fadeColor = matrix.preset.color("Twinkle color");
    const fadeSpeed = matrix.preset.value("Twinkle fade speed", 30, 1, 120, 0.1)

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
