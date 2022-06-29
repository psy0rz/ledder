//twinkle random pixels in specified list by applying AnimationFade to them.
import {Animation} from "./Animation.js";
import {AnimationFade} from "./AnimationFade.js";
import {random} from "./util.js";
import {Color} from "./Color.js";
import {Display} from "./Display.js";


export class AnimationTwinkle extends Animation {
  constructor(display: Display, pixels) {
    super(display);

    const intervalControl = display.control.value("Twinkle speed", 2, 1, 10, 0.1);
    const fadeColor = display.control.color("Twinkle color");
    const fadeSpeed = display.control.value("Twinkle fade speed", 30, 1, 120, 0.1)

    display.scheduler.intervalControlled(intervalControl, () => {
      if (pixels.length) {
        const p = pixels[random(0, pixels.length - 1)];

        let target =p.color;
        p.color = new Color(fadeColor.r, fadeColor.g, fadeColor.b, fadeColor.a);
        let fader=new AnimationFade(display, p.color, target, fadeSpeed, {value: 0.1})
        fader.promise.then(()=>{
          p.color=target;
        })
      }
      return true
    })
  }
}
