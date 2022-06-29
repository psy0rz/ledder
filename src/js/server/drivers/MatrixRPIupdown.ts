import {Display} from "../../ledder/Display.js"
import leds from "rpi-ws281x-smi"

import {gamma} from "./MatrixWLED.js";


/**
 * Implements an array of up down "zigzag" display display on the Raspberry PI.
 * This is a typical ws2812 8x32 display from ali express. It zigzags up and down.
 * Uses rpi-ws281x-smi to drive up to 8 displays in parallel.
 * All displays should be oriented from left to right, starting with channel 0.
 */
export class MatrixRPIupdown extends Display {
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


