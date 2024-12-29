//context of a websocket connection
import {DisplayWebsocket} from "./drivers/DisplayWebsocket.js"
import {JSONRPCServerAndClient} from "json-rpc-2.0"
import ControlGroup from "../ControlGroup.js"


//Per websocket context, used to generate the preview animation that is shown in the browser.
//Also handles passing through controls to browser and saving presets
export class WsContext {
    ws: WebSocket
    client: JSONRPCServerAndClient<WsContext, WsContext>
    // renderLoop: RenderRealtime
    previewDisplay: DisplayWebsocket | undefined

    controlGroup: ControlGroup | undefined
    resetCb: any
    addCb: any


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


    startControls(controlGroup: ControlGroup) {

        if (this.controlGroup !== undefined)
            this.stopControls()

        this.controlGroup = controlGroup


        this.resetCb = () => {
            this.request("control.reset").then(() => {
                this.request("control.set", this.controlGroup).then()
            })

        }

        this.addCb = () => {
            this.request("control.set", this.controlGroup).then()

        }


        controlGroup.__resetCallbacks.register(this.resetCb)
        controlGroup.__addCallbacks.register(this.addCb)

        //reset and send current controls
        this.request("control.reset").then(() => {
            this.request("control.set", controlGroup).then()
        })
    }

    stopControls() {

        if (this.controlGroup) {
            this.controlGroup.__resetCallbacks.unregister(this.resetCb)
            this.controlGroup.__addCallbacks.unregister(this.addCb)
            this.controlGroup = undefined
        }

    }

    //websocket closed
    closed() {
        console.log(`WsContext: Stopping ${this.id}`)
        this.stopPreview()
        this.stopControls()
    }


}
