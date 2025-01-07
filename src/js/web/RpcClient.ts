import {JSONRPCClient, JSONRPCServer, JSONRPCServerAndClient} from "json-rpc-2.0"
import {Rpc} from "../Rpc.js"
import {error, progressDone, progressStart} from "./util.js"
import {DisplayCanvas} from "./DisplayCanvas.js"
import {svelteSelectedTitle} from "./svelteStore.js"

/***
 * Browser-side rpc client that connect to server handles rpc calls to/from server.
 */
class RpcClient extends Rpc {

    private serverAndClient: JSONRPCServerAndClient
    private openHandler: () => void
    private closeHandler: () => void
    private url: string
    private display: DisplayCanvas
    private webSocket: WebSocket

    constructor() {
        super()


        // window.addEventListener("blur", () => {
        //     console.log("User has focused another window or application.")
        //     if (this.webSocket.readyState===WebSocket.OPEN)
        //         this.webSocket.close()
        //     // Logic for when the user leaves the browser window
        // })
        //
        // window.addEventListener("focus", () => {
        //     console.log("User has returned to the browser window.")
        //     // Logic for when the user returns to the browser window
        //     if (this.webSocket.readyState===WebSocket.CLOSED)
        //         this.connect()
        // })

    }

    init(openHandler, closeHandler = undefined, ws_url = undefined) {

        this.openHandler = openHandler
        this.closeHandler = closeHandler

    }

    connect(ip = undefined) {

        let ws_url

        if (ip === undefined) {
            if (location.protocol === 'http:')
                ws_url = "ws://" + location.host + "/ws"
            else
                ws_url = "wss://" + location.host + "/ws"
            this.url = `${location.protocol}//${location.host}`
            console.log("Preview url is", this.url)
        } else {
            ws_url = `ws://${ip}:3000/ws`
            this.url = `http://${ip}:3000`
        }


        console.log(`Connecting to websocket ${ws_url}`)


        this.webSocket = new WebSocket(ws_url)

        this.serverAndClient = new JSONRPCServerAndClient(
            new JSONRPCServer(),
            new JSONRPCClient((request) => {
                try {
                    this.webSocket.send(JSON.stringify(request))
                    return Promise.resolve()
                } catch (error) {
                    return Promise.reject(error)
                }
            })
        )

        this.webSocket.onmessage = async (event) => {
            if (event.data[0] == "{")
                this.serverAndClient.receiveAndSend(JSON.parse(event.data.toString()))
            else {
                if (this.display)
                    this.display.frame(await event.data.arrayBuffer())

            }

        }

        // On close, make sure to reject all the pending requests to prevent hanging.
        this.webSocket.onclose = (event) => {
            console.log("WS Closed", this.webSocket)
            this.serverAndClient.rejectAllPendingRequests(
                `Connection is closed (${event.reason}).`
            )

            // reconnect
            svelteSelectedTitle.set("Reconnecting...")
            setTimeout(() => this.connect(ip), 1000);

            if (this.closeHandler !== undefined)
                this.closeHandler()

        }


        this.webSocket.onopen = () => {
            console.log("WS open")
            this.openHandler()
        }


    }

    addMethod(name, method) {
        this.serverAndClient.addMethod(name, (pars)=>{
            method(...pars)
        })
    }

    registerDisplay(display: DisplayCanvas)
    {
        this.display=display
    }

    /**
     * Makes a request to the server. Also shows progress-indicator and shows execptions to the user. (slower)
     * @param name
     * @param params
     */
    async request(name, ...params) {

        try {
            // console.log("RPC start", name, params)
            progressStart()
            let result = await this.serverAndClient.request(name, params)
            // console.log("RPC complete",name, params,result)
            progressDone()
            return (result)
        } catch (e) {
            console.error("RPC error", name, params, e)
            progressDone()
            error("RPC request failed", e)
            throw (e)
        }
    }

    /**
     * Make a request to server, without any extra processing and exception handling (faster)
     * @param name
     * @param params
     */
    async requestRaw(name, ...params) {
        return (this.serverAndClient.request(name, params))
    }

    /** Send a notify, doesnt return anything. (fastest)
     *
     * @param name
     * @param params
     */
    async notify(name, ...params) {
        // console.log("RPC notify",name, params)
        this.serverAndClient.notify(name, params)
    }

}

export let rpc = new RpcClient()
