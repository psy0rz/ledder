import {Matrix} from "./Matrix.js";
import {RpcClient} from "./RpcClient.js";
import * as animations from "./animations/all.js";

/**
 * Browser side runner
 */
export class RunnerBrowser {
    matrix: Matrix
    rpc: RpcClient

    constructor(matrix: Matrix, rpc: RpcClient) {
        this.matrix = matrix
        this.rpc = rpc;

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
            new animations[animationName](this.matrix)
            return true
        } else
            return false
    }
}
