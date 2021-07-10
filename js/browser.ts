import {MatrixCanvas} from "./MatrixCanvas.js";
import { RpcClient } from "./RpcClient.js";
import {Scheduler} from "./Scheduler.js";
import {Runner} from "./Runner.js";
import {AnimationMovingStarsL} from "./animations/AnimationMovingStarsL.js";
import iro from "@jaames/iro";
import ColorPicker = iro.ColorPicker;

let scheduler = new Scheduler();


let matrix = new MatrixCanvas(scheduler, 37, 8, '#matrix', 5, 16);
console.log("hoi");
scheduler.interval(60, () => {
  console.log("chop");
  scheduler.status();
  matrix.status();
  console.log(matrix.controlSet.controls);
  return(true);
});

new AnimationMovingStarsL(matrix);
// matrix.run();

// const runner=new Runner(matrix);
//
//
// function bam(category, name)
// {
//   runner.run( name);
//   rpc.request("run", { name });
//
// }

// let rpc=new RpcClient(()=>
// {
//   bam("tests", "AnimationMovingStarsL");
//
// });

// runner.run( "AnimationMovingStarsL");


ColorPicker(".color",{});
