import {MatrixCanvas} from "./MatrixCanvas.js";
import { RpcClient } from "./RpcClient.js";
import {Scheduler} from "./Scheduler.js";
import {Runner} from "./Runner.js";

let scheduler = new Scheduler();


let matrix = new MatrixCanvas(scheduler, 37, 8, '#matrix', 5, 16);

scheduler.interval(60, () => {
  scheduler.status();
  matrix.status();
});

// new AnimationMatrixtest(matrix);
matrix.run();

const runner=new Runner(matrix);


function bam(category, name)
{
  runner.run( name);
  rpc.request("run", { name });

}

let rpc=new RpcClient(()=>
{
  bam("tests", "AnimationMovingStarsL");

});

runner.run( "AnimationMovingStarsL");


