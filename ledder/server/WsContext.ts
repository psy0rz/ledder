//context of a websocket connection
import {DisplayWebsocket} from "./drivers/DisplayWebsocket.js"
import {JSONRPCServerAndClient} from "json-rpc-2.0"
import AnimationManager from "./AnimationManager.js"


//Per websocket context, used to generate the monitoring display that is shown in the browser.
//Also handles passing through controls to browser and saving presets
export class WsContext {
    ws: WebSocket
    client: JSONRPCServerAndClient<WsContext, WsContext>
    // renderLoop: RenderRealtime
    monitorDisplay: DisplayWebsocket | undefined

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

    startMonitoring(monitorDisplay: DisplayWebsocket) {

        if (this.monitorDisplay !== undefined)
            this.stopMonitoring()

        this.monitorDisplay = monitorDisplay
        this.monitorDisplay.addWsContext(this)


    }

    stopMonitoring() {
        if (this.monitorDisplay !== undefined) {
            this.monitorDisplay.removeWebsocket(this)
            this.monitorDisplay = undefined
        }
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
        this.stopMonitoring()
        this.stopControls()
    }


}
