import {rpc} from "./RpcClient.js"
import {
    svelteAnimations,
    sveltePresets,
    svelteSelectedTitle,
    svelteDisplayWidth,
    svelteDisplayHeight,
    svelteDisplayZoom,
    svelteDisplayList,
    svelteSelectedDisplayNr
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
        this.zoom = false

    }


    async init() {
        this.presets = {}
        sveltePresets.set(new ControlGroup())


        rpc.addMethod('resetControls', async () => {
            // console.log("Reset controls")
            this.presets = {}
            sveltePresets.set(new ControlGroup())
            await tick()
        })

        rpc.addMethod('setControls', async (controlGroup) => {


            sveltePresets.set(controlGroup)
        })

        rpc.addMethod('selected', (animationName, presetName) => {
            // const [animationName, presetName]=pars
            console.log("Server animation changed:", animationName, presetName)
            svelteSelectedTitle.set(`${animationName}/${presetName}`)
            this.animationName = animationName
            this.presetName = presetName
        })

        rpc.addMethod('displaySize', (width, height) => {
            // const [width, height]=pars
            rpc.registerDisplay(new DisplayCanvas(width, height, 8, '#ledder-display', '.ledder-display-box'))

            console.log("got size", width, height)
            svelteDisplayWidth.set(width)
            svelteDisplayHeight.set(height)


        })

        rpc.addMethod("animationList", (list) => {
                svelteAnimations.set(list)

            }
        )

        rpc.addMethod("displayList", (list) => {
            svelteDisplayList.set(list)
        })


        rpc.addMethod("monitoring", (displayNr) => {
            displayNr = Number(displayNr)
            svelteSelectedDisplayNr.set(displayNr)
            localStorage.setItem('selectedDisplayNr', displayNr)

        })

        //start monitoring the same display as last time
        await this.startMonitoring(localStorage.getItem('selectedDisplayNr'))


    }

    async startMonitoring(displayNr) {
        rpc.notify('startMonitoring', displayNr)

    }

    async stopMonitoring() {
        rpc.notify('stopMonitoring')

    }


    async run(animationName: string, presetName: string) {
        await rpc.request("select", animationName + "/" + presetName)


    }

    async refresh() {
        rpc.notify("refresh")
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
        await rpc.request("save", this.presetName)
        await this.run(this.animationName, this.presetName)

        info("Saved preset " + this.presetName, "", 1000)
    }


    async presetDelete() {

        if (!this.presetName)
            return false

        await confirmPromise('Delete preset', 'Do you want to delete preset: ' + this.presetName)

        await rpc.request("delete")
        info("Deleted preset " + this.presetName, "", 2000)

        this.presetName = ""
        // await this.run(this.animationName, this.presetName)


    }

    changePreviewSize(width, height)
    {
        console.log("change", width,height)
        rpc.notify("changePreviewSize", width, height)
    }

}

export let runnerBrowser = new RunnerBrowser()
