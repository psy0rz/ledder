import {Scheduler} from "./Scheduler.js";
import {RpcServer} from "./RpcServer.js";
import {RunnerServer} from "./RunnerServer.js";
import {PresetStore} from "./PresetStore.js";
import {MatrixRPIzigzag} from "./MatrixRPIzigzag.js";
import {MatrixWLED} from "./MatrixWLED.js";


let scheduler = new Scheduler();

let matrixList=[]

let startupAnimation="AnimationMarquee"
let startupPresetDir="Marquee"
let startupPresetName="slow"


//cone display
// matrixList.push(new MatrixWLED(scheduler, 37, 8, false, false, '192.168.13.176'))

//led display matrix on raspberry
matrixList.push(new MatrixRPIzigzag(scheduler, 75, 1));

//ceilingstrip
// matrixList.push(new MatrixWLED(scheduler, 138, 1, false, false, '192.168.13.247'));

//pixelflut nurdspace
// matrixList.push(new MatrixPixelflut(scheduler, "10.208.42.159", 5003, 128, 32))
// matrixList.push(new MatrixPixelflut(scheduler, "10.208.42.159", 5008, 64, 24))

//init preset store
const presetStore = new PresetStore("presets")
await presetStore.updateAnimationPreviews(process.argv[2] == 'rebuild');
let startupPreset=await presetStore.load(startupPresetDir, startupPresetName)

//create run all the matrixes
let runners=[]
let primary=true;
for ( const matrix of matrixList)
{
  //first one is primary scheduler
  matrix.runScheduler=primary
  primary=false;
  matrix.run()

  let runner=new RunnerServer(matrix, presetStore)
  runner.run(startupAnimation, startupPreset)
  runners.push( runner )
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
  for (const runner of runners)
  {
    runner.run(...params)
  }
})
//todo: make multi-matrix
// @ts-ignore
rpc.addMethod("matrix.preset.updateValue", (params) =>  {
  for (const matrix of matrixList)
  {
    matrix.preset.updateValue(...params)
  }
})



