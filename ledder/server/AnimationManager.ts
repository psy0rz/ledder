import PixelBox from "../PixelBox.js"
import Scheduler from "../Scheduler.js"
import {presetStore} from "./PresetStore.js"
import Animator from "../Animator.js"
import ControlGroup from "../ControlGroup.js"
import {type PresetValues} from "../PresetValues.js"
import {type Values} from "../Control.js"
import CallbackManager from "../../util/CallbackManager.js"
import LayerStack from "./LayerStack.js"
import type RenderSettings from "../RenderSettings.js"
import chokidar from 'chokidar'
import {isAnimationStopped, stoppableProxy} from "./AnimationStopped.js"


/*
 * We need this, since we will have unhandled rejections once we stop the proxy objects (see below)
 * We cant expect all animations to behave correctly all the time and handle all the edge cases regarding this.
 * Those rejections are AnimationStopped: they mean a stopped animation was cut off, which is exactly what
 * should happen, so we drop them without a word. Anything else is a real bug in an animation and stays loud.
 */
process.on('unhandledRejection', (err) => {
    if (isAnimationStopped(err))
        return

    console.error(err)

})


/**
 * Manages livecycle of an animation. (Loading/Starting/Restarting/Stopping/Cleaning up)
 * Also: This can be used from an Animation to manage sub-animations. Just pass your own scheduler
 * in as-is: the constructor isolates its own child from it (unless `root` is set, see below), so
 * this manager's restarts can never clear intervals belonging to the animation that created it.
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

    //Only the manager of the animation the user selected has these: they are the settings of the
    //whole render, and their controls are part of the preset of that animation. A manager thats
    //created by an animation to run sub-animations doesnt get them, so sub-animations cant have
    //render settings of their own.
    private readonly renderSettings: RenderSettings | undefined

    //childs/proxies
    private proxyScheduler: { proxy: Scheduler; revoke: () => void }
    private proxyControlGroup: { proxy: ControlGroup; revoke: () => void }
    private childBox: PixelBox //NOTE: we cant use a Proxy since its a subclass of a native Set()
    private layerStack: LayerStack
    private autoreloadTimeout: NodeJS.Timeout
    private autoreloadWatcher: any

    //NOTE: takes the caller's scheduler and isolates a child from it (see Scheduler.child()), so this
    //manager's own stop()/restart() (which clears its scheduler) can never wipe out intervals
    //belonging to whoever created us. The caller must not use `scheduler` for its own intervals after
    //this: since Scheduler only allows one child, calling this twice on the same scheduler throws.
    //Pass root=true only when `scheduler` is a freshly created one that exists solely to be handed to
    //this manager (e.g. the per-display scheduler in Render.ts): there is then nothing else it could
    //clear out from under, so the extra child scheduler would just be pointless indirection.
    constructor(box: PixelBox, scheduler: Scheduler, controlGroup: ControlGroup, renderSettings?: RenderSettings, root: boolean = false) {

        this.box = box
        this.scheduler = root ? scheduler : scheduler.child()
        this.controlGroup = controlGroup
        this.renderSettings = renderSettings

        this.createProxies()

        this.selectedCallbacks = new CallbackManager()

    }

    // Detach all childobjects, by creating new ones.
    // This ensures that animations that still have some async call running cannot interfere anymore.
    // Dont forget to cleanup() before, if needed
    // Also detaches this.animation.
    private createProxies() {
        //layers (also removes the container the childBox was moved into)
        if (this.layerStack !== undefined) {
            this.layerStack.removeLayers()
            this.layerStack = undefined
        }

        //box
        if (this.childBox !== undefined)
            this.box.delete(this.childBox)

        this.childBox = new PixelBox(this.box)
        this.box.add(this.childBox)

        //scheduler
        if (this.proxyScheduler !== undefined)
            this.proxyScheduler.revoke()
        this.proxyScheduler = stoppableProxy(this.scheduler, "scheduler", () => this.animationName)

        this.controlGroup.__detach() //removes onChange handlers etc
        if (this.proxyControlGroup !== undefined)
            this.proxyControlGroup.revoke()
        this.proxyControlGroup = stoppableProxy(this.controlGroup, "controls", () => this.animationName)

        this.controlGroup.__onRestartRequired(() => {

            this.restart(true)
        })


    }


    //create class instance of currently loaded animation call run() on it
    public run() {
        if (this.animationClass!==undefined)
        {
            //run() can be called again without a stop() in between: the renderer does this as soon as its
            //first display connects, which can be long after the animation was selected at startup.
            //Without this, the previous animation and its layers would keep running and stay in the box forever.
            if (this.animation !== undefined)
                this.stop(true)

            this.animation = new this.animationClass()

            //created first, so the user finds them at the top, above the controls of the animation itself
            if (this.renderSettings !== undefined)
                this.renderSettings.__createControls(this.controlGroup)

            //layers are added around the animation, so every animation supports them without knowing about it
            this.layerStack = new LayerStack(this.box, this.childBox, this.proxyScheduler.proxy, this.proxyControlGroup.proxy, () => {
                this.restart(true)
            })

            const promise = this.animation.run(this.childBox, this.proxyScheduler.proxy, this.proxyControlGroup.proxy)

            //NOTE: not awaited, so run() keeps returning the promise of the animation itself.
            //The scheduler is paused while the layers are loaded from disk, so it doesnt matter that this completes later.
            this.layerStack.createLayers()
                .then(() => this.autoreload())
                .catch((e) => {
                    //the animation was stopped while its layers were still loading: expected, nothing to do
                    if (isAnimationStopped(e))
                        return

                    console.error("LayerStack: ", e)
                })

            return promise
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

        //make sure a stopped animation cannot receive animationEvents anymore
        this.animation = undefined

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

            //also watch the animations that are used as a layer
            const filenames = [presetStore.animationFilename(this.animationName)]
            if (this.layerStack !== undefined)
                filenames.push(...this.layerStack.animationFilenames())
            // console.log(`Enabling autoreload for animations ${filenames}`)

            const watcher = chokidar.watch(filenames, {
                persistent: true,
                ignoreInitial: true,
                // awaitWriteFinish: true, // Wait for writes to finish
            })

            watcher.on('change', (filename) => {
                if (this.autoreloadTimeout !== undefined) clearTimeout(this.autoreloadTimeout)
                this.autoreloadTimeout = setTimeout(async () => {
                    console.log(`${filename} changed, auto reloading animation`)
                    await this.reload(false)
                }, 100)
            })

            this.autoreloadWatcher = watcher

        }

    }

    //forward a realtime event from a GUI client to the currently running animation.
    //the animation gets the same box/scheduler/controls that were passed to its run().
    public animationEvent(name: string, data: any) {
        try {
            if (this.animation !== undefined)
                this.animation.animationEvent(name, data, this.childBox, this.proxyScheduler.proxy, this.proxyControlGroup.proxy)
        } catch (e) {
            //the animation was stopped between the event arriving and it being handled: expected
            if (isAnimationStopped(e))
                return

            console.error(e)
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