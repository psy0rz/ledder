//context of a websocket connection
import {RunnerServer} from "./RunnerServer.js";
import {Scheduler} from "../ledder/Scheduler.js";
import {MatrixWebsocket} from "./drivers/MatrixWebsocket.js";
import {PresetStore} from "./PresetStore.js";
import {RpcServer} from "./RpcServer.js";
import {JSONRPCClient, JSONRPCServerAndClient} from "json-rpc-2.0";
import {Controls} from "../ledder/Controls.js";


//Per websocket context, used to generate the preview animation that is shown in the browser.
//Also handles passing through controls to browser and saving presets
export class WsContext {
    ws: WebSocket
    client: JSONRPCServerAndClient<WsContext, WsContext>
    runner: RunnerServer
    id: number

    statsInterval: any

    constructor(ws: WebSocket, client, id) {
        this.ws = ws
        this.client = client
        this.id = id


    }

    //send rpc request to the connected client
    async request(method: string, ...params) {
        try{
            await this.client.request(method, params, this)
        }
        catch (e) {
            console.error(`RPC client error calling '${method}': ${e}`)
        }
    }

    startPreview(presetStore: PresetStore, width, height) {
        let controls = new Controls('Root controls')
        let scheduler = new Scheduler();
        let matrix = new MatrixWebsocket(scheduler, width, height, this.ws)
        this.runner = new RunnerServer(matrix, scheduler, controls, presetStore)
        this.runner.startRenderLoop()

        controls.setCallbacks(
            () => {
                this.request("control.reset")
            },
            (control) => {
                this.request("control.add", control)
            })
            // (controlName, controlValues) => {
            //     this.request("control.update", controlName, controlValues)
            // })

        this.statsInterval=setInterval( ()=>{
            console.log(`Stats ${this.id}: ${matrix.pixels.length} pixels, ${scheduler.intervals.length} intervals`)
        }, 3000)

    }

    stopPreview() {
        //should stop because of gc
        if (this.runner)
            this.runner.stop()
        clearInterval(this.statsInterval)

    }

    //websocket closed
    stop()
    {
        this.stopPreview()
    }


}
