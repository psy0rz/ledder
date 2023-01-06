import PixelBox from "../PixelBox.js"
import Scheduler from "../Scheduler.js"
import {presetStore} from "./PresetStore.js"
import Animation from "../Animation.js"
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
    public animationClass: typeof Animation
    private animationName: string
    private presetValues: PresetValues
    private animation: Animation

    //parents
    public box: PixelBox
    public scheduler: Scheduler
    private controlGroup: ControlGroup

    //childs
    private childBox: PixelBox
    private proxyScheduler: { proxy: Scheduler; revoke: () => void }
    private proxyControlGroup: { proxy: ControlGroup; revoke: () => void }

    constructor(box: PixelBox, scheduler: Scheduler, controlGroup: ControlGroup) {

        this.box = box
        this.scheduler = scheduler
        this.controlGroup = controlGroup

        this.createProxies(false)

    }

    // Detach all childobjects, by creating new ones.
    // This ensures that animations that still have some async call running cannot interfere anymore.
    // Dont forget to cleanup() before, if needed
    // Also detaches this.animation.
    private createProxies(keepControls: boolean) {
        //box
        if (this.childBox !== undefined)
            this.box.delete(this.childBox)

        this.childBox = new PixelBox(this.box)
        this.box.add(this.childBox)

        //scheduler
        if (this.proxyScheduler !== undefined)
            this.proxyScheduler.revoke()
        this.proxyScheduler = Proxy.revocable(this.scheduler, {})


        //controls
        if (this.proxyControlGroup !== undefined)
            this.proxyControlGroup.revoke()
        this.proxyControlGroup = Proxy.revocable(this.controlGroup, {})


        //animation
        this.animation = undefined

    }

    //cleanup existing child stuff
    private cleanup(keepControls: boolean) {
        if (this.animation !== undefined && this.animation.cleanup !== undefined)
            this.animation.cleanup()

        this.scheduler.clear()
        this.childBox.clear()

        if (!keepControls) {
            this.controlGroup.clear()
        }
    }


    //create class instance of currently loaded animation call run() on it
    public run() {
        // console.log(`RunnerServer: Starting: ${this.animationName} ${this.presetName}`)
        try {
            this.animation = new this.animationClass()
            this.animation.run(this.childBox, this.proxyScheduler.proxy, this.proxyControlGroup.proxy).then(() => {
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

    //load currently selected animation and preset from disk
    private async loadSelected() {
        this.animationClass = await presetStore.loadAnimation(this.animationName)
        this.presetValues = await presetStore.load(this.animationName, this.presetName)
        this.controlGroup.load(this.presetValues.values)

    }

    //load only animation
    public async loadAnimation(animationName: string) {
        this.animationName = animationName
        this.animationClass = await presetStore.loadAnimation(this.animationName)
    }

    //load only preset
    public async loadPreset(presetName: string) {
        this.presetName = presetName
        this.presetValues = await presetStore.load(this.animationName, this.presetName)
        this.controlGroup.load(this.presetValues.values)
    }

    //start or restart currently loaded animation
    public async restart(keepControls: boolean) {
        this.stop(keepControls)
        return this.run()


    }

    //stop current animation by cleaningup and detaching child objects
    public stop(keepControls: boolean) {

        this.cleanup(keepControls)
        this.createProxies(keepControls)
    }

    //force reload of animation from disk and restart it
    public async reload(keepControls: boolean) {
        this.stop(keepControls)
        await this.loadSelected()
        this.run()

    }

    //select an animation and preset, load it and start it
    public async select(animationAndPresetPath: string, keepControls: boolean) {
        this.animationName = animationAndPresetPath.match(RegExp("(^.*)/"))[1]
        this.presetName = animationAndPresetPath.match(RegExp("[^/]+$"))[0]

        await this.reload(keepControls)

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
        // const ret = this.childControlGroup.updateValue(path, values)
        const ret = this.controlGroup.updateValue(path, values)
        if (ret)
            this.restart(true)
        return ret
    }


}