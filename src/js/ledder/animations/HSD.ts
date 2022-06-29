import {Animation} from "../Animation.js";
import {Pixel} from "../Pixel.js";
import {FontSimple8x8} from "../fonts/FontSimple8x8.js";
import {Display} from "../Display.js";
import {AnimationTwinkle} from "../AnimationTwinkle.js";
import { Color } from "../Color.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import Marquee from "./Marquee.js";
import Nyan from "./AnimationNyan.js";
import {fontSelect} from "../fonts.js";
import {DrawText} from "../draw/DrawText.js";
import FxRotate from "../fx/FxRotate.js";

export default class HSD extends Animation {

  static title = "HSD"
  static description = ""
  static presetDir = "HSD"
  static category = "HSD"

  async run(display: Display, scheduler: Scheduler, control: ControlGroup) {



    new Nyan(display)

    const font = fontSelect(control, 'Font')
    const input = display.control.input('Text', "Atari 2600 ", true)
    const colorControl = control.color("Text color", 100,0,0, 1);
    const charPixels=new DrawText(display, font, input.text, 0, 8, colorControl)

    new AnimationTwinkle(display, charPixels.pixels)
    if (control.switch('Scroll', false, true).enabled) {
      const rotator = new FxRotate(display, "Move")

      await rotator.run(charPixels)
    }



  }

}
