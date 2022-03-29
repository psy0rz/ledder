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
}
//# sourceMappingURL=RunnerServer.js.map