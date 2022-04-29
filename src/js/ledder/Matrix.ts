import {PixelContainer} from "./PixelContainer.js";
import {Scheduler} from "./Scheduler.js";
import {ColorInterface} from "./ColorInterface.js";
import {PresetControl} from "./PresetControl.js";
import {ControlValue} from "./ControlValue.js";

/**
 * The matrix is the display and shows the list of pixels. The subclasses are actual implementations for different display types.
 * Usually its enough to just implement run() and setPixel.
 * run() should call this.scheduler.update() and render() with the prefrerred framerate. (should be 60fps)
 * render() will in turn call setpixel() to set the actual pixels. (there its usually stored in a buffer)
 * run is then reponsible for sending the rendered buffer to the actual display.
 *
 * Pixels() will ddd themself to the matrix.
 */
export abstract class Matrix extends PixelContainer {
  width: number
  height: number
  scheduler: Scheduler
  runScheduler: boolean
  control: PresetControl
  fpsControl: ControlValue

  protected constructor(scheduler, width, height) {
    super();
    this.scheduler = scheduler;
    //note: named preset instead of presetControl to make it more friendly for enduser
    this.control = new PresetControl();
    this.fpsControl = this.control.value("FPS", 60, 1, 120, 1)

    this.width = width;
    this.height = height;
    this.runScheduler = true; //make false if another matrix is running the scheduler.

  }

  render() {
    //render all pixels (pixels render() function wil call our setPixel one or more times)
    for (let i = 0, n = this.pixels.length; i < n; ++i) {
      const p = this.pixels[i];
      p.render(this);
    }
  }

  status() {
    console.log("Matrix pixels: ", this.pixels.length);
  }

  /**
   * Clear all pixels and running intervals
   */
  reset(keepPresets: boolean = false) {
    if (this.runScheduler)
      this.scheduler.clear();

    if (!keepPresets) {
      this.control.clear();
      this.fpsControl = this.control.value("FPS", 60, 1, 120, 1)
    }
    super.reset();


  }


  abstract run();

  abstract setPixel(x: number, y: number, color: ColorInterface);
}


