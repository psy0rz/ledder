import {Matrix} from "../ledder/Matrix.js"
import {PresetStore} from "./PresetStore.js"
import {PresetValues} from "../ledder/PresetValues.js"
import {Animation} from "../ledder/Animation.js"
// import * as fs from "fs";
import {watch} from "fs/promises"
import {AbortController} from "node-abort-controller";
import {Scheduler} from "../ledder/Scheduler.js";
import {ControlGroup} from "../ledder/ControlGroup.js";
import {Interval} from "../ledder/Interval.js";

/**
 * Server side runner. This is the main thing that calls everything to run animations.
 */
export class RunnerServer {
    matrix: Matrix
    scheduler: Scheduler
    controlGroup: ControlGroup

    private presetStore: PresetStore
    private animationClass: typeof Animation
    private animation: Animation
    private animationName: string
    private presetName: string
    private presetValues: PresetValues

    private restartTimeout: any
    private watchAbort: any

    private renderInterval: any


    constructor(matrix: Matrix, controls: ControlGroup, presetStore: PresetStore) {
        this.matrix = matrix
        this.scheduler = new Scheduler()
        this.matrix.scheduler = this.scheduler
        this.controlGroup = controls
        this.presetStore = presetStore
        this.autoreload()

    }

    startRenderLoop() {
        let frameNr = 0
        this.renderInterval = setInterval(() => {
            //FIXME: migrate timing loop from matrixledstream
            this.matrix.frame(frameNr, Date.now())
            this.scheduler.step()
            this.matrix.render()
            frameNr = frameNr + 1
        }, 16)
        //FIXME: fps control


    }

    stopRenderLoop() {
        clearInterval(this.renderInterval)
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
        this.stopRenderLoop()
        this.scheduler.clear()
        this.watchAbort.abort()
        this.matrix.reset()
    }

    //create class instance of currently selected animation and run it
    start() {
        console.log(`RunnerServer: Starting ${this.animationName}`)
        try {
            this.animation = new this.animationClass(this.matrix)
            this.animation.run(this.matrix, this.scheduler, this.controlGroup).then(() => {
                console.log(`RunnerServer: Animation ${this.animationName} finished.`)
            }).catch((e) => {
                if (e != 'abort') {
                    console.error(`RunnerServer: Animation ${this.animationName} rejected promise: `, e)
                    if (process.env.NODE_ENV === 'development')
                        throw(e)
                }
            })
        } catch (e) {
            console.error("RunnerServer: Exception in animation", e)
            if (process.env.NODE_ENV === 'development')
                throw(e)
        }
    }

    //load presetName and run
    async runName(animationName: string, presetName: string) {

        this.presetName = presetName
        this.animationName = animationName
        this.animationClass = await this.presetStore.loadAnimation(animationName)

        console.log("Runner: starting", animationName, presetName)
        this.scheduler.clear()
        this.matrix.reset()
        this.controlGroup.clear()


        if (presetName) {
            this.presetValues = await this.presetStore.load(this.animationClass, presetName)
            this.controlGroup.load(this.presetValues.values)
        }
        else
        {
            this.presetValues= {
                title:"",
                description:"",
                values:{}
            }

        }

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
        if (!keepPresets)
            this.controlGroup.clear()
        this.scheduler.clear()
        this.matrix.reset()

        this.start()
    }

    //save current running animation preset
    async save(presetName: string) {
        this.presetName = presetName
        this.presetValues.values = this.controlGroup.save()
        await this.presetStore.save(this.animationClass, presetName, this.presetValues)
        await this.presetStore.createPreview(this.animationClass, presetName, this.presetValues)
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


