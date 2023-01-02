import {RpcServer} from "./RpcServer.js";
import {RunnerServer} from "./RunnerServer.js";
import {PresetStore} from "./PresetStore.js";
import mqtt from 'mqtt'
import ControlGroup from "../ControlGroup.js";
import Display from "../Display.js";
import GammaMapper from "./drivers/GammaMapper.js";
import {config} from "./config.js"



const settingsControl = new ControlGroup('Global settings')

const gammaMapper=new GammaMapper(settingsControl.group("Display settings"))

//init preset store
const presetStore = new PresetStore()


//create run all the displayes
let runners:Array<RunnerServer>=[]

for (const m of config.displayList) {
    let display:Display
    display = m
    display.gammaMapper=gammaMapper
    let controlGroup = new ControlGroup('Root')

    let runner = new RunnerServer(display, controlGroup, presetStore)
    runner.startRenderLoop()
    runner.animationManager.select(config.animation, false)
    runners.push(runner)
}




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
        await context.runner.animationManager.select(params[0]+"/"+ params[1], false)

    for (const runner of runners) {
        await runner.animationManager.select(params[0]+"/"+ params[1], false)
    }
})

rpc.addMethod("display.control.updateValue", async (params, context) => {

    if (context.runner)
     context.runner.animationManager.updateValue(params[0], params[1])

    for (const runner of runners) {
        runner.animationManager.updateValue(params[0], params[1])
    }
})



rpc.addMethod("settings.get", async (params, context) => {
    return settingsControl

})


rpc.addMethod("settings.updateValue", async (params, context) => {

    settingsControl.updateValue(params[0], params[1])
})
