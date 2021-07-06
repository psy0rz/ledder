
import {MatrixWLED} from "./MatrixWLED.js";
import {Scheduler} from "./Scheduler.js";

let scheduler = new Scheduler();
let matrix=new MatrixWLED(scheduler, 37,8, false, false, '192.168.13.176');

import("./AnimationTest.js")
  .then((module) => {
    console.log(module);
    new module.AnimationTest(matrix);
    matrix.run();
  });

// import {AnimationTest} from "./AnimationTest.js";
// new AnimationTest(matrix);
// matrix.run();







