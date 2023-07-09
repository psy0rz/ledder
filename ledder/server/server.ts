import {RpcServer} from "./RpcServer.js"
import {RenderRealtime} from "./RenderRealtime.js"
import ControlGroup from "../ControlGroup.js"
import Display from "../Display.js"
import GammaMapper from "./drivers/GammaMapper.js"
import {config} from "./config.js"
import {presetStore} from "./PresetStore.js"
import {previewStore} from "./PreviewStore.js"
import {RenderStatic} from "./RenderStatic.js"
import {DisplayQOISstream} from "./drivers/DisplayQOISstream.js"
import {displayDeviceStore} from "./DisplayDeviceStore.js"


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

for (const m of config.displayList) {
    let display: Display
    display = m
    display.gammaMapper = gammaMapper

    let renderLoop = new RenderRealtime(display)
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
    await context.renderLoop.animationManager.save(params[0])
    await previewStore.render(context.renderLoop.animationManager.animationName, context.renderLoop.animationManager.presetName)

})

rpc.addMethod("animationManager.delete", async (params, context) => {
    await context.renderLoop.animationManager.delete()
})


rpc.addMethod("context.startPreview", async (params, context) => {
    // console.log("start preview")
    await context.startPreview(presetStore, params[0], params[1])
})

rpc.addMethod("context.stopPreview", async (params, context) => {
    context.stopPreview()
})


rpc.addMethod("animationManager.select", async (params, context) => {

    if (context.renderLoop)
        await context.renderLoop.animationManager.select(params[0], false)

    //live?
    // if (params[1]) {

    for (const runner of renderLoops) {
        await runner.animationManager.select(params[0], false)
    }
    // }
})

rpc.addMethod("animationManager.updateValue", async (params, context) => {

    if (context.renderLoop)
        await context.renderLoop.animationManager.updateValue(params[0], params[1])

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

rpc.app.get('/get/render/:id', async (req, resp) => {

    let deviceInfo = await displayDeviceStore.get(req.params.id)

    //XXX:fix me, now only supports first display
    const display: DisplayQOISstream = config.staticDisplayList[0]
    display.writeCallback = (data) => {
        resp.write(data)
    }
    display.gammaMapper = gammaMapper

    const renderer = new RenderStatic(display)
    await renderer.animationManager.select(deviceInfo.animation, false)
    await renderer.render(60 * 16)

    resp.end()


})

rpc.app.get('/get/stream/:id', async (req, resp) => {

    let deviceInfo = await displayDeviceStore.get(req.params.id)



    resp.once('finish', () => {
        console.log("CLOSE")
    })


})
