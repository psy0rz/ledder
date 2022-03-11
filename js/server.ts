import {Scheduler} from "./Scheduler.js";
import {RpcServer} from "./RpcServer.js";
import {RunnerServer} from "./RunnerServer.js";
import {PresetStore} from "./PresetStore.js";
import {MatrixRPIzigzag} from "./MatrixRPIzigzag.js";



const presetStore = new PresetStore("presets")
await presetStore.updateAnimationPreviews(process.argv[2] == 'rebuild');

let rpc = new RpcServer();

let scheduler = new Scheduler();

//cone display
//let matrix1 = new MatrixWLED(scheduler, 37, 8, false, false, '192.168.13.176');
// let matrix1 = new MatrixWLED(scheduler, 37, 8, false, false, '10.0.0.112');
// matrix1.run();


//led display matrix on raspberry
// let matrix1 = new MatrixRPIzigzag(scheduler, 32, 5);
// matrix1.run();


//ceilingstrip
// let matrix2 = new MatrixWLED(scheduler, 138, 1, false, false, '192.168.13.247');
// matrix2.runScheduler=false;
// matrix2.run();

//pixelflut nurdspace
//let matrix1 = new MatrixPixelflut(scheduler, "10.208.42.159", 5003, 128, 32);
//matrix1.run();
//
//pixelflut nurdspace
// let matrix1 = new MatrixPixelflut(scheduler, "10.208.42.159", 5008, 64, 24);
// matrix1.run();


// const runner = new RunnerServer(matrix1, presetStore);


// //default animation
// runner.run("AnimationNyan", {
//   values: {
//     'Star speed': {value: 1.3},
//     'Star twinkle delay': {value: 5.8},
//     'Star color': {r: 87, g: 129, b: 255, a: 0.05},
//     'Star move interval': {value: 3},
//     'Star twinkle interval': {value: 5.8},
//     'Star density': {value: 10},
//     'Fly interval': {value: 3},
//     'Rainbow fade speed': {value: 120},
//     'Rainbow fade randomizer': {value: 0.1},
//     'Nyan move interval': {value: 30},
//     'Nyan wobble interval': {value: 15}
//   },
//   title: 'Untitled',
//   description: ''
// });

// runner.run("Font", await presetStore.load("Font", "nice"))

//RPC bindings

// @ts-ignore
rpc.addMethod("presetStore.getCategories", (params) => presetStore.getCategories(...params))
// @ts-ignore
rpc.addMethod("presetStore.getAnimationList", (params) => presetStore.getAnimationList(...params))
// @ts-ignore
rpc.addMethod("presetStore.load", (params) => presetStore.load(...params))
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



