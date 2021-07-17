import {Matrix} from "./Matrix.js";
import {RpcClient} from "./RpcClient.js";
import * as animations from "./animations/all.js";
import {Control} from "./Control.js";

/**
 * Browser side runner
 */
export class RunnerBrowser {
  matrix: Matrix
  rpc: RpcClient
  animationName: string
  live: boolean;

  constructor(matrix: Matrix, rpc: RpcClient) {
    this.matrix = matrix
    this.rpc = rpc;
    this.live=false;

  }

  /** Send current running animation and preset to server
   *
   */
  async send() {

    await this.rpc.request("runner.run", this.animationName, this.matrix.preset.save());
  }

  /**
   * Called when a value of a preset control has been changed.
   * @param control
   */
  async valueChanged(control: Control)
  {
    if (this.live)
    {
      await this.rpc.request("runner.setValue", control.name, control.save());
    }
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
      if (presetName)
        this.matrix.preset.load(await this.rpc.request("presetStore.load", animationName, presetName));

      this.animationName = animationName
      new animations[animationName](this.matrix)

      if (this.live)
        await this.send();

      return true
    } else
      return false
  }
}
