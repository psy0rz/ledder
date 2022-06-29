import {RpcServer} from "./RpcServer.js";
import {RunnerServer} from "./RunnerServer.js";
import {PresetStore} from "./PresetStore.js";
import {animationName, matrixList, mqttHost, mqttOpts, nodename, presetName} from "../../../matrixconf.js"
import mqtt from 'mqtt'
import {ControlGroup} from "../ledder/ControlGroup.js";
import {Scheduler} from "../ledder/Scheduler.js";
import {Display} from "../ledder/Display.js";

console.log("starting..")



//init preset store
const presetStore = new PresetStore()

//create run all the matrixes
let runners:Array<RunnerServer>=[]

for (const m of matrixList) {
    let matrix:Display
    matrix=m
    let controlGroup = new ControlGroup('Root controls')

    let runner = new RunnerServer(matrix, controlGroup, presetStore)
    runner.startRenderLoop()
    runner.runName(animationName, presetName)
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
        await runner.runName(pars[0], pars[1])
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

rpc.addMethod("matrix.control.updateValue", async (params, context) => {

    if (context.runner)
        if (context.runner.updateValue(params[0], params[1])) {
            context.runner.restart(true)
        }

    for (const runner of runners) {
        if (runner.updateValue(params[0], params[1]))
            runner.restart(true)
    }
})



