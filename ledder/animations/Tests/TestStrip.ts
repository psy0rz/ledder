import PixelBox from "../../PixelBox.js"
import Pixel from "../../Pixel.js"
import FxBlink from "../../fx/FxBlink.js"
import PixelList from "../../PixelList.js"
import FxRotate from "../../fx/FxRotate.js"
import Scheduler from "../../Scheduler.js"
import Color from "../../Color.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"


export default class TestStrip extends Animator {

  static title="Strip test"
  static description="To verify functionality of a led strip."

  async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

    const y=controls.value("y", 0, box.yMin,box.yMax,1, true)

    //ends
    box.add(new Pixel(0, y.value, new Color(255, 255, 0)));
    box.add(new Pixel( box.width() - 1, y.value, new Color(255, 0, 255)));


    //blinkers to test update rate (the first one should almost look static and half brightness)
    for (let x = 1; x < 4; x++) {
      const p = new Pixel(x + 2, y.value, new Color(100, 100, 0))
      new FxBlink(scheduler, controls.group("blinker" + x), x, x).run(p, box);
    }

    //rgb
    box.add(new Pixel( 7,y.value, new Color(255,0,0)));
    box.add(new Pixel( 8,y.value, new Color(0,255,0)));
    box.add(new Pixel( 9,y.value, new Color(0,0,255)));

    //mover to test smoothness
    const moveContainer=new PixelList()
    box.add(moveContainer)
    moveContainer.add( new Pixel(0, y.value, new Color(255, 255, 255)));
    new FxRotate(scheduler, controls, 1, 0, 1).run(moveContainer, box)


  }
}
