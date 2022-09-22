import Animation from "../Animation.js";
import Display from "../Display.js";
import Pixel from "../Pixel.js";

import Color from "../Color.js";
import Scheduler from "../Scheduler.js";
import ControlGroup from "../ControlGroup.js";
import FxBlink from "../fx/FxBlink.js";
import PixelContainer from "../PixelContainer.js";
import FxRotate from "../fx/FxRotate.js";

export default class TestStrip extends Animation {

  static title="Strip test"
  static description="To verify functionality of a led strip."

  async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {

    //ends
    display.add(new Pixel(0, 0, new Color(255, 255, 0)));
    display.add(new Pixel( display.width - 1, 0, new Color(255, 0, 255)));


    //blinkers to test update rate (the first one should almost look static and half brightness)
    for (let x = 1; x < 4; x++) {
      const p = new Pixel(x + 2, 0, new Color(100, 100, 0))
      new FxBlink(scheduler, controls.group("blinker" + x), x, x).run(p, display);
    }

    //rgb
    display.add(new Pixel( 7,0, new Color(255,0,0)));
    display.add(new Pixel( 8,0, new Color(0,255,0)));
    display.add(new Pixel( 9,0, new Color(0,0,255)));

    //mover to test smoothness
    const moveContainer=new PixelContainer()
    display.add(moveContainer)
    moveContainer.add( new Pixel(0, 0, new Color(255, 255, 255)));
    new FxRotate(scheduler, controls, 1, 0, 1).run(moveContainer, display)


  }
}
