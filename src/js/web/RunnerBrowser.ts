import {Matrix} from "../ledder/Matrix.js";
import {rpc} from "./RpcClient.js";
import {svelteAnimations, sveltePresets, svelteSelectedAnimationName, svelteSelectedTitle} from "./svelteStore.js";
import {confirmPromise, info, promptPromise} from "./util.js";
import {MatrixCanvas} from "./MatrixCanvas.js";

/**
 * Browser side animation runner
 */
export class RunnerBrowser {
    // matrix: Matrix
    animationName: string
    presetName: string
    animationClass: Animation
    live: boolean;

    presets: Record<string, any>

    constructor() {

    }

    //get current preset values without metadata.
    save()
    {
        const ret={}
        for(const [name, preset] of Object.entries(this.presets))
        {
            const values= {...preset}
            values.meta=undefined
            ret[name]=values
        }
        return ret
    }

    async init() {
        // this.matrix = matrix

        let width = 40
        let height = 8
        rpc.matrix = new MatrixCanvas(width, height, '#ledder-preview');

        rpc.addMethod('control.reset', ()=>
        {
            this.presets={}
            sveltePresets.set([])
        })

        rpc.addMethod('control.add', (params)=>{

            this.presets[params[0].meta.name]=params[0]

            sveltePresets.update(p => {
                p.push(params[0])
                return p
            })
        })


        await rpc.request('context.startPreview', width, height)


    }

    /** Send current running animation and preset to server, and restart local animation as well
     *
     */
    async send() {

        // await rpc.request("runner.run", this.animationName, this.matrix.preset.save());
        await rpc.request("runner.runName", this.animationName, this.presetName);
        // this.restart()
    }


    /**
     * Restart the current animation, keeping the same preset values
     */
    restart() {
        // this.matrix.reset(true);
        // // @ts-ignore
        // new this.animationClass(this.matrix)

    }


    /**
     * Runs specified animation with specified preset
     *
     * @param animationName
     * @param presetName
     */
    async run(animationName: string, presetName: string) {

        // console.log("Runner: starting", animationName, presetName)
        // let module = await import(`../ledder/animations/${animationName}.js`)
        // this.animationClass=module.default
        //
        // this.matrix.reset()
        // svelteSelectedAnimationName.set(animationName)
        //
        // // @ts-ignore
        // svelteSelectedTitle.set(`${this.animationClass.title} -> ${presetName}`)
        //
        // if (presetName) {
        //     // @ts-ignore
        //     this.matrix.preset.load(await rpc.request("presetStore.load", this.animationClass.presetDir, presetName));
        // }

        this.animationName = animationName
        this.presetName = presetName

        //create the actual animation (this will also create the controls in the webbrowser via svelte reactivity)
        // @ts-ignore
        // new this.animationClass(this.matrix)

    }

    async refreshAnimationList() {
        svelteAnimations.set(await rpc.request("presetStore.loadAnimationPresetList"))
    }


    /** Save current preset to server, and create preview
     *
     */
    async presetSave(saveAs = false) {

        if (this.presetName == "" || saveAs)
            this.presetName = await promptPromise('Enter preset name', "", this.presetName)

        if (this.presetName == "")
            return

        let values = this.save()

        // @ts-ignore
        await rpc.request("presetStore.save", this.animationClass.presetDir, this.presetName, values);
        await rpc.request("presetStore.createPreview", this.animationName, this.presetName, values);
        await this.refreshAnimationList()

        await this.run(this.animationName, this.presetName)

        info("Saved preset " + this.presetName, "", 1000)
    }


    async presetDelete() {

        if (!this.presetName)
            return false

        await confirmPromise('Delete preset', 'Do you want to delete preset: ' + this.presetName)

        // @ts-ignore
        await rpc.request("presetStore.delete", this.animationClass.presetDir, this.presetName);
        info("Deleted preset " + this.presetName, "", 2000)

        this.presetName = ""
        await this.run(this.animationName, this.presetName)

        await this.refreshAnimationList()

    }
}

export let runnerBrowser = new RunnerBrowser()
