import {Matrix} from "./Matrix.js";
import {RpcClient} from "./RpcClient.js";
import * as animations from "./animations/all.js";
import {Control} from "./Control.js";
import $ from "jquery";
import {confirmPromise, info, promptPromise} from "./util.js";

/**
 * Browser side animation runner
 */
export class RunnerBrowser {
  matrix: Matrix
  rpc: RpcClient
  animationName: string
  presetName: string
  animationClass: Animation
  live: boolean;

  constructor(matrix: Matrix, rpc: RpcClient) {
    this.matrix = matrix
    this.rpc = rpc;
    this.live = true;

    this.updateHtml();

    $("#ledder-send-live").on('click', () => {
      this.live = !this.live;
      this.updateHtml();
      if (this.live)
        this.send();
    })

    $("#ledder-send-once").on('click', () => {
      this.send();
    })
  }

  /** Send current running animation and preset to server, and restart local animation as well
   *
   */
  async send() {

    await this.rpc.request("runner.run", this.animationName, this.matrix.preset.save());
    this.restart()
  }

  updateHtml() {
    if (this.live) {
      // $("#ledder-send-once").addClass("disabled");
      $("#ledder-send-live").addClass("red");
    } else {
      // $("#ledder-send-once").removeClass("disabled");
      $("#ledder-send-live").removeClass("red");
    }

    //update html fields
    if (this.presetName) {
      $(".ledder-selected-preset").text(this.presetName);
      $(".ledder-delete-preset").removeClass("disabled");
    } else {
      $(".ledder-selected-preset").text("(new)");
      $(".ledder-delete-preset").addClass("disabled");
    }

    $(".ledder-selected-animation").text(this.animationName);

    if (this.animationClass) {
      // @ts-ignore
      $(".ledder-selected-animation-title").text(this.animationClass.title);
    }
  }

  /**
   * Restart the current animation, keeping the same preset values
   */
  restart() {
    // let preset=this.matrix.preset.save();
    this.matrix.clear(true);
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


    if (animationName in animations) {
      console.log("Runner: starting", animationName, presetName)
      this.matrix.clear()

      this.animationClass = animations[animationName];

      if (presetName) {
        // @ts-ignore
        this.matrix.preset.load(await this.rpc.request("presetStore.load", this.animationClass.presetDir, presetName));
      }

      this.animationName = animationName
      this.presetName = presetName

      // @ts-ignore
      new this.animationClass(this.matrix)

      if (this.live)
        await this.send();

      this.updateHtml()
      return true
    } else
      return false
  }


  /** Save current preset
   *
   */
  async presetSave() {
    let preset = this.matrix.preset.save();

    // @ts-ignore
    await this.rpc.request("presetStore.save", this.animationClass.presetDir, this.presetName, preset);
    info("Saved preset " + this.presetName, "", 2000)
  }

  /** Prompts for new name and saves preset
   *
   */


  async presetSaveAs() {

    this.presetName=await promptPromise('Enter preset name', "",this.presetName)
    await this.presetSave()
    this.updateHtml()
  }


  async presetDelete() {

    if (!this.presetName)
      return false

    await confirmPromise('Delete preset', 'Do you want to delete preset: ' + this.presetName)

    // @ts-ignore
    await this.rpc.request("presetStore.delete", this.animationClass.presetDir, this.presetName);
    info("Deleted preset " + this.presetName, "", 2000)
    this.presetName = undefined
    this.updateHtml()
  }
}
