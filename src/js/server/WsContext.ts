//context of a websocket connection
import {RunnerServer} from "./RunnerServer.js";
import {Scheduler} from "../ledder/Scheduler.js";
import {MatrixWebsocket} from "./drivers/MatrixWebsocket.js";
import {PresetStore} from "./PresetStore.js";

//per websocket context, usually used to generate the preview animation that is shown in the browser.
export class WsContext {
    ws: WebSocket

    runner: RunnerServer
    constructor(ws) {
        this.ws=ws
    }

    startPreview(presetStore:PresetStore, width, height)
    {
        let scheduler = new Scheduler();
        let matrix=new MatrixWebsocket(scheduler, width,height, this.ws)
        this.runner = new RunnerServer(matrix, presetStore)
        matrix.run()
    }

    stopPreview()
    {
        //should stop because of gc
        this.runner=undefined
    }

}
