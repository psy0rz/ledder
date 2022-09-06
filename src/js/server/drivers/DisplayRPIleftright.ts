// import {Display} from "../../ledder/Display.js"
// import leds from "rpi-ws281x-smi"

// import {gamma} from "./DisplayWLED.js";


// /**
//  * Implements an array of left "zigzag" display displays on the Raspberry PI.
//  * I use it for my display that uses regular ws2812 ledstrips in a left to right zigzag pattern.
//  * Uses rpi-ws281x-smi to drive up to 8 displays in parallel.
//  * All displays should be oriented from left to right, starting with channel 0.
//  */
// export class DisplayRPIleftright extends Display {

//     rows: number
//     cols: number
//     displayWidth: number
//     displayHeight: number

//     /*
//      */
//     constructor(scheduler, displayWidth, displayHeight, rows, cols) {

//         super(scheduler, displayWidth * cols, displayHeight * rows);

//         //width and height is the size of one strip on one channel. e.g. one display
//         leds.init(displayWidth * displayHeight);

//         //rows and cols is how those displayes are layed out
//         this.rows = rows;
//         this.cols = cols;
//         this.displayWidth = displayWidth;
//         this.displayHeight = displayHeight;


//     }

//     setPixel(x, y, color) {

//         const floor_y = (this.height-~~y-1)
//         const floor_x = ~~x;

//         let channel = ~~(floor_y / this.displayHeight)

//         if (floor_y & 1)
//             leds.setPixel(channel, ((floor_y % this.displayHeight) * this.width) + (this.width - floor_x-1), gamma[~~color.r], gamma[~~color.g], gamma[~~color.b], color.a)
//         else
//             leds.setPixel(channel, ((floor_y % this.displayHeight) * this.width) + floor_x, gamma[~~color.r], gamma[~~color.g], gamma[~~color.b], color.a)


//     }


//     frame() {
//         setTimeout(() => this.frame(), 1000 / this.fpsControl.value)

//         leds.send(); //timed exactly

//         if (this.runScheduler)
//             this.scheduler.update();

//         leds.clear();
//         this.render();

//     }

//     run() {
//         this.frame()
//     }

// }


