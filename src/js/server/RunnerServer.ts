import {Matrix} from "../ledder/Matrix.js"
import {PresetStore} from "./PresetStore.js"
import {PresetValues} from "../ledder/PresetValues.js"
import {Animation} from "../ledder/Animation.js"


/**
 * Server side runner
 */
export class RunnerServer {
    matrix: Matrix
    presetStore: PresetStore
    animationClass: typeof Animation
    animation: Animation

    constructor(matrix: Matrix, presetStore: PresetStore) {
        this.matrix = matrix
        this.presetStore = presetStore

    }

    /**
     * Runs specified animation with specified preset
     *
     */
    async run(animationName: string, preset: PresetValues) {

        this.animationClass = await this.presetStore.loadAnimation(animationName)
        console.log("Runner: starting", animationName, preset)
        this.matrix.reset()

        if (preset)
            this.matrix.preset.load(preset);
        this.animation = new this.animationClass(this.matrix)
    }

    //load presetName and run
    async runName(animationName: string, presetName: string) {

        this.animationClass = await this.presetStore.loadAnimation(animationName)
        console.log("Runner: starting", animationName, presetName)
        this.matrix.reset()

        if (presetName)
            this.matrix.preset.load(await this.presetStore.load(this.animationClass, presetName))

        this.animation = new this.animationClass(this.matrix)
    }

    //save current running animation preset
    async save(presetName:string) {
        let presetValues = this.matrix.preset.save()
        await this.presetStore.save(this.animationClass, presetName, presetValues)
        await this.presetStore.createPreview(this.animationClass, presetName, presetValues)
        await this.presetStore.updateAnimationPresetList()
    }

}


