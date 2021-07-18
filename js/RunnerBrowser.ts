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
   * Runs specified animation with specified preset
   *
   * @param animationName
   * @param presetName
   */
  async run(animationName: string, presetName: string) {


    if (animationName in animations) {
      console.log("Runner: starting", animationName, presetName)
      this.matrix.clear()

      const animationClass=animations[animationName];

      if (presetName)
        this.matrix.preset.load(await this.rpc.request("presetStore.load", animationClass.presetDir, presetName));

      this.animationName = animationName
      new animationClass(this.matrix)

      if (this.live)
        await this.send();

      return true
    } else
      return false
  }
}
