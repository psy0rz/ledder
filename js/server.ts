import {Scheduler} from "./Scheduler.js";
import {MatrixWLED} from "./MatrixWLED.js";
import {RpcServer} from "./RpcServer.js";
import {Runner} from "./Runner.js";
import {AnimationMatrixtest} from "./animations/AnimationMatrixtest.js";
import {AnimationStriptest} from "./animations/AnimationStriptest.js";
import {AnimationMovingStarsL} from "./animations/AnimationMovingStarsL.js";
import {PresetStore} from "./PresetStore.js";
import {Preset} from "./Preset.js";




let rpc = new RpcServer();

let scheduler = new Scheduler();

//cone display
let matrix1 = new MatrixWLED(scheduler, 37, 8, false, false, '192.168.13.176');
matrix1.run();

//ceilingstrip
// let matrix2 = new MatrixWLED(scheduler, 138, 1, false, false, '192.168.13.247');
// matrix2.runScheduler=false;
// matrix2.run();




// new AnimationMatrixtest(matrix1);
// new AnimationMovingStarsL(matrix1);
// new AnimationStriptest(matrix2);



// const runner=new Runner(matrix1);
//
//
// rpc.addMethod("run", ({name}) => {
//   return(runner.run( name));
// });

const presetStore=new PresetStore("presets");

rpc.addMethod("getFiles", () => {
  return(presetStore.getPresets("geert"));

});

const runner=new Runner(matrix1, presetStore);


rpc.addMethod("load", () => {
  return(presetStore.load("geert", "keutel"));

});

rpc.addMethod("save", (data) => {
  return(presetStore.save("geert", "keutel", data));

});

rpc.addMethod("presets", (data) => {
  return(runner.presets());

});






