import {Matrix} from "./Matrix.js"
import leds from "rpi-ws281x-smi"

import {gamma} from "./MatrixWLED.js";


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

    const floor_y=~~y;
    const floor_x=~~x;

    if (floor_x&1)
      leds.setPixel(~~(floor_x/this.displayWidth), ((floor_x%this.displayWidth) * this.height) + floor_y, gamma[~~color.r], gamma[~~color.g], gamma[~~color.b], color.a)
    else
      leds.setPixel(~~(floor_x/this.displayWidth), ((floor_x%this.displayWidth) * this.height) + (this.height-floor_y-1),  gamma[~~color.r], gamma[~~color.g], gamma[~~color.b], color.a)

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


