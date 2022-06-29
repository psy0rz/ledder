import {Animation} from "../Animation.js";
import {random} from "../util.js";
import {AnimationMove} from "../AnimationMove.js";
import {Pixel} from "../Pixel.js";
import {AnimationFade} from "../AnimationFade.js";
import {Color} from "../Color.js";

export default class Rain extends Animation {

  static category = "Misc"
  static title = "Rain"
  static description = "not finished"
  static presetDir = "Rain"


  constructor(display) {
    super(display);

    const startColor = display.control.color("Start color", 255, 255, 255);
    const endColor = display.control.color("End color", 0, 128, 0);
    const fade = display.control.value("Fade length", 60);
    const speed = display.control.value("Fall speed", 0.3, 0.1, 2, 0.1);
    const density = display.control.value("Amount of rain", 1, 1, 20, 0.1);

    display.scheduler.interval(20, () => {

      let color=new Color(startColor.r, startColor.g, startColor.b);
      const p = new Pixel(display, random(0, display.width - 2), random(0,display.height - 1), color);
      new AnimationFade(display, color, endColor, fade)

      const mover = new AnimationMove(display, {value:1}, {value:0}, {value:-speed.value})
      mover.addPixel(p);

      //destroy at end
      display.scheduler.interval((display.height)/speed.value, () => {
          mover.destroy();
          return false;
      })

      //schedule creation of next star at random time
      return (density.value);

    })

  }
}

