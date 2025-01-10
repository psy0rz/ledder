import type {WsContext} from "./WsContext";
import type {Render} from "./Render";
import {DisplayWebsocket} from "./drivers/DisplayWebsocket.js";
import {previewStore} from "./PreviewStore.js";
import {presetStore} from "./PresetStore.js";

//this is used to monitor an active renderer with a browser client.
//event broadcasting to all clients is done here as well
export default class RenderMonitor {
    wsContexts: Set<WsContext>
    renderer: Render
    monitoringDisplay: DisplayWebsocket

    constructor(renderer: Render) {
        this.renderer = renderer
        this.monitoringDisplay = undefined
        this.wsContexts = new Set()
        this.registerCallbacks()
    }

    async addWsContext(wsContext: WsContext) {

        if (this.wsContexts.has(wsContext))
            return

        //already monitoring something?
        if (wsContext.renderMonitor !== undefined) {
            await wsContext.renderMonitor.removeWsContext(wsContext)
        }

        //create monitoring display and add to renderer
        if (this.monitoringDisplay === undefined) {

            this.monitoringDisplay = new DisplayWebsocket(this.renderer.box.width(), this.renderer.box.height())
            await this.renderer.addDisplay(this.monitoringDisplay)
        }

        this.wsContexts.add(wsContext)
        this.monitoringDisplay.addWsContext(wsContext)
        wsContext.renderMonitor = this

        //tell new client of the current animation name and controls
        wsContext.notify("selected", this.renderer.animationManager.animationName, this.renderer.animationManager.presetName)
        wsContext.notify("resetControls")
        wsContext.notify("setControls", this.renderer.animationManager.controlGroup)

    }

    async removeWsContext(wsContext: WsContext) {
        this.wsContexts.delete(wsContext)
        this.monitoringDisplay.removeWsContext(wsContext)
        wsContext.renderMonitor = undefined

        //if no one is watching this display, remove it from the renderer. (which in turn will stop if there are no displays left)
        if (this.wsContexts.size === 0) {
            await this.renderer.removeDisplay(this.monitoringDisplay)
            this.monitoringDisplay = undefined

        }
    }

    //resize the display.
    //you can only use this on the preview renderer monitor!
    async changePreviewSize(width, height) {

        console.log('removeing')

        //change size first!
        this.renderer.box.xMax = width-1
        this.renderer.box.yMax = height-1

        //remove all wscontexts
        let removedContexts = new Set<WsContext>()
        for (let wsContext of this.wsContexts) {
            await this.removeWsContext(wsContext)
            removedContexts.add(wsContext)
        }
        //Rremoving all wscontexts, will remove the display, which will stop renderer/animation.
        //It will also trigger animationmanager.stop(), which will recreate proxys, including the box we've changed above
        //Still we need to call it again, in case the already were no displays in it
        this.renderer.animationManager.stop(true)

        console.log('addoinmg')

        //re-add. should recreate everything
        for (let wsContext of removedContexts) {
            await this.addWsContext(wsContext)
        }
        console.log('done')

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

