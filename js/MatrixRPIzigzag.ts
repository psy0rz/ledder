import {Matrix} from "./Matrix.js"
import leds from "rpi-ws281x-smi"
import {Color} from "./Color.js";


/**
 * Implements an array of "zigzag" matrix display on the Raspberry PI.
 * Uses rpi-ws281x-smi to drive up to 8 displays in parallel.
 * All displays should be oriented from left to right, starting with channel 0.
 */
export class MatrixRPIzigzag extends Matrix {
  private displayWidth: number;

  /*
   * Pretty straight forward: Same width displays oriented as one long marquee from left to right. Should always have 8 as height.
   */
  constructor(scheduler, displayWidth, displays) {
    super(scheduler, displayWidth * displays, 8);
    this.displayWidth=displayWidth

    leds.init(displayWidth*8);


  }

  setPixel(x, y, color) {

    // if (x&1)
    //   leds.setPixel(~~(x/this.displayWidth), ((x%this.displayWidth) * this.height) + y, color.b | color.r << 8 | color.g << 16)
    // else
    //   leds.setPixel(~~(x/this.displayWidth), ((x%this.displayWidth) * this.height) + (this.height-y-1), color.b | color.r << 8 | color.g << 16)
    if (x&1)
      leds.setPixel(~~(x/this.displayWidth), ((x%this.displayWidth) * this.height) + y, color.r, color.g, color.b, color.a)
    else
      leds.setPixel(~~(x/this.displayWidth), ((x%this.displayWidth) * this.height) + (this.height-y-1),  color.r, color.g, color.b, color.a)

  }


  run() {
    let nr=0;
    setInterval(() => {
      leds.send(); //timed exactly

      if (this.runScheduler)
        this.scheduler.update();

      leds.clear();
      this.render();

       nr=(nr+1)%255
      // this.setPixel(2,2,new Color(0,nr,0))
      // leds.setPixel(5,10, nr<<16);


    }, 1000/60);

  }


}
