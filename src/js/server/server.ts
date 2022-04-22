import {RpcServer} from "./RpcServer.js";
import {RunnerServer} from "./RunnerServer.js";
import {PresetStore} from "./PresetStore.js";
import {matrixList, mqttHost, mqttOpts, nodename} from "../../../matrixconf.js"
import mqtt from 'mqtt'
import {Scheduler} from "../ledder/Scheduler.js";
import {MatrixWebsocket} from "./drivers/MatrixWebsocket.js";

console.log("starting..")



let startupAnimation = "AnimationMarquee"
let startupPresetDir = "Marquee"
let startupPresetName = "slow"


//init preset store
const presetStore = new PresetStore()

// let startupPreset = new PresetValues()
// try {
//     startupPreset = await presetStore.load(startupPresetDir, startupPresetName)
// } catch (e) {
//     console.error(e)
// }

//create run all the matrixes
let runners = []
let primary = true;
for (const matrix of matrixList) {
    //first one is primary scheduler
    matrix.runScheduler = primary
    primary = false;
    matrix.run()

    let runner = new RunnerServer(matrix, presetStore)
    runner.runName(startupAnimation, startupPresetName)
    runners.push(runner)
}

//test
let scheduler = new Scheduler();
let m=new MatrixWebsocket(scheduler, 75,8, undefined)
m.runScheduler=false
// m.run()
let runner = new RunnerServer(m, presetStore)
runner.runName(startupAnimation, startupPresetName)
runners.push(runner)




/////////////////////////mqtt stuff
const client  = mqtt.connect(mqttHost,mqttOpts)

client.on('connect', ()=> {
    console.log("Connected to ", mqttHost)
    client.subscribe(`/HACKERSPACE/${nodename}/run`, function (err) {
    })
})

client.on('error', (e)=>{
//    console.error("MQTT error: ",e)
});


client.on('message', async  (topic, message) =>{
    let str=message.toString()
    console.log("MQTT received: ",str)
    let pars=str.split('/', 2)

    for (const runner of runners) {
        await runner.runName(...pars)
    }
})


//RPC bindings
let rpc = new RpcServer(m);


rpc.addMethod("presetStore.loadAnimationPresetList", (params) => presetStore.loadAnimationPresetList())

rpc.addMethod("presetStore.load", (params) => presetStore.load(params[0], params[1]))

rpc.addMethod("presetStore.save", (params) => presetStore.save(params[0], params[1], params[2]))

rpc.addMethod("presetStore.createPreview", (params) => presetStore.createPreview(params[0], params[1], params[2]))

rpc.addMethod("presetStore.delete", (params) => presetStore.delete(params[0], params[1]))

rpc.addMethod("runner.run", (params) => {
    for (const runner of runners) {
        runner.run(...params)
    }
})

//todo: make multi-matrix
rpc.addMethod("matrix.preset.updateValue", (params) => {
    for (const matrix of matrixList) {
        matrix.preset.updateValue(...params)
    }
})



