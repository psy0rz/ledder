import PixelBox from "../PixelBox.js"
import Scheduler from "../Scheduler.js"
import {presetStore} from "./PresetStore.js"
import Animator from "../Animator.js"
import ControlGroup from "../ControlGroup.js"
import {type PresetValues} from "../PresetValues.js"
import {type Values} from "../Control.js"
import CallbackManager from "../../util/CallbackManager.js"
import chokidar from 'chokidar'


/*
 * We need this, since we will have unhandled rejections once we revoke proxy objects (see below)
 * We cant expect all animations to behave correctly all the time and handle all the edge cases regarding this.
 */
process.on('unhandledRejection', (err) => {
    console.error(err)

})


/**
 * Manages livecycle of an animation. (Loading/Starting/Restarting/Stopping/Cleaning up)
 * Also: This can be used from an Animation to manage sub-animations.
 *
 */
export default class AnimationManager {
    public animationName: string

    public presetName: string
    private presetValues: PresetValues

    public animationClass: typeof Animator
    private animation: Animator

    public selectedCallbacks: CallbackManager<(animationName: string, presetName: string) => void>

    //parents
    public readonly box: PixelBox
    public readonly scheduler: Scheduler
    public readonly controlGroup: ControlGroup

    //childs/proxies
    private proxyScheduler: { proxy: Scheduler; revoke: () => void }
    private proxyControlGroup: { proxy: ControlGroup; revoke: () => void }
    private childBox: PixelBox //NOTE: we cant use a Proxy since its a subclass of a native Set()
    private autoreloadTimeout: NodeJS.Timeout
    private autoreloadWatcher: any

    constructor(box: PixelBox, scheduler: Scheduler, controlGroup: ControlGroup) {

        this.box = box
        this.scheduler = scheduler
        this.controlGroup = controlGroup

        this.createProxies()

        this.selectedCallbacks = new CallbackManager()

    }

    // Detach all childobjects, by creating new ones.
    // This ensures that animations that still have some async call running cannot interfere anymore.
    // Dont forget to cleanup() before, if needed
    // Also detaches this.animation.
    private createProxies() {
        //box
        if (this.childBox !== undefined)
            this.box.delete(this.childBox)

        this.childBox = new PixelBox(this.box)
        this.box.add(this.childBox)

        //scheduler
        if (this.proxyScheduler !== undefined)
            this.proxyScheduler.revoke()
        this.proxyScheduler = Proxy.revocable(this.scheduler, {})

        this.controlGroup.__detach() //removes onChange handlers etc
        if (this.proxyControlGroup !== undefined)
            this.proxyControlGroup.revoke()
        this.proxyControlGroup = Proxy.revocable(this.controlGroup, {})

        this.controlGroup.__onRestartRequired(() => {

            this.restart(true)
        })


    }


    //create class instance of currently loaded animation call run() on it
    public run() {
        if (this.animationClass!==undefined)
        {
            this.animation = new this.animationClass()
            return this.animation.run(this.childBox, this.proxyScheduler.proxy, this.proxyControlGroup.proxy)
        }
    }

    //load only animation
    public async loadAnimation(animationName: string) {
        this.animationName = animationName
        this.autoreload().then(() => {

        })
        this.animationClass = await presetStore.loadAnimation(this.animationName)
        this.selectedCallbacks.trigger(this.animationName, this.presetName)
    }

    //load only preset
    public async loadPreset(presetName: string) {
        this.presetName = presetName
        this.presetValues = await presetStore.load(this.animationName, this.presetName)
        this.controlGroup.load(this.presetValues.values)
        this.selectedCallbacks.trigger(this.animationName, this.presetName)
    }


    //start or restart currently loaded animation
    public restart(keepControls: boolean) {
        this.stop(keepControls)
        return this.run()


    }

    //stop current animation by cleaningup and detaching child objects
    public stop(keepControls: boolean) {

        //this calls onCleanup for the animation
        this.scheduler.__clear()
        //now detach and clean again (in case the animation cleanup did something bad)
        this.createProxies()

        this.scheduler.__clear()
        this.childBox.clear()

        if (!keepControls) {
            this.controlGroup.__clear()
        }

        this.autoreloadStop()

    }

    //force reload of animation from disk and restart it
    public async reload(keepControls: boolean) {
        this.stop(keepControls)
        await this.loadAnimation(this.animationName)
        if (!keepControls)
            await this.loadPreset(this.presetName)
        this.run()
    }

    //select an animation and preset, load it and start it
    public async select(animationAndPresetPath: string, keepControls: boolean) {

        try {
            this.animationName = animationAndPresetPath.match(RegExp("(^.*)/"))[1]
            this.presetName = animationAndPresetPath.match(RegExp("[^/]+$"))[0]
        } catch (e) {
            console.error(`Invalid name: ${animationAndPresetPath}`)
            return
        }

        await this.reload(keepControls)

    }

    public selected()
    {
        return this.animationName + "/" + this.presetName
    }

    autoreloadStop() {
        if (this.autoreloadTimeout !== undefined)
            clearTimeout(this.autoreloadTimeout)

        if (this.autoreloadWatcher !== undefined) {
            this.autoreloadWatcher.close()
            this.autoreloadWatcher = undefined
        }
    }

    //enable automaticly reloading animation file on change to make development easier.
    async autoreload() {

        this.autoreloadStop()
        if (this.animationName) {

            const filename = presetStore.animationFilename(this.animationName)
            // console.log(`Enabling autoreload for animation ${filename}`)

            const watcher = chokidar.watch(filename, {
                persistent: true,
                ignoreInitial: true,
                // awaitWriteFinish: true, // Wait for writes to finish
            })

            watcher.on('change', () => {
                if (this.autoreloadTimeout !== undefined) clearTimeout(this.autoreloadTimeout)
                this.autoreloadTimeout = setTimeout(async () => {
                    console.log(`${filename} changed, auto reloading animation`)
                    await this.reload(false)
                }, 100)
            })

            this.autoreloadWatcher = watcher

        }

    }

    public async updateValue(path: [string], values: Values) {
        try {

            this.controlGroup.updateValue(path, values)
        } catch (e) {
            console.error(e)
        }
    }

    //save current running animation preset (optionally as new presetName)
    async save(presetName?: string) {
        if (presetName !== undefined)
            this.presetName = presetName

        if (this.presetName == undefined)
            return

        this.presetValues.values = this.controlGroup.save()
        await presetStore.save(this.animationName, this.presetName, this.presetValues)
    }

    //delete current running animation preset
    async delete() {
        if (this.presetName !== undefined) {
            await presetStore.delete(this.animationName, this.presetName)
            this.presetName = undefined
        }
    }


}