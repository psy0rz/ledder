import {PixelContainer} from "./PixelContainer.js";
import {Scheduler} from "./Scheduler.js";
import {ColorInterface} from "./ColorInterface.js";
import {ControlValue} from "./ControlValue.js";

/**
 * The matrix is the display and shows the list of pixels. The subclasses are actual implementations for different display types.
 * Usually you only need to implement setPixel() to set a pixel and frame() to send the frame and clear the buffer.
 */
export abstract class Matrix extends PixelContainer {
  width: number
  height: number
  scheduler: Scheduler
  // runScheduler: boolean
  // fpsControl: ControlValue

  protected constructor(  width, height) {
    super();
    //note: named preset instead of presetControl to make it more friendly for enduser
    //TODO: move out of matrix. fpsControl should be done in Scheduler()
    // this.control = new PresetControl('rootcontrol', 'controls');
    // this.fpsControl = this.scheduler.control.value("FPS", 60, 1, 120, 1)

    this.width = width;
    this.height = height;
    // this.runScheduler = true; //make false if another matrix is running the scheduler.

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
   * Clear all pixels
   */
  // reset(keepPresets: boolean = false) {
  //   if (this.runScheduler)
  //     this.scheduler.clear();
  //
  //   if (!keepPresets) {
  //     this.scheduler.control.clear();
  //     this.fpsControl = this.scheduler.control.value("FPS", 60, 1, 120, 1)
  //   }
  //   super.reset();
  //
  //
  // }


  // abstract run();

  //implemed in driver subclass:

  //set a pixel with specified color, called for all pixels by render()
  abstract setPixel(x: number, y: number, color: ColorInterface);

  //should send the current rendered frame buffer and clear the buffer
  //Parameter is time when the frame should be rendered.
  abstract frame(displayTime: number)

}

