import {RpcServer} from "./RpcServer.js"
import {RenderRealtime} from "./RenderRealtime.js"
import ControlGroup from "../ControlGroup.js"
import GammaMapper from "./drivers/GammaMapper.js"
import {presetStore} from "./PresetStore.js"
import {RenderStream} from "./RenderStream.js"
import {DisplayQOISbuffer} from "./drivers/DisplayQOISbuffer.js"
// import {displayDeviceStore} from "./DisplayDeviceStore.js"
import OffsetMapper from "./drivers/OffsetMapper.js"
import {config, load} from "./config.js"
import RenderMonitor from "./RenderMonitor.js";
import type {WsContext} from "./WsContext.js";


const settingsControl = new ControlGroup('Global settings')

await load()


const gammaMapper = new GammaMapper(settingsControl.group("Display settings"))


//create run all the displayes
let renderMonitors: Array<RenderMonitor> = []

for (const displayNr in config.displayList) {
    const display = config.displayList[displayNr]
    //FIXME, should be one confirable per display instead of global.
    display.gammaMapper = gammaMapper

    // const monitoringDisplay = new DisplayWebsocket(display.width, display.height)
    // monitoringDisplays.push(monitoringDisplay)

    let renderer = new RenderRealtime(`Display ${displayNr}`)
    await renderer.addDisplay(display)
    await renderer.animationManager.select(config.animation, false)
    renderMonitors.push(new RenderMonitor(renderer))

}

//preview renderer
let renderer = new RenderRealtime(`Preview`)
await renderer.animationManager.select(config.animation, false)
const previewRenderMonitor=new RenderMonitor(renderer)
renderMonitors.push(previewRenderMonitor)

//RPC bindings
let rpc = new RpcServer()

rpc.addMethod("refresh", async (context: WsContext) => {
    context.notify("animationList", presetStore.animationPresetList)


    let displayList = []
    for (let renderMonitor of renderMonitors) {
        displayList.push(renderMonitor.renderer.description)
    }

    context.notify("displayList", displayList)
})

rpc.addMethod("save", async (context: WsContext, presetName) => {
    await context.renderMonitor.save(presetName)

    //inform everyone of the new list and preview
    for (let renderMonitor of renderMonitors) {
        renderMonitor.notifyAll("animationList", presetStore.animationPresetList)
    }

})

rpc.addMethod("delete", async (context: WsContext) => {

    await context.renderMonitor.delete()

    //inform everyone of the new list
    for (let renderMonitor of renderMonitors) {
        renderMonitor.notifyAll("animationList", presetStore.animationPresetList)
    }

})


rpc.addMethod("startMonitoring", async (context: WsContext, rendererId) => {

    if (renderMonitors[rendererId] === undefined)
        rendererId=0

    await renderMonitors[rendererId].addWsContext(context)
    context.notify("monitoring", rendererId)

})

rpc.addMethod("stopMonitoring", async (context: WsContext) => {
    await context.renderMonitor.removeWsContext(context)


})


rpc.addMethod("select", async (context: WsContext, animationAndPresetPath) => {


    await context.renderMonitor.renderer.animationManager.select(animationAndPresetPath, false)

    // }
})

rpc.addMethod("updateValue", async (context, path, values) => {

    await context.renderMonitor.renderer.animationManager.updateValue(path, values)

})


rpc.addMethod("getSettings", async () => {
    return settingsControl

})


rpc.addMethod("updateSetting", async (context, path, values) => {

    try {

        settingsControl.updateValue(path, values)
    } catch (e) {
        console.error("Error while updating settings value:", e)
    }

})

rpc.addMethod("changePreviewSize", async (context:WsContext, width, height)=>{

    await previewRenderMonitor.changePreviewSize(width, height)


})


//work in progress
//Stream QOIS frames via a http get request.
//Rendering is as fast as possible, to fill buffers up.
//Client display decides how much data is buffered and consumed.
//FIXME
rpc.app.get('/get/stream/:id', async (req, resp) => {

    // let deviceInfo = await displayDeviceStore.get(req.params.id)

    let matrixzigzag8x32 = new OffsetMapper(32, 8, false)
    matrixzigzag8x32.zigZagY()
    matrixzigzag8x32.flipY()


    const encodedFrameBuffer = []
    const display = new DisplayQOISbuffer(encodedFrameBuffer, matrixzigzag8x32, 256)
    display.gammaMapper = gammaMapper

    const renderer = new RenderStream()
    await renderer.animationManager.select("Tests/TestMatrix/default", false)


    await renderer.render(resp, encodedFrameBuffer)


})

