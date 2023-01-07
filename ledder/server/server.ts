import {RpcServer} from "./RpcServer.js"
import {RenderLoop} from "./RenderLoop.js"
import ControlGroup from "../ControlGroup.js"
import Display from "../Display.js"
import GammaMapper from "./drivers/GammaMapper.js"
import {config} from "./config.js"
import {presetStore} from "./PresetStore.js"



const settingsControl = new ControlGroup('Global settings')

const gammaMapper = new GammaMapper(settingsControl.group("Display settings"))


//create run all the displayes
let renderLoops: Array<RenderLoop> = []

for (const m of config.displayList) {
    let display: Display
    display = m
    display.gammaMapper = gammaMapper

    let renderLoop = new RenderLoop(display)
    renderLoop.start()
    renderLoop.animationManager.select(config.animation, false)
    renderLoops.push(renderLoop)
}


//RPC bindings
let rpc = new RpcServer()


rpc.addMethod("presetStore.loadAnimationPresetList", async (params) => {
    return await presetStore.loadAnimationPresetList()
})

// rpc.addMethod("context.runner.save", async (params, context) => {
//     if (context.renderLoop)
//         await context.renderLoop.save(params[0])
// })
//
// rpc.addMethod("context.runner.delete", async (params, context) => {
//     if (context.renderLoop)
//         await context.renderLoop.delete()
// })


rpc.addMethod("context.startPreview", async (params, context) => {
    // console.log("start preview")
    await context.startPreview(presetStore, params[0], params[1])
})

rpc.addMethod("context.stopPreview", async (params, context) => {
    context.stopPreview()
})


rpc.addMethod("runner.runName", async (params, context) => {

    if (context.renderLoop)
        await context.renderLoop.animationManager.select(params[0] + "/" + params[1], false)

    for (const runner of renderLoops) {
        await runner.animationManager.select(params[0] + "/" + params[1], false)
    }
})

rpc.addMethod("display.control.updateValue", async (params, context) => {

    if (context.renderLoop)
         await context.renderLoop.animationManager.updateValue(params[0], params[1])

    for (const runner of renderLoops) {
        await runner.animationManager.updateValue(params[0], params[1])
    }
})


rpc.addMethod("settings.get", async (params, context) => {
    return settingsControl

})


rpc.addMethod("settings.updateValue", async (params, context) => {

    try {

        settingsControl.updateValue(params[0], params[1])
    } catch (e) {
        console.error("Error while updating settings value:", e)
    }

})
