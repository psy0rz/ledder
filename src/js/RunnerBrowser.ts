import {Matrix} from "./led/Matrix.js";
import {rpc} from "./RpcClient.js";
import {svelteAnimations, svelteSelectedAnimationName, svelteSelectedTitle} from "./svelteStore.js";
import {confirmPromise, info, promptPromise} from "./util.js";
// import $ from "jquery";
// import {confirmPromise, info, promptPromise} from "./util.js";

/**
 * Browser side animation runner
 */
export class RunnerBrowser {
    matrix: Matrix
    animationName: string
    presetName: string
    animationClass: Animation
    live: boolean;

    constructor() {

        // this.updateHtml();

        // $("#ledder-send-live").on('click', () => {
        //   this.live = !this.live;
        //   this.updateHtml();
        //   if (this.live)
        //     this.send();
        // })
        //
        // $("#ledder-send-once").on('click', () => {
        //   this.send();
        // })
        // this.live = false;
    }

    init(matrix: Matrix) {
        this.matrix = matrix

    }

    /** Send current running animation and preset to server, and restart local animation as well
     *
     */
    async send() {

        await rpc.request("runner.run", this.animationName, this.matrix.preset.save());
        // this.restart()
    }

    // updateHtml() {
    //   if (this.live) {
    //     // $("#ledder-send-once").addClass("disabled");
    //     $("#ledder-send-live").addClass("red");
    //   } else {
    //     // $("#ledder-send-once").removeClass("disabled");
    //     $("#ledder-send-live").removeClass("red");
    //   }
    //
    //   //update html fields
    //   if (this.presetName) {
    //     $(".ledder-selected-preset").text(this.presetName);
    //     $(".ledder-delete-preset").removeClass("disabled");
    //   } else {
    //     $(".ledder-selected-preset").text("(new)");
    //     $(".ledder-delete-preset").addClass("disabled");
    //   }
    //
    //   $(".ledder-selected-animation").text(this.animationName);
    //
    //   if (this.animationClass) {
    //     // @ts-ignore
    //     $(".ledder-selected-animation-title").text(this.animationClass.title);
    //   }
    // }

    /**
     * Restart the current animation, keeping the same preset values
     */
    restart() {
        // let preset=this.matrix.preset.save();
        this.matrix.reset(true);
        // this.matrix.preset.load(preset);
        // @ts-ignore
        new this.animationClass(this.matrix)

    }


    /**
     * Runs specified animation with specified preset
     *
     * @param animationName
     * @param presetName
     */
    async run(animationName: string, presetName: string) {

        console.log("Runner: starting", animationName, presetName)
        // this.animationClass = animations[animationName];
        let module = await import(`./led/animations/${animationName}.js`)
        this.animationClass=module.default

        this.matrix.reset()
        svelteSelectedAnimationName.set(animationName)

        // @ts-ignore
        svelteSelectedTitle.set(`${this.animationClass.title} -> ${presetName}`)

        if (presetName) {
            // @ts-ignore
            this.matrix.preset.load(await rpc.request("presetStore.load", this.animationClass.presetDir, presetName));
        }

        this.animationName = animationName
        this.presetName = presetName

        //create the actual animation (this will also create the controls in the webbrowser via svelte reactivity)
        // @ts-ignore
        new this.animationClass(this.matrix)

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

        let preset = this.matrix.preset.save();

        // @ts-ignore
        await rpc.request("presetStore.save", this.animationClass.presetDir, this.presetName, preset);
        await rpc.request("presetStore.createPreview", this.animationName, this.presetName, preset);
        await this.refreshAnimationList()

        await this.run(this.animationName, this.presetName)

        info("Saved preset " + this.presetName, "", 2000)
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
