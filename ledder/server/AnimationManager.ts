import {AbortController} from "node-abort-controller"
import {watch} from "fs/promises"
import PixelBox from "../PixelBox.js"
import Scheduler from "../Scheduler.js"
import {PresetStore} from "./PresetStore.js"
import Animation from "../Animation.js"
import Display from "../Display.js"
import ControlGroup from "../ControlGroup.js"
import {PresetValues} from "../PresetValues.js"
import {Values} from "../Control.js"

/**
 * Manages livecycle of an animation. (Loading/Starting/Restarting/Stopping/Cleaning up)
 * Also: This should be used from an Animation to manage sub-animations.
 *
 */
export default class AnimationManager {
    private presetName: string
    private animationClass: typeof Animation
    private animationName: string
    private presetStore: PresetStore
    private presetValues: PresetValues
    private animation: Animation

    //parents
    private box: PixelBox
    private scheduler: Scheduler
    private controlGroup: ControlGroup

    //childs
    private childBox: PixelBox
    private childScheduler: Scheduler
    private childControlGroup: ControlGroup

    constructor(box: PixelBox, scheduler: Scheduler, controlGroup: ControlGroup) {
        this.presetStore = new PresetStore()
        this.box = box
        this.scheduler = scheduler
        this.controlGroup = controlGroup

        this.newChilds(false)

    }

    // Detach all childobjects, by creating new ones.
    // This ensures that animations that still have some async call running cannot interfere anymore.
    // Dont forget to cleanup() before, if needed
    // Also detaches this.animation.
    private newChilds(keepControls: boolean) {
        this.childBox = new PixelBox(this.box)
        this.box.add(this.childBox)

        this.childScheduler = this.scheduler.child()
        this.animation = undefined

        if (!keepControls)
            this.childControlGroup = this.controlGroup.group('Child')
    }

    //cleanup existing child stuff
    private cleanup(keepControls: boolean) {
        if (this.animation !== undefined && this.animation.cleanup !== undefined)
            this.animation.cleanup()
        this.childScheduler.clear() //will actual clear parent as well
        this.childBox.clear()

        if (!keepControls)
            this.childControlGroup.clear()
    }


    //create class instance of currently loaded animation call run() on it
    private run() {
        console.log(`RunnerServer: Starting: ${this.animationName} ${this.presetName}`)
        try {
            this.animation = new this.animationClass()
            this.animation.run(this.childBox, this.childScheduler, this.childControlGroup).then(() => {
                // console.log(`RunnerServer: Animation ${this.animationName} finished.`)
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

    //load currently selected animation from disk
    private async load() {
        this.animationClass = await this.presetStore.loadAnimation(this.animationName)
        this.presetValues = await this.presetStore.load(this.animationName, this.presetName)
        this.childControlGroup.load(this.presetValues.values)
//        this.autoreload(this.presetStore.animationFilename(this.animationName)).then()

    }

    //start or restart currently loaded animation
    public async start(keepControls: boolean) {
        this.stop(keepControls)
        return this.run()


    }

    //stop current animation by cleaningup and detaching child objects
    public stop(keepControls: boolean) {

        this.cleanup(keepControls)
        this.newChilds(keepControls)
    }

    //select an animation and preset, load it and start it
    public async select(animationAndPresetPath: string, keepControls: boolean) {
        this.animationName = animationAndPresetPath.match(RegExp("(^.*)/"))[1]
        this.presetName = animationAndPresetPath.match(RegExp("[^/]+$"))[0]

        await this.load()
        return this.start(keepControls)

    }

    //force reload of animation from disk and restart it
    public async reload(keepControls: boolean) {
        this.stop(keepControls)
        await this.load()
        return this.start(keepControls)

    }


    //automaticly reload animation file on change to make development easier.
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

    public updateValue(path: [string], values: Values): boolean {
        const ret = this.childControlGroup.updateValue(path, values)
        if (ret)
            this.start(true)
        return ret
    }


}