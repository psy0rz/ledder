import {Scheduler} from "./Scheduler.js";
import {MatrixWLED} from "./MatrixWLED.js";
import {RpcServer} from "./RpcServer.js";
import {RunnerServer} from "./RunnerServer.js";
import {AnimationMatrixtest} from "./animations/AnimationMatrixtest.js";
import {AnimationStriptest} from "./animations/AnimationStriptest.js";
import {AnimationMovingStarsL} from "./animations/AnimationMovingStarsL.js";
import {PresetStore} from "./PresetStore.js";
import {PresetControl} from "./PresetControl.js";
import {TheMatrix} from "./animations/TheMatrix.js";
import {MatrixApng} from "./MatrixApng.js";
import {PreviewStore} from "./PreviewStore.js";




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

// new AnimationMatrixtest(matrix1);
// new TheMatrix(matrix1);


// const runner=new Runner(matrix1);
//
//
// rpc.addMethod("run", ({name}) => {
//   return(runner.run( name));
// });

const presetStore=new PresetStore("presets");
const runner = new RunnerServer(matrix1, presetStore);


//RPC bindings

// @ts-ignore
rpc.addMethod("presetStore.getCategories", (params) => presetStore.getCategories(...params))
// @ts-ignore
rpc.addMethod("presetStore.getAnimationList", (params) => presetStore.getAnimationList(...params))
// @ts-ignore
rpc.addMethod("presetStore.load",  (params) => presetStore.load(...params))
// @ts-ignore
rpc.addMethod("presetStore.save", (params) => presetStore.save(...params))
// @ts-ignore
rpc.addMethod("presetStore.createPreview", (params) => presetStore.createPreview(...params))
// @ts-ignore
rpc.addMethod("presetStore.delete", (params) => presetStore.delete(...params))
// @ts-ignore
rpc.addMethod("runner.run", (params) => runner.run(...params))
//todo: make multi-matrix
// @ts-ignore
rpc.addMethod("matrix.preset.updateValue", (params) => matrix1.preset.updateValue(...params))



// async function test()
// {
//   let previewStore=new PreviewStore(presetStore, "dist")
//   console.log(await previewStore.renderPreview("AnimationMatrixtest", ""))
//   console.log(await previewStore.renderPreview("AnimationMovingStarsL", ""))
// }
//
// test()
//
//

