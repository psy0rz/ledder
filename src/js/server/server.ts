import {RpcServer} from "./RpcServer.js";
import {RunnerServer} from "./RunnerServer.js";
import {PresetStore} from "./PresetStore.js";
import {matrixList, mqttHost, mqttOpts, nodename} from "../../../matrixconf.js"
import mqtt from 'mqtt'

console.log("starting..")


//TODO: move to a settings page
let startupAnimation = "AnimationMarquee"
let startupPresetDir = "Marquee"
let startupPresetName = "slow"

//init preset store
const presetStore = new PresetStore()

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


/////////////////////////mqtt stuff
//TODO: move
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
let rpc = new RpcServer();


rpc.addMethod("presetStore.loadAnimationPresetList", (params) => presetStore.loadAnimationPresetList())

rpc.addMethod("presetStore.load", (params) => presetStore.load(params[0], params[1]))

rpc.addMethod("presetStore.save", (params) => presetStore.save(params[0], params[1], params[2]))

rpc.addMethod("presetStore.createPreview", (params) => presetStore.createPreview(params[0], params[1], params[2]))

rpc.addMethod("presetStore.delete", (params) => presetStore.delete(params[0], params[1]))

rpc.addMethod("context.startPreview", (params, context) => {
   context.startPreview(presetStore, params[0], params[1])
})

rpc.addMethod("context.stopPreview", (params, context) => {
    context.stopPreview()
})

rpc.addMethod("runner.run", (params, context) => {

    if (context.runner)
        context.runner.run(params[0], params[1])

    for (const runner of runners) {
        runner.run(...params)
    }
})

rpc.addMethod("runner.runName", (params, context) => {

    if (context.runner)
        context.runner.runName(params[0], params[1])

    for (const runner of runners) {
        runner.runName(params[0], params[1])
    }
})

rpc.addMethod("matrix.preset.updateValue", (params, context) => {

    if (context.runner)
        context.runner.matrix.preset.updateValue(params[0], params[1])

    for (const matrix of matrixList) {
        matrix.preset.updateValue(...params)
    }
})



