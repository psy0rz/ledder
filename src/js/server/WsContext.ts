//context of a websocket connection
import {RunnerServer} from "./RunnerServer.js";
import {Scheduler} from "../ledder/Scheduler.js";
import {MatrixWebsocket} from "./drivers/MatrixWebsocket.js";
import {PresetStore} from "./PresetStore.js";
import {RpcServer} from "./RpcServer.js";
import {JSONRPCClient, JSONRPCServerAndClient} from "json-rpc-2.0";


//Per websocket context, used to generate the preview animation that is shown in the browser.
//Also handles passing through controls to browser and saving presets
export class WsContext {
    ws: WebSocket
    client: JSONRPCServerAndClient<WsContext, WsContext>
    runner: RunnerServer

    constructor(ws: WebSocket, client) {
        this.ws = ws
        this.client = client


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
        let scheduler = new Scheduler();
        let matrix = new MatrixWebsocket(scheduler, width, height, this.ws)
        this.runner = new RunnerServer(matrix, presetStore)
        matrix.run()

        matrix.preset.setCallbacks(
            () => {
                this.request("control.reset")
            },
            (control) => {
                this.request("control.add", control)
            },
            (controlName, controlValues) => {
                this.request("control.update", controlName, controlValues)
            })

    }

    stopPreview() {
        //should stop because of gc
        this.runner.stop()
    }

    //websocket closed
    stop()
    {
        this.stopPreview()
    }


}
