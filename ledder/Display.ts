import PixelContainer from "./PixelContainer.js";
import Scheduler from "./Scheduler.js";
import ColorInterface from "./ColorInterface.js";
import Pixel from "./Pixel.js";
import GammaMapper from "./drivers/GammaMapper.js";

/**
 * The display renders a pixelcontainer to an actual display.
 * The subclasses are actual implementations for different display types.
 * Usually you only need to implement setPixel() to set a pixel and frame() to send the frame and clear the buffer.
 */
export  default abstract class Display  {

  // runScheduler: boolean
  // fpsControl: ControlValue

  //maximum fps this driver supports
  maxFps=60
  //should frametimes be whole numbers (usefull for ledstream)
  roundFrametime=false

  //current fps its running at (after maxing and rounding)
  fps:number
  //current frame delay (after maxing and rounding)
  frameMs: number


  width: number
  height: number

  //to make it compatioble with Boxinterface
  xMin:number
  xMax:number
  yMin:number
  yMax:number
  // private colors: Set<ColorInterface>;

  //set in server.ts
  gammaMapper: GammaMapper

  protected constructor(  width, height) {

    this.width = width;
    this.height = height;

    this.xMin=0
    this.yMin=0
    this.xMax=width-1
    this.yMax=height-1

    // this.colors=new Set()
  }

  //set display fps (usually controlled externally by FPS control)
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

  //bbox of a display is the whole screen
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
        if (p.color.a !== 0) {
          this.setPixel(p.x, p.y, p.color);
          // this.colors.add(p.color)
        }
      }
      else if (p instanceof PixelContainer)
      {
        this.render(p)
      }
    }
    // if (container===this)
    // {
    //   console.log("Total colors: ", this.colors.size)
    // }
  }

  status() {
    // console.log("Matrix pixels: ", this.size);
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

