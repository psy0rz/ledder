import {RpcServer} from "./RpcServer.js"
import {RenderRealtime} from "./RenderRealtime.js"
import ControlGroup from "../ControlGroup.js"
import GammaMapper from "./drivers/GammaMapper.js"
import {presetStore} from "./PresetStore.js"
import {DisplayQOIShttp} from "./drivers/DisplayQOIShttp.js"
import {config, loadDisplayconf} from "./config.js"
import RenderControl from "./RenderControl.js";
import type {WsContext} from "./WsContext.js";
import * as fs from "node:fs";
import {loadSettings, saveSettings, saveSettingsDelayed} from "./DisplaySettings.js";


await loadDisplayconf()


let renderControllers: Array<RenderControl> = []

//create preview renderer
let renderer = new RenderRealtime()
await renderer.animationManager.select(config.animation, false)
const previewRenderControl = new RenderControl(renderer)
renderControllers.push(previewRenderControl)

//create actual realtime displays
for (const displayNr in config.displayList) {
    const display = config.displayList[displayNr]

    let renderer = new RenderRealtime()
    await renderer.animationManager.select(config.animation, false)
    renderControllers.push(new RenderControl(renderer))
    await renderer.addDisplay(display)

}

//load display settings
await loadSettings(renderControllers)

setInterval(() => {
    for (let renderControl of renderControllers) {
        renderControl.sendStats()
    }
}, 1000)


//RPC bindings
let rpc = new RpcServer()

//notify all websockets on all render controllers
function notifyAll(method: string, ...params) {
    for (let renderControl of renderControllers) {
        renderControl.notifyAll(method, ...params)
    }
}

//display list suitable for webclients
function getDisplayList() {
    let displays = []
    for (let renderControl of renderControllers) {

        let online = true;
        const display = renderControl.getPrimaryDisplay() as DisplayQOIShttp

        if (display !== undefined) {
            if (display.isOnline != undefined)
                online = display.isOnline()

            displays.push({
                description: renderControl.getPrimaryDisplay().descriptionControl.text,
                online: online,
            })
        }
    }

    return displays

}


rpc.addMethod("refresh", async (context: WsContext) => {
    context.notify("animationList", presetStore.animationPresetList)
    context.notify("displayList", getDisplayList())
})

rpc.addMethod("save", async (context: WsContext, presetName) => {
    await context.renderControl.savePreset(presetName)

    //inform everyone of the new list and preview
    for (let renderMonitor of renderControllers) {
        renderMonitor.notifyAll("animationList", presetStore.animationPresetList)
    }

})

rpc.addMethod("delete", async (context: WsContext) => {

    await context.renderControl.deletePreset()

    //inform everyone of the new list
    for (let renderMonitor of renderControllers) {
        renderMonitor.notifyAll("animationList", presetStore.animationPresetList)
    }

})


rpc.addMethod("startMonitoring", async (context: WsContext, rendererId) => {

    if (renderControllers[rendererId] === undefined)
        rendererId = 0

    context.notify("monitoring", rendererId, renderControllers[rendererId].getPrimaryDisplay().id)
    await renderControllers[rendererId].addWsContext(context)


})

rpc.addMethod("stopMonitoring", async (context: WsContext) => {
    await context.renderControl.removeWsContext(context)


})


rpc.addMethod("select", async (context: WsContext, animationAndPresetPath) => {


    await context.renderControl.select(animationAndPresetPath, false)
    saveSettingsDelayed(renderControllers)
})

rpc.addMethod("updateValue", async (context: WsContext, path, values) => {

    await context.renderControl.renderer.animationManager.updateValue(path, values)

})


rpc.addMethod("getSettings", async (context: WsContext) => {
    return context.renderControl.getPrimaryDisplay().settingsControl

})


rpc.addMethod("updateSetting", async (context: WsContext, path, values) => {

    try {
        context.renderControl.getPrimaryDisplay().settingsControl.updateValue(path, values)
        if (path[0] === "Description") {
            notifyAll("displayList", getDisplayList())
        }
        saveSettingsDelayed(renderControllers)
    } catch (e) {
        console.error("Error while updating settings value:", e)
    }

})

rpc.addMethod("changePreviewSize", async (context: WsContext, width, height) => {

    await previewRenderControl.changePreviewSize(width, height)


    //also switch the context to the preview display, if it wasnt already
    context.notify("monitoring", 0, previewRenderControl.getPrimaryDisplay().id)
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
    context.renderControl.setStreamMode(Number(mode))
    saveSettingsDelayed(renderControllers)

})


//Stream QOIS frames via a http get request.
//
rpc.app.get('/stream/:id', async (req, resp) => {

    console.log(`Display http connect: ${req.params.id} (${req.ip})`)

    for (let renderControl of renderControllers) {
        const display = renderControl.getPrimaryDisplay() as DisplayQOIShttp
        if (display !== undefined && display.id == req.params.id) {
            display.setResponseHandler(resp)
            return
        }
    }

    resp.sendStatus(500)
    console.error(`No display found with ID: ${(req.params.id)}`)


})

