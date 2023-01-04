//context of a websocket connection
import {RenderLoop} from "./RenderLoop.js";
import {DisplayWebsocket} from "./drivers/DisplayWebsocket.js";
import {presetStore, PresetStore} from "./PresetStore.js"
import {JSONRPCServerAndClient} from "json-rpc-2.0";
import ControlGroup from "../ControlGroup.js";


//Per websocket context, used to generate the preview animation that is shown in the browser.
//Also handles passing through controls to browser and saving presets
export class WsContext {
    ws: WebSocket
    client: JSONRPCServerAndClient<WsContext, WsContext>
    runner: RenderLoop
    id: number

    statsInterval: any
    started: boolean

    constructor(ws: WebSocket, client, id) {
        this.ws = ws
        this.client = client
        this.id = id
        this.started=false
        console.log(`WsContext: New session ${id}`)



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
        if (this.started)
            this.stopPreview()

        this.started=true

        let controls = new ControlGroup('Root controls')
        //todo: add delay or queue
        controls.setCallbacks(
            () => {
                this.request("control.reset").then()
            },
            (control) => {
                // console.log("add", control)
                this.request("control.add", control).then()
            })
            // (controlName, controlValues) => {
            //     this.request("control.update", controlName, controlValues)
            // })

        let display = new DisplayWebsocket( width, height, this.ws)
        this.runner = new RenderLoop(display,  controls)
        this.runner.start()


        this.statsInterval=setInterval( ()=>{
            let count=0
            this.runner.box.forEachPixel( ()=>{
                count++
            })
           // @ts-ignore
            console.log(`Stats ${this.id}: ${count} pixels, ${this.runner.scheduler.intervals.size} intervals`)
        }, 3000)


    }

    stopPreview() {
        //should stop because of gc
        if (this.runner) {
            this.started=false
            this.runner.stop()
            this.runner=undefined
            clearInterval(this.statsInterval)
        }
    }

    //websocket closed
    stop()
    {
        console.log(`WsContext: Stopping ${this.id}`)
        this.stopPreview()
    }
    // //save current running animation preset
    // async save(presetName: string) {
    //     this.presetName = presetName
    //     this.presetValues.values = this.controlGroup.save()
    //     await presetStore.save(this.animationName, presetName, this.presetValues)
    //     // await this.presetStore.createPreview(this.animationClass, this.animationName, presetName, this.presetValues)
    //     await presetStore.storeAnimationPresetList()
    // }
    //
    // //delete current running animation preset
    // async delete() {
    //     if (this.presetName !== undefined) {
    //         await presetStore.delete(this.animationName, this.presetName)
    //         await presetStore.storeAnimationPresetList()
    //         this.presetName = undefined
    //     }
    // }


}
