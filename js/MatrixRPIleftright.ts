import {Matrix} from "./Matrix.js"
import leds from "rpi-ws281x-smi"

import {gamma} from "./MatrixWLED.js";


/**
 * Implements an array of "zigzag" ws2812 matrix display on the Raspberry PI
 * This assumes a normal ws2812 ledstrip that is connected in left-right zigzag pattern.
 * Uses rpi-ws281x-smi to drive up to 16 displays in parallel.
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

    const floor_y=~~y;
    const floor_x=~~x;

    if (floor_x&1)
      leds.setPixel(~~(floor_x/this.displayWidth), ((floor_x%this.displayWidth) * this.height) + floor_y, gamma[~~color.r], gamma[~~color.g], gamma[~~color.b], color.a)
    else
      leds.setPixel(~~(floor_x/this.displayWidth), ((floor_x%this.displayWidth) * this.height) + (this.height-floor_y-1),  gamma[~~color.r], gamma[~~color.g], gamma[~~color.b], color.a)

  }


  frame()
  {
    setTimeout(()=>this.frame(), 1000/this.fpsControl.value)

    leds.send(); //timed exactly

    if (this.runScheduler)
      this.scheduler.update();

    leds.clear();
    this.render();

  }

  run() {
    this.frame()
  }

}


