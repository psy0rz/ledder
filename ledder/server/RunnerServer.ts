import Display from "../Display.js"
import {PresetStore} from "./PresetStore.js"
import {PresetValues} from "../PresetValues.js"
import Animation from "../Animation.js"
// import * as fs from "fs";
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import ControlValue from "../ControlValue.js"
import {Values} from "../Control.js"
import PixelBox from "../PixelBox.js"
import AnimationManager from "./AnimationManager.js"


/**
 * Server side runner. This is the main thing that calls everything to run animations.
 */
export class RunnerServer {
    private display: Display
    public scheduler: Scheduler
    private controlGroup: ControlGroup

    private presetStore: PresetStore
    private animationClass: typeof Animation
    private animationName: string
    private presetName: string
    private presetValues: PresetValues

    // private restartTimeout: any
    // private watchAbort: any

    // private renderInterval: any
    private lastTime: number
    private keepRendering: boolean

    private fpsControl: ControlValue
    public box: PixelBox
    public animationManager: AnimationManager

    constructor(display: Display, controls: ControlGroup, presetStore: PresetStore) {
        this.display = display

        this.controlGroup = controls
        this.presetStore = presetStore
        this.box=new PixelBox(display)

        this.scheduler=new Scheduler()
        this.animationManager=new AnimationManager(this.box, this.scheduler, controls )
        // this.resetControls()
        // this.resetAnimation()
        // console.log("Runner server for ", display)

    }

    // //reset animation, by creating new objects. This ensures that animation that still have some async call running cannot interfere with the next one.
    // //Also calls Animation.cleanup() to allow cleaning up such stuff.
    // resetAnimation() {
    //     // console.log(`RunnerServer: Animation ${this.animationName} finished.`)
    //
    //     this.box = new PixelBox(this.display)
    //     this.scheduler = new Scheduler()
    //     if (this.animation!==undefined && this.animation.cleanup !== undefined)
    //         this.animation.cleanup()
    //     this.animation=undefined
    // }


    startRenderLoop() {
        this.keepRendering = true
        this.lastTime = 0
        this.renderFrame()
    }

    renderFrame() {

        const now = Date.now()

        const frameMs = this.display.frameMs

        if (!this.keepRendering)
            return

        //increase time with exact framedelay instead of sending now, since setInterval is jittery
        this.lastTime = this.lastTime + frameMs
        //too far off, reset
        if (Math.abs(now - this.lastTime) > frameMs) {
            console.warn("RunnerServer: resetting timing (too slow?)")
            this.lastTime = now
            setTimeout(() => this.renderFrame(), frameMs)
        } else {
            const interval = this.lastTime - now + frameMs
            setTimeout(() => this.renderFrame(), interval)
        }

        try {
            this.display.render(this.box)
        } catch (e) {
            console.error("Exception while rendering:", e)
        }
        this.display.frame(this.lastTime)

        //NOTE: we run the scheduler as last, sync this may in fact queue up all kinds of async events which need to be handled before calling display.render()
        this.scheduler.step()


    }

    stopRenderLoop() {
        this.keepRendering = false
        // clearInterval(this.renderInterval)
    }

    // //automaticly reload animation file on change to make development easier.
    // async autoreload(filename: string) {
    //
    //     if (this.watchAbort !== undefined)
    //         this.watchAbort.abort()
    //
    //     this.watchAbort = new AbortController()
    //
    //     let watcher = watch(filename, {
    //         signal: this.watchAbort.signal
    //     })
    //
    //     try {
    //         for await (const event of watcher) {
    //             console.log("Detected animation file change:", event)
    //             if (this.restartTimeout !== undefined)
    //                 clearTimeout(this.restartTimeout)
    //             this.restartTimeout = setTimeout(() => this.reload(), 100)
    //         }
    //     } catch (e) {
    //         if (e.name === 'AbortError')
    //             return
    //         throw e
    //     }
    // }


    //stop everything because of cleanup/close
    stop() {
        this.stopRenderLoop()
        // this.resetAnimation()
        this.animationManager.stop(false)
    }

    //create class instance of currently selected animation and run it
    // start() {
    //     console.log(`RunnerServer: Starting: ${this.animationName} ${this.presetName}`)
    //     try {
    //         this.resetAnimation()
    //         this.animation = new this.animationClass()
    //         this.animation.run(this.box, this.scheduler, this.controlGroup).then(() => {
    //             // console.log(`RunnerServer: Animation ${this.animationName} finished.`)
    //         }).catch((e) => {
    //             if (e != 'abort') {
    //                 console.error(`RunnerServer: Animation ${this.animationName} rejected promise: `, e)
    //                 // if (process.env.NODE_ENV === 'development')
    //                 //     throw(e)
    //             }
    //         })
    //     } catch (e) {
    //         console.error("RunnerServer: Exception in animation", e)
    //         // if (process.env.NODE_ENV === 'development')
    //         //     throw(e)
    //     }
    // }

    // resetControls() {
    //     this.controlGroup.clear()
    //     this.fpsControl = this.controlGroup.value("FPS", 60, 1, 120)
    //     this.display.setFps(this.fpsControl.value)
    //
    // }

    // //load presetName and run
    // async runName(animationName: string, presetName: string = "default") {
    //
    //
    //     this.presetName = presetName
    //     this.animationName = animationName
    //     this.animationClass = await this.presetStore.loadAnimation(animationName)
    //     this.autoreload(this.presetStore.animationFilename(animationName)).then()
    //
    //     // console.log("Runner: starting", animationName, presetName)
    //     this.resetControls()
    //
    //     this.presetValues = await this.presetStore.load(animationName, presetName)
    //
    //     this.controlGroup.load(this.presetValues.values)
    //     this.display.setFps(this.fpsControl.value)
    //
    //     this.start()
    //
    // }
    //
    // //force reload of animation from disk
    // async reload() {
    //     try {
    //         if (this.animationName !== undefined)
    //             await this.runName(this.animationName, this.presetName)
    //     } catch (e) {
    //         console.error(e)
    //     }
    // }

    // //restart animation but optionally keep preset values.
    // restart(keepPresets: boolean = false) {
    //     if (!keepPresets)
    //         this.resetControls()
    //     console.log("RESTART")
    //     this.start()
    // }

    //save current running animation preset
    async save(presetName: string) {
        this.presetName = presetName
        this.presetValues.values = this.controlGroup.save()
        await this.presetStore.save(this.animationName, presetName, this.presetValues)
        await this.presetStore.createPreview(this.animationClass, this.animationName, presetName, this.presetValues)
        await this.presetStore.storeAnimationPresetList(false, false)
    }

    //delete current running animation preset
    async delete() {
        if (this.presetName !== undefined) {
            await this.presetStore.delete(this.animationName, this.presetName)
            await this.presetStore.storeAnimationPresetList(false, false)
            this.presetName = undefined
        }
    }

    // updateValue(path: [string], values: Values): boolean {
    //     const ret = this.controlGroup.updateValue(path, values)
    //     this.display.setFps(this.fpsControl.value)
    //     return ret
    // }
}


