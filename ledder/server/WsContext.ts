//context of a websocket connection
import {DisplayWebsocket} from "./drivers/DisplayWebsocket.js"
import {JSONRPCServerAndClient} from "json-rpc-2.0"
import ControlGroup from "../ControlGroup.js"
import AnimationManager from "./AnimationManager.js"


//Per websocket context, used to generate the preview animation that is shown in the browser.
//Also handles passing through controls to browser and saving presets
export class WsContext {
    ws: WebSocket
    client: JSONRPCServerAndClient<WsContext, WsContext>
    // renderLoop: RenderRealtime
    previewDisplay: DisplayWebsocket | undefined

    animationManager: AnimationManager
    resetCb: any
    addCb: any
    changedCb: (animationName: string, presetName: string) => void


    id: number
    remoteAddress: string

    statsInterval: any
    started: boolean

    constructor(ws: WebSocket, client, id, remoteAddress) {
        this.ws = ws
        this.client = client
        this.id = id
        this.started = false
        this.remoteAddress = remoteAddress
        console.log(`WsContext: New session ${id} ${remoteAddress}`)


    }

    //send rpc request to the connected client
    async request(method: string, ...params) {
        try {
            await this.client.request(method, params, this)
        } catch (e) {
            console.error(`RPC client error calling '${method}': ${e}`)
        }
    }

    startPreview(previewDisplay: DisplayWebsocket) {

        if (this.previewDisplay !== undefined)
            this.stopPreview()

        this.previewDisplay = previewDisplay
        this.previewDisplay.addWebSocket(this.ws)


    }

    stopPreview() {
        // this.started=false
        if (this.previewDisplay !== undefined) {
            this.previewDisplay.removeWebsocket(this.ws)
            this.previewDisplay = undefined
        }
        // //should stop because of gc
        // if (this.renderLoop) {
        //     this.started = false
        //     this.renderLoop.stop()
        //     this.renderLoop = undefined
        //     clearInterval(this.statsInterval)
        // }
    }


    startControls(animationManager: AnimationManager) {

        if (this.animationManager !== undefined)
            this.stopControls()

        this.animationManager = animationManager


        this.resetCb = () => {
            this.request("control.reset").then(() => {
                this.request("control.set", this.animationManager.controlGroup).then()
            })

        }

        this.addCb = () => {
            this.request("control.set", this.animationManager.controlGroup).then()

        }

        this.changedCb = (animationName, presetName) => {
            this.request("animationManager.changed", animationName, presetName)
        }

        this.animationManager.controlGroup.__resetCallbacks.register(this.resetCb)
        this.animationManager.controlGroup.__addCallbacks.register(this.addCb)
        this.animationManager.changedCallbacks.register(this.changedCb)


        //reset and send current controls
        this.request("control.reset").then(() => {
            this.request("control.set", this.animationManager.controlGroup).then()
        })
        this.request("animationManager.changed", animationManager.animationName, animationManager.presetName)


    }

    stopControls() {

        if (this.animationManager) {
            this.animationManager.controlGroup.__resetCallbacks.unregister(this.resetCb)
            this.animationManager.controlGroup.__addCallbacks.unregister(this.addCb)

            this.animationManager.changedCallbacks.unregister(this.changedCb)
            this.animationManager = undefined
        }

    }

    //websocket closed
    closed() {
        console.log(`WsContext: Stopping ${this.id}`)
        this.stopPreview()
        this.stopControls()
    }


}
