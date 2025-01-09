import type {WsContext} from "./WsContext";
import type {Render} from "./Render";
import type {DisplayWebsocket} from "./drivers/DisplayWebsocket.js";

//this is used to monitor an active renderer with a browser client.
//event broadcasting to all clients is done here as well
export default class RenderMonitor {
    wsContexts: Set<WsContext>
    renderer: Render
    monitoringDisplay: DisplayWebsocket

    constructor(renderer: Render, monitoringDisplay: DisplayWebsocket) {
        this.renderer = renderer
        this.monitoringDisplay = monitoringDisplay
        this.wsContexts = new Set()
        this.registerCallbacks()
    }

    addWsContext(wsContext: WsContext) {
        this.wsContexts.add(wsContext)
        this.monitoringDisplay.addWsContext(wsContext)
        wsContext.renderMonitor=this


        //tell new client of the current animation name and controls
        wsContext.notify("selected", this.renderer.animationManager.animationName, this.renderer.animationManager.presetName)
        wsContext.notify("resetControls")
        wsContext.notify("setControls", this.renderer.animationManager.controlGroup)

    }

    removeWsContext(wsContext: WsContext) {
        this.wsContexts.delete(wsContext)
        this.monitoringDisplay.removeWsContext(wsContext)
        wsContext.renderMonitor=undefined
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


}

