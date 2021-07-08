import {MatrixCanvas} from "./MatrixCanvas.js";
import { RpcClient } from "./RpcClient.js";
import {Scheduler} from "./Scheduler.js";

let scheduler = new Scheduler();


let matrix = new MatrixCanvas(scheduler, 37, 8, '#matrix', 5, 16);

scheduler.interval(60, () => {
  scheduler.status();
  matrix.status();
});

// new AnimationTest(matrix);
matrix.run();



let rpc=new RpcClient(()=>
{
  rpc.request("run", {name: "AnimationMatrixtest"}).then(()=>
  {
    console.log("hijlup");
  });

});

