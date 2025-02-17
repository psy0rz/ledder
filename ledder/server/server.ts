import {RpcServer} from "./RpcServer.js"
import {RenderRealtime} from "./RenderRealtime.js"
import ControlGroup from "../ControlGroup.js"
import GammaMapper from "./drivers/GammaMapper.js"
import {presetStore} from "./PresetStore.js"
import {DisplayQOIShttp} from "./drivers/DisplayQOIShttp.js"
import {config, load} from "./config.js"
import RenderControl from "./RenderControl.js";
import type {WsContext} from "./WsContext.js";
import * as fs from "node:fs";


const settingsControl = new ControlGroup('Global settings')

await load()

const gammaMapper = new GammaMapper(settingsControl.group("Display settings"))


let renderControllers: Array<RenderControl> = []

//create preview renderer
let renderer = new RenderRealtime(`Preview`)
await renderer.animationManager.select(config.animation, false)
const previewRenderControl = new RenderControl(renderer)
renderControllers.push(previewRenderControl)

//create actual realtime displays
for (const displayNr in config.displayList) {
    const display = config.displayList[displayNr]
    //FIXME, should be one confirable per display instead of global.
    display.gammaMapper = gammaMapper


    let desc = ""
    if (display.id)
        desc = `${display.description} (${display.id})`
    else
        `Display ${displayNr} ${display.description}`

    let renderer = new RenderRealtime(desc)
    await renderer.addDisplay(display)
    await renderer.animationManager.select(config.animation, false)
    renderControllers.push(new RenderControl(renderer))

}


setInterval(() => {
    for (let renderMonitor of renderControllers) {
        renderMonitor.sendStats()
    }
}, 1000)


//RPC bindings
let rpc = new RpcServer()

rpc.addMethod("refresh", async (context: WsContext) => {
    context.notify("animationList", presetStore.animationPresetList)


    let displays = []
    for (let renderControl of renderControllers) {

        let online = true;
        const display = renderControl.getPrimaryDisplay() as DisplayQOIShttp
        if (display != undefined && display.isOnline != undefined)
            online = display.isOnline()

        displays.push({
            description:renderControl.getDescription(),
            online: online,
        })
    }

    context.notify("displayList", displays)
})

rpc.addMethod("save", async (context: WsContext, presetName) => {
    await context.renderMonitor.savePreset(presetName)

    //inform everyone of the new list and preview
    for (let renderMonitor of renderControllers) {
        renderMonitor.notifyAll("animationList", presetStore.animationPresetList)
    }

})

rpc.addMethod("delete", async (context: WsContext) => {

    await context.renderMonitor.deletePreset()

    //inform everyone of the new list
    for (let renderMonitor of renderControllers) {
        renderMonitor.notifyAll("animationList", presetStore.animationPresetList)
    }

})


rpc.addMethod("startMonitoring", async (context: WsContext, rendererId) => {

    if (renderControllers[rendererId] === undefined)
        rendererId = 0

    context.notify("monitoring", rendererId)
    await renderControllers[rendererId].addWsContext(context)


})

rpc.addMethod("stopMonitoring", async (context: WsContext) => {
    await context.renderMonitor.removeWsContext(context)


})


rpc.addMethod("select", async (context: WsContext, animationAndPresetPath) => {


    await context.renderMonitor.select(animationAndPresetPath, false)

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

    await previewRenderControl.changePreviewSize(width, height)

    //also switch the context to the preview display, if it wasnt already
    context.notify("monitoring", 0)
    previewRenderControl.addWsContext(context)


})


rpc.app.get('/update/esp32s3.bin', async (req, res) => {

    const logPrefix = `Firmware update ${req.ip}: `
    if (!config.firmwareFile) {
        console.log(logPrefix + "(no firmwareFile conifgured)")

    } else {
        console.log(logPrefix + "check")


        const stat = fs.statSync(config.firmwareFile); // Get file size
        const totalSize = stat.size;
        let transmittedBytes = 0;

        res.setHeader('Content-Length', totalSize);
        res.setHeader('Content-Disposition', 'attachment; filename="firmware.bin"');

        const readStream = fs.createReadStream(config.firmwareFile);

        let blocks = 0
        readStream.on('data', (chunk) => {
            blocks = blocks + 1
            transmittedBytes += chunk.length;
            if (blocks > 2)
                console.log(`${logPrefix}Progress: ${((transmittedBytes / totalSize) * 100).toFixed(0)}%`);
        });

        req.on("error", () => {
            readStream.close()
        });


        readStream.pipe(res);

        readStream.on('end', () => {
            console.log(`${logPrefix}Update complete, rebooting.`);
        });

        readStream.on('error', (err) => {
            console.error(`${logPrefix}File streaming error:`, err);
            res.sendStatus(500);
        });
    }

});

rpc.addMethod("setStreamMode", async (context: WsContext, mode: number) => {
    context.renderMonitor.setStreamMode(Number(mode))

})


//Stream QOIS frames via a http get request.
rpc.app.get('/stream/:id', async (req, resp) => {

    console.log(`Display http connect: ${req.params.id} (${req.ip})`)

    for (let renderMonitor of renderControllers) {
        const display = renderMonitor.getPrimaryDisplay() as DisplayQOIShttp
        if (display !== undefined && display.id == req.params.id) {
            display.setResponseHandler(resp)
            return
        }
    }

    resp.sendStatus(500)
    console.error(`No display found with ID: ${(req.params.id)}`)


})

