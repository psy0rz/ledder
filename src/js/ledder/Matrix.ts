import {PixelContainer} from "./PixelContainer.js";
import {Scheduler} from "./Scheduler.js";
import {ColorInterface} from "./ColorInterface.js";
import {ControlValue} from "./ControlValue.js";
import BboxInterface from "./BboxInterface.js";
import {Pixel} from "./Pixel.js";

/**
 * The matrix is the display and shows the list of pixels. The subclasses are actual implementations for different display types.
 * Usually you only need to implement setPixel() to set a pixel and frame() to send the frame and clear the buffer.
 */
export abstract class Matrix extends PixelContainer {

  scheduler: Scheduler
  // runScheduler: boolean
  // fpsControl: ControlValue

  //maximum fps this driver supports
  maxFps=60
  //should frametimes be whole numbers (usefull for ledstream)
  roundFrametime=false

  //actual fps and framedelay (after maxing and rounding)
  fps:number //current fps its running at
  frameMs: number //time of each frame.


  width: number
  height: number

  //to make it compatioble with bboxinterface
  xMin:number
  xMax:number
  yMin:number
  yMax:number

  protected constructor(  width, height) {
    super();

    this.width = width;
    this.height = height;

    this.xMin=0
    this.yMin=0
    this.xMax=width-1
    this.yMax=height-1

  }

  //set matrix fps (usually controlled externally by FPS control)
  setFps(fps:number)
  {

    //limit
    if (fps>this.maxFps)
      fps=this.maxFps

    if (this.roundFrametime) {
      //make sure we have a rounded framedelay. (needed for LedStream)
      this.frameMs = ~~(1000 / fps)
      //readjust fps to account for the rounded framedelay.
      this.fps=1000/this.frameMs
    }
    else {
      //no rounding
      this.frameMs = (1000 / fps)
      this.fps=fps
    }
  }

  //calculate time to number of frames (can be a float!)
  seconds2frames(seconds:number):number
  {
    return (seconds*1000/this.frameMs)
  }

  //bbox of a matrix is the whole screen
  bbox()
  {
    return {
      xMin:0,
      yMin:0,
      xMax: this.width-1,
      yMax: this.height-1
    }
  }

  //recursively renders all pixels in this pixeltree
  render(container:PixelContainer) {
    for (const p of container)
    {
      if (p instanceof Pixel) {
        if (p.color.a !== 0)
          this.setPixel(p.x, p.y, p.color);
      }
      else if (p instanceof PixelContainer)
      {
        this.render(p)
      }
    }
  }

  status() {
    console.log("Matrix pixels: ", this.size);
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

