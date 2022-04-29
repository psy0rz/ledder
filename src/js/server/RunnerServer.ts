import {Matrix} from "../ledder/Matrix.js"
import {PresetStore} from "./PresetStore.js"
import {PresetValues} from "../ledder/PresetValues.js"
import {Animation} from "../ledder/Animation.js"
// import * as fs from "fs";
import {watch} from "fs/promises"
import {AbortController} from "node-abort-controller";

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

    restartTimeout: any
    watchAbort: AbortController


    constructor(matrix: Matrix, presetStore: PresetStore) {
        this.matrix = matrix
        this.presetStore = presetStore
        this.autoreload()

    }

    //automaticly reload animation file on change to make development easier.
    async autoreload() {
        this.watchAbort = new AbortController()
        let watcher = watch(this.presetStore.animationPath, this.watchAbort)

        try {
            for await (const event of watcher) {
                console.log("Detected animation file change:", event);
                if (this.restartTimeout !== undefined)
                    clearTimeout(this.restartTimeout)
                this.restartTimeout = setTimeout(() => this.reload(), 100)
            }
        } catch (e) {
            if (e.name === 'AbortError')
                return
        }
    }

    //stop everything because of cleanup/close
    stop() {
        this.watchAbort.abort()
        this.matrix.reset()


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
    //         this.matrix.control.load(preset);
    //     this.animation = new this.animationClass(this.matrix)
    // }


    //create class instance of currently selected animation and run it
    start() {
        this.animation = new this.animationClass(this.matrix)
        this.animation.run(this.matrix, this.matrix.scheduler, this.matrix.control).then(() => {
            console.log(`RunnerServer: Animation ${this.animationName} finished.`)
        }).catch((e) => {
            if (e != 'abort')
                console.error(`RunnerServer: Animation ${this.animationName} rejected promise: `, e)
        })
    }


    //load presetName and run
    async runName(animationName: string, presetName: string) {

        this.presetName = presetName
        this.animationName = animationName
        this.animationClass = await this.presetStore.loadAnimation(animationName)

        console.log("Runner: starting", animationName, presetName)
        this.matrix.reset()

        if (presetName)
            this.matrix.control.load(await this.presetStore.load(this.animationClass, presetName))

        this.start()

    }

    //force reload of animation from disk
    async reload() {
        try {
            if (this.animationName !== undefined)
                await this.runName(this.animationName, this.presetName)
        } catch (e) {
            console.error(e)
        }
    }

    //restart animation but optionally keep preset values.
    async restart(keepPresets: boolean = false) {
        this.matrix.reset(keepPresets)
        this.start()
    }

    //save current running animation preset
    async save(presetName: string) {
        this.presetName = presetName
        let presetValues = this.matrix.control.save()
        await this.presetStore.save(this.animationClass, presetName, presetValues)
        await this.presetStore.createPreview(this.animationClass, presetName, presetValues)
        await this.presetStore.updateAnimationPresetList()
    }

    //delete current running animation preset
    async delete() {
        if (this.presetName !== undefined) {
            await this.presetStore.delete(this.animationClass, this.presetName)
            await this.presetStore.updateAnimationPresetList()
            this.presetName = undefined
        }
    }

}


