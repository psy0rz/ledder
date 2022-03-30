import * as animations from "./led/animations/all.js";
import { rpc } from "./RpcClient.js";
import { svelteAnimations } from "./svelteStore.js";
import { confirmPromise, info } from "./led/util.js";
// import $ from "jquery";
// import {confirmPromise, info, promptPromise} from "./util.js";
/**
 * Browser side animation runner
 */
export class RunnerBrowser {
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
        this.live = false;
    }
    init(matrix) {
        this.matrix = matrix;
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
        new this.animationClass(this.matrix);
    }
    /**
     * Runs specified animation with specified preset
     *
     * @param animationName
     * @param presetName
     */
    async run(animationName, presetName) {
        if (animationName in animations) {
            console.log("Runner: starting", animationName, presetName);
            this.matrix.reset();
            // await tick()
            this.animationClass = animations[animationName];
            if (presetName) {
                // @ts-ignore
                this.matrix.preset.load(await rpc.request("presetStore.load", this.animationClass.presetDir, presetName));
            }
            this.animationName = animationName;
            this.presetName = presetName;
            //create the actual animation
            // @ts-ignore
            new this.animationClass(this.matrix);
            // this.updateHtml()
            //do this as last step since it might fail
            if (this.live)
                await this.send();
            return true;
        }
        else
            return false;
    }
    async refreshAnimationList() {
        svelteAnimations.set(await rpc.request("presetStore.getAnimationList"));
    }
    /** Save current preset to server, and create preview
     *
     */
    async presetSave() {
        let preset = this.matrix.preset.save();
        // @ts-ignore
        await rpc.request("presetStore.save", this.animationClass.presetDir, this.presetName, preset);
        await rpc.request("presetStore.createPreview", this.animationName, this.presetName, preset);
        await this.refreshAnimationList();
        info("Saved preset " + this.presetName, "", 2000);
    }
    /** Prompts for new name and saves preset
     *
     */
    async presetSaveAs() {
        // this.presetName=await promptPromise('Enter preset name', "",this.presetName)
        await this.presetSave();
        // this.updateHtml()
    }
    async presetDelete() {
        if (!this.presetName)
            return false;
        await confirmPromise('Delete preset', 'Do you want to delete preset: ' + this.presetName);
        // @ts-ignore
        await rpc.request("presetStore.delete", this.animationClass.presetDir, this.presetName);
        info("Deleted preset " + this.presetName, "", 2000);
        await this.refreshAnimationList();
    }
}
export let runnerBrowser = new RunnerBrowser();
//# sourceMappingURL=RunnerBrowser.js.map