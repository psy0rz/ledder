import {Animation} from "./Animation.js";
import {PixelContainer} from "./PixelContainer.js";
import {Scheduler} from "./Scheduler.js";

/**
 * The matrix is the display and shows the list of pixels. The subclasses are actual implementations for different display types.
 */
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

  status()
  {
    console.log("Matrix pixels: ",this.pixels.length);
  }

  /**
   * Clear all pixels and running intervals
   */
  clear()
  {
    super.clear();
    this.scheduler.clear();

  }


  abstract run();
  abstract setPixel(x, y, r, g, b, a);
}


