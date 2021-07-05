
import {MatrixWLED} from "./MatrixWLED.js";
import {AnimationTest} from "./AnimationTest.js";
import {Scheduler} from "./Scheduler.js";

let scheduler = new Scheduler();
let matrix=new MatrixWLED(scheduler, 37,8, '192.168.13.176');
new AnimationTest(matrix);
matrix.run();







