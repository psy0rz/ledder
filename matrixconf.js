// import {MatrixRPIupdown} from "./led/MatrixRPIupdown.js";
// import {MatrixWLED} from "./led/MatrixWLED.js";
import {MatrixRPIleftright} from "./src/js/led/MatrixRPIleftright.js";
import {Scheduler} from "./src/js/led/Scheduler.js";

let scheduler = new Scheduler();

export let matrixList=[


    //led cone ding
    // matrixList.push(new MatrixWLED(scheduler, 37, 8, false, false, '192.168.13.176'))

    // 5 x  (8x32) matrix on raspberry
    // matrixList.push(new MatrixRPIupdown(scheduler, 32, 5));
    //
    // ceilingstrip
    // matrixList.push(new MatrixWLED(scheduler, 138, 1, false, false, '192.168.13.247'));
    //
    // pixelflut nurdspace
    // matrixList.push(new MatrixPixelflut(scheduler, "10.208.42.159", 5003, 128, 32))
    // matrixList.push(new MatrixPixelflut(scheduler, "10.208.42.159", 5008, 64, 24))

    // new MatrixRPIleftright(scheduler, 75, 4, 2, 1),
]
