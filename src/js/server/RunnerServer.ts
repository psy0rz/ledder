import {Matrix} from "../ledder/Matrix.js"
import {PresetStore} from "./PresetStore.js"
import {PresetValues} from "../ledder/PresetValues.js"
import {Animation} from "../ledder/Animation.js"
import * as fs from "fs";
import { watch } from "fs/promises"


/**
 * Server side runner
 */
export class RunnerServer {
    matrix: Matrix
    presetStore: PresetStore
    animationClass: typeof Animation
    animation: Animation
    animationName: string
    presetName: string



    constructor(matrix: Matrix, presetStore: PresetStore) {
        this.matrix = matrix
        this.presetStore = presetStore
        this.autorestart()

    }

    async autorestart()
    {
        const watcher=watch(this.presetStore.animationPath)
        let timer

        for await (const event of watcher) {
            console.log("Detected animation file change:", event);
            if (timer!==undefined)
                clearTimeout(timer)
            timer=setTimeout( ()=> this.restart(), 100)
        }

    }


    /**
     * Runs specified animation with specified preset
     *
     */
    // async run(animationName: string, preset: PresetValues) {
    //
    //     this.animationClass = await this.presetStore.loadAnimation(animationName)
    //     console.log("Runner: starting", animationName, preset)
    //     this.matrix.reset()
    //
    //     if (preset)
    //         this.matrix.preset.load(preset);
    //     this.animation = new this.animationClass(this.matrix)
    // }

    //load presetName and run
    async runName(animationName: string, presetName: string) {

        this.presetName=presetName
        this.animationName = animationName
        this.animationClass = await this.presetStore.loadAnimation(animationName)

        console.log("Runner: starting", animationName, presetName)
        this.matrix.reset()

        if (presetName)
            this.matrix.preset.load(await this.presetStore.load(this.animationClass, presetName))


        this.animation = new this.animationClass(this.matrix)

    }

    async restart()
    {
        if (this.animationName!==undefined)
            await this.runName(this.animationName, this.presetName)
    }

    //save current running animation preset
    async save(presetName:string) {
        this.presetName=presetName
        let presetValues = this.matrix.preset.save()
        await this.presetStore.save(this.animationClass, presetName, presetValues)
        await this.presetStore.createPreview(this.animationClass, presetName, presetValues)
    }

    //delete current running animation preset
    async delete()
    {
        if (this.presetName!==undefined) {
            await this.presetStore.delete(this.animationClass, this.presetName)
            await this.presetStore.updateAnimationPresetList()
            this.presetName=undefined
        }
    }

}


