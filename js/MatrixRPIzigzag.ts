import {Matrix} from "./Matrix.js"
import leds from "rpi-ws281x-smi"
import {Color} from "./Color.js";


/**
 * Implements an array of "zigzag" matrix display on the Raspberry PI.
 * Uses rpi-ws281x-smi to drive up to 8 displays in parallel.
 * All displays should be oriented from left to right, starting with channel 0.
 */
export class MatrixRPIzigzag extends Matrix {
  /*
   * Pretty straight forward: Same width displays oriented as one long marquee from left to right. Should always have 8 as height.
   */
  constructor(scheduler, displayWidth, displays) {
    super(scheduler, displayWidth * displays, 8);

    leds.init(displayWidth*8);


  }

  setPixel(x, y, color) {

    if (x&1)
      leds.setPixel(5, (x * this.height) + y, color.r | color.g << 8 | color.b << 16)
    else
      leds.setPixel(5, (x * this.height) + (this.height-y-1), color.r | color.g << 8 | color.b << 16)

    // leds.setPixel(5, (x*this.height)+y, 0x000020);
  }


  run() {
    let nr=0;
    setInterval(() => {
      leds.send(); //timed exactly

      if (this.runScheduler)
        this.scheduler.update();

      leds.clear();
      this.render();

      // nr=(nr+1)%4
      // this.setPixel(nr,7,new Color(255,0,0))

    }, 1000/60);

  }


}
