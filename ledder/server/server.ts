import {RpcServer} from "./RpcServer.js"
import {RenderRealtime} from "./RenderRealtime.js"
import ControlGroup from "../ControlGroup.js"
import Display from "../Display.js"
import GammaMapper from "./drivers/GammaMapper.js"
import {config} from "./config.js"
import {presetStore} from "./PresetStore.js"
import {previewStore} from "./PreviewStore.js"
import {RenderStream} from "./RenderStream.js"
import {DisplayQOISbuffer} from "./drivers/DisplayQOISbuffer.js"
import {displayDeviceStore} from "./DisplayDeviceStore.js"
import OffsetMapper from "./drivers/OffsetMapper.js"
import {DisplayWebsocket} from "./drivers/DisplayWebsocket.js"


const settingsControl = new ControlGroup('Global settings')

const gammaMapper = new GammaMapper(settingsControl.group("Display settings"))


// console.log("GO")
//  const m=new OffsetMapper(75,16)
// //
//  const d=new DisplayQOISfile(m)
//  d.gammaMapper=gammaMapper
//  const s=new RenderStatic(d)
//  d.openFile('test.qois')
// await s.render('Text/Marquee/HSD',60*60)
// // await s.render('Logos/HSD', 'default',60*60*3)
// d.closeFile()
// console.log("ODNE")


//create run all the displayes
let renderLoops: Array<RenderRealtime> = []
let previewDisplays: Array<DisplayWebsocket> = []

for (const m of config.displayList) {
    let display: Display
    display = m
    display.gammaMapper = gammaMapper

    const displayWebview = new DisplayWebsocket(32, 8)
    previewDisplays.push(displayWebview)

    let renderLoop = new RenderRealtime([display, displayWebview])
    renderLoop.start()
    renderLoop.animationManager.select(config.animation, false)
    renderLoops.push(renderLoop)
}


//RPC bindings
let rpc = new RpcServer()

rpc.addMethod("presetStore.loadAnimationPresetList", async (params) => {
    return await presetStore.loadAnimationPresetList()
})

rpc.addMethod("animationManager.save", async (params, context) => {
    // await context.renderLoop.animationManager.save(params[0])
    // await previewStore.render(context.renderLoop.animationManager.animationName, context.renderLoop.animationManager.presetName)

})

rpc.addMethod("animationManager.delete", async (params, context) => {
    // await context.renderLoop.animationManager.delete()
})


rpc.addMethod("context.startPreview", async (params, context) => {
    // console.log("start preview")
    // await context.startPreview(presetStore, params[0], params[1])


    context.startPreview(previewDisplays[0])
    context.startControls(renderLoops[0].controlGroup)
})

rpc.addMethod("context.stopPreview", async (params, context) => {
    // context.stopPreview()
    context.stopPreview()
    context.stopControls()

})


rpc.addMethod("animationManager.select", async (params, context) => {

    // if (context.renderLoop)
    //     await context.renderLoop.animationManager.select(params[0], false)

    //live?
    // if (params[1]) {

    for (const runner of renderLoops) {
        await runner.animationManager.select(params[0], false)
    }
    // }
})

rpc.addMethod("animationManager.updateValue", async (params, context) => {

    // if (context.renderLoop)
    //     await context.renderLoop.animationManager.updateValue(params[0], params[1])

    //live
    // if (params[1]) {
    for (const runner of renderLoops) {
        await runner.animationManager.updateValue(params[0], params[1])
    }
    // }
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

rpc.addMethod("displayDeviceStore.list", async (params, context) => {
    return displayDeviceStore.list()

})

//display device stuff (regular http GET requests)
rpc.app.get('/get/status/:id', async (req, resp) => {
    console.log(`Seen display device ${req.params.id}`)

    resp.send(
        await displayDeviceStore.get(req.params.id).catch((e) => {
            console.error(e)
            resp.status(500).send(e)

        })
    )


})

//work in progress
//Stream QOIS frames via a http get request.
//Rendering is as fast as possible, to fill buffers up.
//Client display decides how much data is buffered and consumed.
rpc.app.get('/get/stream/:id', async (req, resp) => {

    let deviceInfo = await displayDeviceStore.get(req.params.id)

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

