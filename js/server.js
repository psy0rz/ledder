import {Scheduler} from "./Scheduler.js";
import {MatrixWLED} from "./MatrixWLED.js";
import {RpcServer} from "./RpcServer.js";

let rpc=new RpcServer();

rpc.addMethod("test", (params)=>{
  console.log("called met ", params);
})


let scheduler = new Scheduler();
let matrix = new MatrixWLED(scheduler, 37, 8, false, false, '192.168.13.176');

import("./AnimationTest.js")
  .then((module) => {
      new module.AnimationTest(matrix);
      matrix.run();
    }
  );







