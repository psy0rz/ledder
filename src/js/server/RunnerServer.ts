import {Display} from "../ledder/Display.js"
import {PresetStore} from "./PresetStore.js"
import {PresetValues} from "../ledder/PresetValues.js"
import {Animation} from "../ledder/Animation.js"
// import * as fs from "fs";
import {watch} from "fs/promises"
import {AbortController} from "node-abort-controller";
import {Scheduler} from "../ledder/Scheduler.js";
import {ControlGroup} from "../ledder/ControlGroup.js";
import {ControlValue} from "../ledder/ControlValue.js";
import {Values} from "../ledder/Control.js";


/**
 * Server side runner. This is the main thing that calls everything to run animations.
 */
export class RunnerServer {
    private matrix: Display
    private scheduler: Scheduler
    private controlGroup: ControlGroup

    private presetStore: PresetStore
    private animationClass: typeof Animation
    private animation: Animation
    private animationName: string
    private presetName: string
    private presetValues: PresetValues

    private restartTimeout: any
    private watchAbort: any

    // private renderInterval: any
    private lastTime: number
    private keepRendering: boolean

    private fpsControl: ControlValue

    constructor(matrix: Display, controls: ControlGroup, presetStore: PresetStore) {
        this.matrix = matrix
        this.scheduler = new Scheduler()
        this.matrix.scheduler = this.scheduler
        this.controlGroup = controls
        this.presetStore = presetStore
        this.autoreload()
        this.resetControls()
        console.log("Runner server for ", matrix)

    }

    startRenderLoop() {
        this.keepRendering = true
        this.lastTime = 0
        this.renderFrame()
    }

    async renderFrame() {

        const now = Date.now();

        const frameMs = this.matrix.frameMs

        if (!this.keepRendering)
            return

        //increase time with exact framedelay instead of sending now, since setInterval is jittery
        this.lastTime = this.lastTime + frameMs;
        //too far off, reset
        if (Math.abs(now - this.lastTime) > frameMs) {
            console.warn("RunnerServer: resetting timing (too slow?)")
            this.lastTime = now;
            setTimeout(() => this.renderFrame(), frameMs)
        } else {
            const interval = this.lastTime - now + frameMs;
            setTimeout(() => this.renderFrame(), interval)
        }

        try {
            this.matrix.render(this.matrix)
        }
        catch(e)
        {
            console.error("Exception while rendering:" ,e )
        }
        this.matrix.frame(this.lastTime)

        //NOTE: we run the scheduler as last, sync this may in fact queue up all kinds of async events which need to be handled before calling matrix.render()
        this.scheduler.step()


    }

    stopRenderLoop() {
        this.keepRendering = false
        // clearInterval(this.renderInterval)
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
        this.matrix.clear()
    }

    //create class instance of currently selected animation and run it
    start() {
        console.log(`RunnerServer: Starting ${this.animationName}`)
        try {
            this.animation = new this.animationClass()
            this.animation.run(this.matrix, this.scheduler, this.controlGroup).then(() => {
                console.log(`RunnerServer: Animation ${this.animationName} finished.`)
            }).catch((e) => {
                if (e != 'abort') {
                    console.error(`RunnerServer: Animation ${this.animationName} rejected promise: `, e)
                    // if (process.env.NODE_ENV === 'development')
                    //     throw(e)
                }
            })
        } catch (e) {
            console.error("RunnerServer: Exception in animation", e)
            // if (process.env.NODE_ENV === 'development')
            //     throw(e)
        }
    }

    resetControls() {
        this.controlGroup.clear()
        this.fpsControl = this.controlGroup.value("FPS", 60, 1, 120)
        this.matrix.setFps(this.fpsControl.value)

    }

    //load presetName and run
    async runName(animationName: string, presetName: string) {

        this.presetName = presetName
        this.animationName = animationName
        this.animationClass = await this.presetStore.loadAnimation(animationName)

        console.log("Runner: starting", animationName, presetName)
        this.scheduler.clear()
        this.matrix.clear()
        this.resetControls()

        if (presetName) {
            this.presetValues = await this.presetStore.load(this.animationClass, presetName)
            this.controlGroup.load(this.presetValues.values)
            this.matrix.setFps(this.fpsControl.value)
        } else {
            this.presetValues = {
                title: "",
                description: "",
                values: {}
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
            this.resetControls()
        this.scheduler.clear()
        this.matrix.clear()

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

    updateValue(path: [string], values: Values): boolean {
        const ret = this.controlGroup.updateValue(path, values)
        this.matrix.setFps(this.fpsControl.value)
        return ret
    }
}


