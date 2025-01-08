import {RpcServer} from "./RpcServer.js"
import {RenderRealtime} from "./RenderRealtime.js"
import ControlGroup from "../ControlGroup.js"
import GammaMapper from "./drivers/GammaMapper.js"
import {presetStore} from "./PresetStore.js"
import {previewStore} from "./PreviewStore.js"
import {RenderStream} from "./RenderStream.js"
import {DisplayQOISbuffer} from "./drivers/DisplayQOISbuffer.js"
// import {displayDeviceStore} from "./DisplayDeviceStore.js"
import OffsetMapper from "./drivers/OffsetMapper.js"
import {DisplayWebsocket} from "./drivers/DisplayWebsocket.js"
import {config, load} from "./config.js"
import RenderMonitor from "./RenderMonitor.js";
import type {WsContext} from "./WsContext.js";


const settingsControl = new ControlGroup('Global settings')

await load()


const gammaMapper = new GammaMapper(settingsControl.group("Display settings"))


//create run all the displayes
let renderMonitors: Array<RenderMonitor> = []

//TODO: make selectable in gui, m
for (const displayNr in config.displayList) {
    const display = config.displayList[displayNr]
    //FIXME, should be one confirable per display instead of global.
    display.gammaMapper = gammaMapper

    const monitoringDisplay = new DisplayWebsocket(display.width, display.height)
    // monitoringDisplays.push(monitoringDisplay)

    let renderer = new RenderRealtime([display, monitoringDisplay], `Display ${displayNr}`)
    renderer.start()
    renderer.animationManager.select(config.animation, false)

    renderMonitors.push(new RenderMonitor(renderer, monitoringDisplay))

}

//preview renderer
const monitoringDisplay = new DisplayWebsocket(32, 8)
// monitoringDisplays.push(monitoringDisplay)
let previewRenderLoop = new RenderRealtime([monitoringDisplay], `Preview`)
previewRenderLoop.animationManager.select(config.animation, false)
previewRenderLoop.start()
renderMonitors.push(new RenderMonitor(previewRenderLoop, monitoringDisplay))

//RPC bindings
let rpc = new RpcServer()

rpc.addMethod("presetStore.loadAnimationPresetList", async () => {
    return await presetStore.loadAnimationPresetList()
})

rpc.addMethod("animationManager.save", async (context:WsContext, presetName) => {
    await context.renderMonitor.renderer.animationManager.save(presetName)
    await previewStore.render(context.renderMonitor.renderer.animationManager.animationName, context.renderMonitor.renderer.animationManager.presetName)

})

rpc.addMethod("animationManager.delete", async (context:WsContext, presetName) => {
    await context.renderMonitor.renderer.animationManager.delete()
})


rpc.addMethod("context.startMonitoring", async (context:WsContext, rendererId) => {

    renderMonitors[rendererId].addWsContext(context)


})

rpc.addMethod("context.stopMonitoring", async ( context:WsContext) => {
    context.renderMonitor.removeWsContext(context)


})


rpc.addMethod("animationManager.select", async ( context:WsContext, animationAndPresetPath) => {


    await context.renderMonitor.renderer.animationManager.select(animationAndPresetPath, false)

    // }
})

rpc.addMethod("animationManager.updateValue", async (context, path, values) => {

    await context.renderMonitor.renderer.animationManager.updateValue(path,values)

})


rpc.addMethod("settings.get", async () => {
    return settingsControl

})


rpc.addMethod("settings.updateValue", async (context, path, values) => {

    try {

        settingsControl.updateValue(path, values)
    } catch (e) {
        console.error("Error while updating settings value:", e)
    }

})

// rpc.addMethod("displayDeviceStore.list", async (params, context) => {
//     return displayDeviceStore.list()
//
// })

//display device stuff (regular http GET requests)
// rpc.app.get('/get/status/:id', async (req, resp) => {
//     console.log(`Seen display device ${req.params.id}`)
//
//     resp.send(
//         await displayDeviceStore.get(req.params.id).catch((e) => {
//             console.error(e)
//             resp.status(500).send(e)
//
//         })
//     )
//
//
// })

//work in progress
//Stream QOIS frames via a http get request.
//Rendering is as fast as possible, to fill buffers up.
//Client display decides how much data is buffered and consumed.
rpc.app.get('/get/stream/:id', async (req, resp) => {

    // let deviceInfo = await displayDeviceStore.get(req.params.id)

    let matrixzigzag8x32 = new OffsetMapper(32, 8, false)
    matrixzigzag8x32.zigZagY()
    matrixzigzag8x32.flipY()


    const encodedFrameBuffer = []
    const display = new DisplayQOISbuffer(encodedFrameBuffer, matrixzigzag8x32, 256)
    display.gammaMapper = gammaMapper

    const renderer = new RenderStream([display])
    await renderer.animationManager.select("Tests/TestMatrix/default", false)


    await renderer.render(resp, encodedFrameBuffer)


})

