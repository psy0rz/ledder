import Pixel from "../../Pixel.js";
import PixelList from "../../PixelList.js";
import DrawCircle from "../../draw/DrawCircle.js";
import { random } from "../../utils.js";
import Color from "../../Color.js";
import Animator from "../../Animator.js";
export default class DrawCircleDemo extends Animator {
  async run(box, scheduler, controls) {
    const fpsControl = controls.value("FPS", 6, 1, 60, 1);
    fpsControl.onChange(() => {
      scheduler.setFps(fpsControl.value);
    });
    let framebuffer = new PixelList();
    box.add(framebuffer);
    scheduler.interval(1, () => {
      framebuffer.clear();
      framebuffer.add(new DrawCircle(random(0, box.width()), random(0, box.height()), random(1, box.height() / 2), new Color(random(0, 255), random(0, 255), random(0, 255))));
    });
  }
}
DrawCircleDemo.title = "WallieOnline DrawCircle";
DrawCircleDemo.description = "Midpoint circle algorithm demo";
