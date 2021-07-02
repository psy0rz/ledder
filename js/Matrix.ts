import {Animation} from "./Animation.js";
import {PixelContainer} from "./PixelContainer.js";
import {Scheduler} from "./Scheduler.js";

export abstract class Matrix extends PixelContainer {
  width: number;
  height: number;
  scheduler: Scheduler;

  protected constructor(scheduler, width, height) {
    super();
    this.scheduler=scheduler;
    this.width = width;
    this.height = height;
  }

  render() {
    //render all pixels (pixels render() function wil call our setPixel one or more times)
    for (let i = 0, n = this.pixels.length; i < n; ++i) {
      const p = this.pixels[i];
      p.render(this);
    }
  }


  abstract run();
  abstract setPixel(x, y, r, g, b, a);
}


