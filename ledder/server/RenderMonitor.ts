import type {WsContext} from "./WsContext";
import type {Render} from "./Render";
import  {DisplayWebsocket} from "./drivers/DisplayWebsocket.js";
import {previewStore} from "./PreviewStore.js";
import {presetStore} from "./PresetStore.js";

//this is used to monitor an active renderer with a browser client.
//event broadcasting to all clients is done here as well
export default class RenderMonitor {
    wsContexts: Set<WsContext>
    renderer: Render
    monitoringDisplay: DisplayWebsocket
    autostop: boolean

    constructor(renderer: Render) {
        this.renderer = renderer
        this.monitoringDisplay = undefined
        this.wsContexts = new Set()
        this.registerCallbacks()
    }

    addWsContext(wsContext: WsContext) {

        //create monitoring display and add to renderer
        if (this.monitoringDisplay===undefined) {
            const primaryDisplay=this.renderer.displays[0]
            this.monitoringDisplay = new DisplayWebsocket(primaryDisplay.width, primaryDisplay.height)
            this.renderer.displays.push(this.monitoringDisplay)
            this.renderer.start()
        }

        this.wsContexts.add(wsContext)
        this.monitoringDisplay.addWsContext(wsContext)
        wsContext.renderMonitor = this

        //tell new client of the current animation name and controls
        wsContext.notify("selected", this.renderer.animationManager.animationName, this.renderer.animationManager.presetName)
        wsContext.notify("resetControls")
        wsContext.notify("setControls", this.renderer.animationManager.controlGroup)

    }

    removeWsContext(wsContext: WsContext) {
        this.wsContexts.delete(wsContext)
        this.monitoringDisplay.removeWsContext(wsContext)
        wsContext.renderMonitor = undefined

        if (this.wsContexts.size === 0) {
            //if no one is watching, remove monitoring display from renderer
            this.renderer.displays.length=this.renderer.displays.length-1
            this.monitoringDisplay=undefined

            //if renderer has no displays left, stop it
            if (this.renderer.displays.length==0 )
            {
                this.renderer.stop()
            }
        }
    }


    notifyAll(method: string, ...params) {

        for (let wsContext of this.wsContexts) {
            wsContext.notify(method, ...params)
        }
    }


    registerCallbacks() {

        this.renderer.animationManager.controlGroup.__resetCallbacks.register(() => {
            this.notifyAll("resetControls")
            this.notifyAll("setControls", this.renderer.animationManager.controlGroup)
        })

        this.renderer.animationManager.controlGroup.__addCallbacks.register(() => {
            this.notifyAll("setControls", this.renderer.animationManager.controlGroup)
        })

        this.renderer.animationManager.selectedCallbacks.register((animationName, presetName) => {
            this.notifyAll("selected", animationName, presetName)

        })

    }


    async save(presetName: string) {
        await this.renderer.animationManager.save(presetName)

        //store, render preview and restore list (since preview has new timestamp now)
        await presetStore.storeAnimationPresetList()
        await previewStore.render(this.renderer.animationManager.animationName, this.renderer.animationManager.presetName)
        await presetStore.storeAnimationPresetList()

    }

    async delete() {
        const presetName = this.renderer.animationManager.presetName
        await this.renderer.animationManager.delete()
        await presetStore.storeAnimationPresetList()

        //in case the default preset is deleted, we should still render it with the default setings from the animation itself.
        if (presetName == 'default') {
            await previewStore.render(this.renderer.animationManager.animationName, presetName)
            await presetStore.storeAnimationPresetList()
        }
    }

}

