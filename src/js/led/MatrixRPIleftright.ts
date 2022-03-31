import {Matrix} from "./Matrix.js"
import leds from "rpi-ws281x-smi"

import {gamma} from "./MatrixWLED.js";


/**
 * Implements an array of left "zigzag" matrix displays on the Raspberry PI.
 * I use it for my matrix that uses regular ws2812 ledstrips in a left to right zigzag pattern.
 * Uses rpi-ws281x-smi to drive up to 8 displays in parallel.
 * All displays should be oriented from left to right, starting with channel 0.
 */
export class MatrixRPIleftright extends Matrix {
  private displayWidth: number;

  /*
   */
  constructor(scheduler, width, height) {
    super(scheduler, width, height);

    leds.init(width*height);


  }

  setPixel(x, y, color) {

    const floor_y=~~y;
    const floor_x=~~x;

    // if (floor_y&1)
    leds.setPixel(0, (floor_y*this.width)+floor_x, gamma[~~color.r], gamma[~~color.g], gamma[~~color.b], color.a)
    // else
    //   leds.setPixel(0, (floor_y*this.width)+(this.width-floor_x), gamma[~~color.r], gamma[~~color.g], gamma[~~color.b], color.a)


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


