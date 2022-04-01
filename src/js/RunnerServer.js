import * as animations from "./led/animations/all.js";
/**
 * Server side runner
 */
export class RunnerServer {
    constructor(matrix, presetStore) {
        this.matrix = matrix;
        this.presetStore = presetStore;
    }
    /**
     * Runs specified animation with specified preset
     *
     * @param animationName
     * @param preset
     */
    async run(animationName, preset) {
        if (animationName in animations) {
            console.log("Runner: starting", animationName, preset);
            this.matrix.reset();
            const animationClass = animations[animationName];
            if (preset)
                this.matrix.preset.load(preset);
            new animationClass(this.matrix);
            return true;
        }
        else
            return false;
    }
    //load presetName and run
    async runName(animationName, presetName) {
        let preset = undefined;
        if (presetName) {
            preset = await this.presetStore.load(animations[animationName].presetDir, presetName);
        }
        await this.run(animationName, preset);
    }
}
//# sourceMappingURL=RunnerServer.js.map