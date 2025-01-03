import {rpc} from "./RpcClient.js"
import {
    svelteAnimations,
    sveltePresets,
    svelteDisplayDeviceInfoList,
    svelteSelectedTitle, displayWidth, displayHeight, displayZoom
} from "./svelteStore.js"
import {confirmPromise, info, promptPromise} from "./util.js"
import {DisplayCanvas} from "./DisplayCanvas.js"
import {tick} from "svelte"
import ControlGroup from "../../../ledder/ControlGroup.js"

/**
 * Browser side animation runner. Note that animation runs on the server side (WsContext.ts) and is actually streamed to browser via DisplayWebsocket
 */
export class RunnerBrowser {
    animationName: string
    presetName: string


    presets: Record<string, any>
    zoom: boolean


    constructor() {
        this.zoom=false

    }


    async init() {
        this.presets = {}
        sveltePresets.set(new ControlGroup())

        rpc.addMethod('control.reset', async () => {
            // console.log("Reset controls")
            this.presets = {}
            sveltePresets.set(new ControlGroup())
            await tick()
        })

        rpc.addMethod('control.set', async (params) => {

            // console.log("Add control", params[0])


            sveltePresets.set(params[0])
        })

        rpc.addMethod('animationManager.changed', ( pars)=>{
            const [animationName, presetName]=pars
            console.log("Server animation changed:", animationName, presetName)
            svelteSelectedTitle.set(`${animationName}/${presetName}`)
            this.animationName=animationName
            this.presetName=presetName
        })

        rpc.addMethod('display.changedSize', (pars)=>{
            const [width, height]=pars
            rpc.registerDisplay( new DisplayCanvas(width, height, 8, '#ledder-display', '.ledder-display-box'))

            displayWidth.set(width)
            displayHeight.set(height)

        })

    }

    async startPreview() {

        // await rpc.request('context.stopPreview')
        const size=await rpc.request('context.startPreview')
        // await this.send()

    }

    async stopPreview() {
        await rpc.request('context.stopPreview')

    }

    /** Send current running animation and preset to server, and restart local animation as well
     *
     */
    // async send() {
    //     if (this.animationName) {
    //         await rpc.request("animationManager.select", this.animationName + "/" + this.presetName, svelteLive)
    //     }
    // }


    /**
     * Runs specified animation with specified preset
     *
     * @param animationName
     * @param presetName
     */
    async run(animationName: string, presetName: string) {

        // this.animationName = animationName
        // this.presetName = presetName
        await rpc.request("animationManager.select", animationName + "/" + presetName)


    }

    async refreshAnimationList() {
        const list = await rpc.request("presetStore.loadAnimationPresetList")
        svelteAnimations.set(list)
    }

    async refreshDisplayDeviceInfoList() {
        const list = await rpc.request("displayDeviceStore.list")
        svelteDisplayDeviceInfoList.set(list)
    }


    /** Save current preset to server, and create preview
     *
     */
    async presetSave(saveAs = false) {

        if (this.presetName == "" || saveAs)
            this.presetName = await promptPromise('Enter preset name', "", this.presetName)

        if (this.presetName == "")
            return

        // await rpc.request("presetStore.save", this.animationClass.presetDir, this.presetName, values);
        // await rpc.request("presetStore.createPreview", this.animationName, this.presetName, values);
        await rpc.request("animationManager.save", this.presetName)
        await this.refreshAnimationList()

        await this.run(this.animationName, this.presetName)

        info("Saved preset " + this.presetName, "", 1000)
    }


    async presetDelete() {

        if (!this.presetName)
            return false

        await confirmPromise('Delete preset', 'Do you want to delete preset: ' + this.presetName)

        await rpc.request("animationManager.delete")
        info("Deleted preset " + this.presetName, "", 2000)

        this.presetName = ""
        // await this.run(this.animationName, this.presetName)

        await this.refreshAnimationList()

    }

    //staticly render animation on server and stream it to browser via regular HTTP, while uploading it to ESP via regular HTTP :)
    async uploadStatic() {

    }

}

export let runnerBrowser = new RunnerBrowser()
