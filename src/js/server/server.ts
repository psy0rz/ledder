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


rpc.addMethod("presetStore.loadAnimationPresetList", async (params) => {
    return await presetStore.loadAnimationPresetList()
})

rpc.addMethod("context.runner.save", async (params, context) =>
{
    if (context.runner)
        await context.runner.save(params[0])
})

rpc.addMethod("context.runner.delete", async (params, context) =>
{
    if (context.runner)
        await context.runner.delete()
})


rpc.addMethod("context.startPreview", async (params, context) => {
   await context.startPreview(presetStore, params[0], params[1])
})

rpc.addMethod("context.stopPreview", async (params, context) => {
    context.stopPreview()
})


rpc.addMethod("runner.runName", async (params, context) => {

    if (context.runner)
        await context.runner.runName(params[0], params[1])

    for (const runner of runners) {
        await runner.runName(params[0], params[1])
    }
})

rpc.addMethod("matrix.preset.updateValue", async (params, context) => {

    if (context.runner)
        await context.runner.matrix.preset.updateValue(params[0], params[1])

    for (const matrix of matrixList) {
        await matrix.preset.updateValue(...params)
    }
})



