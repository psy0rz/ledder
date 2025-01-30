import {RpcServer} from "./RpcServer.js"
import {RenderRealtime} from "./RenderRealtime.js"
import ControlGroup from "../ControlGroup.js"
import GammaMapper from "./drivers/GammaMapper.js"
import {presetStore} from "./PresetStore.js"
import {RenderStream} from "./RenderStream.js"
import {DisplayQOIShttp} from "./drivers/DisplayQOIShttp.js"
// import {displayDeviceStore} from "./DisplayDeviceStore.js"
import OffsetMapper from "./drivers/OffsetMapper.js"
import {config, load} from "./config.js"
import RenderMonitor from "./RenderMonitor.js";
import type {WsContext} from "./WsContext.js";


const settingsControl = new ControlGroup('Global settings')

await load()


const gammaMapper = new GammaMapper(settingsControl.group("Display settings"))


let renderMonitors: Array<RenderMonitor> = []
let streamingRenderers: Array<RenderRealtime> = []
let httpDisplays: Array<DisplayQOIShttp> = []

//create preview renderer
let renderer = new RenderRealtime(`Preview`)
await renderer.animationManager.select(config.animation, false)
const previewRenderMonitor = new RenderMonitor(renderer)
renderMonitors.push(previewRenderMonitor)

//create actual realtime displays
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

//create actual streaming displays
for (const displayNr in config.streamList) {
    const display = config.streamList[displayNr]
    //FIXME, should be one confirable per display instead of global.
    display.gammaMapper = gammaMapper

    // const monitoringDisplay = new DisplayWebsocket(display.width, display.height)
    // monitoringDisplays.push(monitoringDisplay)

    let renderer = new RenderRealtime(`Stream ${displayNr}`)
    await renderer.addDisplay(display)
    httpDisplays.push(display)
    await renderer.animationManager.select(config.animation, false)
    const monitor = new RenderMonitor(renderer)
    renderMonitors.push(monitor)
    streamingRenderers.push(renderer)

}


setInterval(() => {
    for (let renderMonitor of renderMonitors) {
        renderMonitor.sendStats()
    }
}, 1000)


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
        rendererId = 0

    context.notify("monitoring", rendererId)
    await renderMonitors[rendererId].addWsContext(context)


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

rpc.addMethod("changePreviewSize", async (context: WsContext, width, height) => {

    await previewRenderMonitor.changePreviewSize(width, height)

    //also switch the context to the preview display, if it wasnt already
    context.notify("monitoring", 0)
    previewRenderMonitor.addWsContext(context)


})


rpc.app.get('/update/esp32s3.bin', async (req,resp)=>{
    console.log(`Sending update firmware to ${req.ip}`)
    resp.sendFile("/home/psy/ledstream/build-esp32s3/ledstream.bin", (e)=>
    {
        console.log(`Sending update to ${req.ip} done: `,e)

    })

})


//Stream QOIS frames via a http get request.
rpc.app.get('/stream/:id', async (req, resp) => {

    // esp5.4, wifi core 1, contentlength speicifeed: 60-70kbs
    //  esp4.4.8,   "                                :200-400kbs!

    // AMPDU van 6 naar 12
    // WIFI SLP IRAM opt aan
    // WIFI CSI aan                                    360kbs+

    console.log(`Display http connect: ${req.ip}`)

    resp.set('Content-Type', 'application/octet-stream'); // or whatever MIME type suits your data
    resp.set('Content-Length', '100000000');


    const id = 0
    const renderer = streamingRenderers[id]
    const display = httpDisplays[id]

    if (renderer === undefined || display === undefined) {
        resp.sendStatus(500)
        throw ("Display not found")
    }


    display.setResponseHandler(resp)



})

