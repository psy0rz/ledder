import {Display} from "../../ledder/Display.js"
import leds from "rpi-ws281x-smi"

import {gamma} from "./MatrixWLED.js";


/**
 * Implements an array of left "zigzag" matrix displays on the Raspberry PI.
 * I use it for my matrix that uses regular ws2812 ledstrips in a left to right zigzag pattern.
 * Uses rpi-ws281x-smi to drive up to 8 displays in parallel.
 * All displays should be oriented from left to right, starting with channel 0.
 */
export class MatrixRPIleftright extends Display {

    rows: number
    cols: number
    matrixWidth: number
    matrixHeight: number

    /*
     */
    constructor(scheduler, matrixWidth, matrixHeight, rows, cols) {

        super(scheduler, matrixWidth * cols, matrixHeight * rows);

        //width and height is the size of one strip on one channel. e.g. one matrix
        leds.init(matrixWidth * matrixHeight);

        //rows and cols is how those matrixes are layed out
        this.rows = rows;
        this.cols = cols;
        this.matrixWidth = matrixWidth;
        this.matrixHeight = matrixHeight;


    }

    setPixel(x, y, color) {

        const floor_y = (this.height-~~y-1)
        const floor_x = ~~x;

        let channel = ~~(floor_y / this.matrixHeight)

        if (floor_y & 1)
            leds.setPixel(channel, ((floor_y % this.matrixHeight) * this.width) + (this.width - floor_x-1), gamma[~~color.r], gamma[~~color.g], gamma[~~color.b], color.a)
        else
            leds.setPixel(channel, ((floor_y % this.matrixHeight) * this.width) + floor_x, gamma[~~color.r], gamma[~~color.g], gamma[~~color.b], color.a)


    }


    frame() {
        setTimeout(() => this.frame(), 1000 / this.fpsControl.value)

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


