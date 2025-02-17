//context of a websocket connection
import {JSONRPCServerAndClient} from "json-rpc-2.0"
import type RenderControl from "./RenderControl.js";


//Per websocket context, used to generate the monitoring display that is shown in the browser.
//Also handles passing through controls to browser and saving presets
export class WsContext {
    ws: WebSocket
    client: JSONRPCServerAndClient<WsContext, WsContext>


    id: number
    remoteAddress: string

    renderMonitor: RenderControl

    // statsInterval: any
    // started: boolean

    constructor(ws: WebSocket, client, id, remoteAddress) {
        this.ws = ws
        this.client = client
        this.id = id
        // this.started = false
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

    //send rpc notify to the connected client
    notify(method: string, ...params) {
        try {
            this.client.notify(method, params, this)
        } catch (e) {
            console.error(`RPC client error notifying '${method}': ${e}`)
        }
    }


    //websocket closed
    async closed() {
        console.log(`WsContext: Stopping ${this.id}`)
        // this.stopMonitoring()
        // this.stopControls()

        if (this.renderMonitor!==undefined)
        {
            await this.renderMonitor.removeWsContext(this)
        }
    }


}
