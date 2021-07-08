import {Scheduler} from "./Scheduler.js";
import {MatrixWLED} from "./MatrixWLED.js";
import {RpcServer} from "./RpcServer.js";
import {Runner} from "./Runner.js";

let rpc = new RpcServer();

let scheduler = new Scheduler();
let matrix = new MatrixWLED(scheduler, 37, 8, false, false, '192.168.13.176');

const runner=new Runner(matrix);


rpc.addMethod("run", ({name}) => {
  runner.run( name);
});


matrix.run();






