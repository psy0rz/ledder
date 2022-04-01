import {Scheduler} from "./led/Scheduler.js";
import {RpcServer} from "./RpcServer.js";
import {RunnerServer} from "./RunnerServer.js";
import {PresetStore} from "./PresetStore.js";
// import {MatrixRPIupdown} from "./led/MatrixRPIupdown.js";
// import {MatrixWLED} from "./led/MatrixWLED.js";
import {MatrixRPIleftright} from "./led/MatrixRPIleftright.js";

console.log("starting..")

let scheduler = new Scheduler();

let matrixList = []

let startupAnimation = "AnimationMarquee"
let startupPresetDir = "Marquee"
let startupPresetName = "slow"


try {
    //led cone ding
    // matrixList.push(new MatrixWLED(scheduler, 37, 8, false, false, '192.168.13.176'))

    // 5 x  (8x32) matrix on raspberry
    // matrixList.push(new MatrixRPIupdown(scheduler, 32, 5));
    //
    // ceilingstrip
    // matrixList.push(new MatrixWLED(scheduler, 138, 1, false, false, '192.168.13.247'));
    //
    // pixelflut nurdspace
    // matrixList.push(new MatrixPixelflut(scheduler, "10.208.42.159", 5003, 128, 32))
    // matrixList.push(new MatrixPixelflut(scheduler, "10.208.42.159", 5008, 64, 24))


    matrixList.push(new MatrixRPIleftright(scheduler, 75, 4, 2, 1));

} catch (e) {
    console.error(e)
}


//init preset store
const presetStore = new PresetStore("presets")
if (process.argv[2] !='skip')
    presetStore.updateAnimationPreviews(process.argv[2] == 'rebuild');
let startupPreset
presetStore.load(startupPresetDir, startupPresetName).then((r) => {
    startupPreset = r
})

//create run all the matrixes
let runners = []
let primary = true;
for (const matrix of matrixList) {
    //first one is primary scheduler
    matrix.runScheduler = primary
    primary = false;
    matrix.run()

    let runner = new RunnerServer(matrix, presetStore)
    runner.run(startupAnimation, startupPreset)
    runners.push(runner)
}


//RPC bindings
let rpc = new RpcServer();


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
rpc.addMethod("runner.run", (params) => {
    rpc
    for (const runner of runners) {
        runner.run(...params)
    }
})
//todo: make multi-matrix
// @ts-ignore
rpc.addMethod("matrix.preset.updateValue", (params) => {
    for (const matrix of matrixList) {
        matrix.preset.updateValue(...params)
    }
})



