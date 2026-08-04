/**
 * Adds layers to any animation: extra animations that are rendered on top of, or behind, the animation
 * the user has selected. The order is determined by a user controllable Z value per layer.
 *
 * This is created and driven by AnimationManager, so every animation supports layers without needing
 * any code of its own. The layer settings live in the root ControlGroup, so they are saved and loaded
 * as part of a normal preset of the selected animation.
 *
 * Can only be used server-side. (it loads animations from disk)
 */

import PixelBox from "../PixelBox.js"
import type Scheduler from "../Scheduler.js"
import type ControlGroup from "../ControlGroup.js"
import type ControlValue from "../ControlValue.js"
import type ControlSelect from "../ControlSelect.js"
import type {Choices} from "../ControlSelect.js"
import type {AnimationListType, AnimationListItemType, AnimationListDirType} from "../AnimationListTypes.js"
import {presetStore} from "./PresetStore.js"


//shown when a layer is empty, or when no preset should be applied
export const NONE = "(none)"

const LAYERS_GROUP = "Layers"

//we always show one more (empty) layer than the user is actually using, up to this maximum.
const MAX_SLOTS = 16


//controls of one layer
type Slot = {
    nr: number
    group: ControlGroup
    animation: ControlSelect
    preset: ControlSelect
    z: ControlValue
}

//something thats rendered at a certain Z: either a layer, or the selected animation itself
type Entry = {
    box: PixelBox
    z: ControlValue
}


export default class LayerStack {

    //parent box, usually the box of the renderer
    private readonly box: PixelBox

    //all entries live in here, so we can re-order them without touching anything we dont own
    private readonly container: PixelBox

    //box of the animation the user has selected
    private readonly baseBox: PixelBox

    private readonly scheduler: Scheduler
    private readonly controls: ControlGroup

    //asks AnimationManager to restart everything (used after loading a preset into a layer)
    private readonly restart: () => void

    private entries: Array<Entry>
    private layerFilenames: Array<string>

    //enabled-state of all switchable groups, to detect that the user muted or unmuted something
    private layersGroup: ControlGroup
    private muteStates: Array<{ group: ControlGroup, enabled: boolean }>
    private muteWatcher: () => void

    //set to false by remove(), so async stuff thats still running cannot do any harm anymore
    private valid: boolean

    constructor(box: PixelBox, baseBox: PixelBox, scheduler: Scheduler, controls: ControlGroup, restart: () => void) {
        this.box = box
        this.baseBox = baseBox
        this.scheduler = scheduler
        this.controls = controls
        this.restart = restart

        this.entries = []
        this.layerFilenames = []
        this.muteStates = []
        this.valid = true

        //NOTE: the container stays detached until resort() attaches it. This way the animation keeps
        //rendering from the parent box while we load the layers from disk, instead of turning black.
        this.container = new PixelBox(box)
    }


    /** Create the layer controls and start all configured layers */
    async build() {

        //normally called once per instance, but dont accumulate entries/layers if its not
        this.entries = []
        this.layerFilenames = []

        const layers = this.controls.group(LAYERS_GROUP, false, true, true, true)
        this.layersGroup = layers

        //the selected animation is just another entry, so layers can be put behind it as well
        this.entries.push({box: this.baseBox, z: layers.value("Z of animation", 0, -100, 100, 1)})

        //note that creating the controls also loads their values from the preset, which is how we
        //find out how many layers this preset actually uses.
        let slots: Array<Slot> = []
        for (let nr = 1; nr <= MAX_SLOTS; nr++)
            slots.push(this.slotControls(layers, nr))

        //show all used layers, plus one empty one to add the next layer to. remove the rest again.
        let used = 0
        for (const slot of slots)
            if (slot.animation.selected !== NONE)
                used = slot.nr

        for (let nr = used + 2; nr <= MAX_SLOTS; nr++)
            layers.remove(slotName(nr))
        slots = slots.slice(0, used + 1)

        if (layers.enabled) {
            //dont let the animation advance while we're loading layers from disk
            this.scheduler.stop()
            try {
                for (const slot of slots)
                    await this.runSlot(slot)
            } finally {
                //a restart during the loading above already resetted the scheduler
                if (this.valid)
                    this.scheduler.resume()
            }
        }

        //we were stopped while loading layers from disk, so dont attach anything anymore
        if (!this.valid)
            return

        //changing the order shouldnt restart anything, so we handle it ourselves
        for (const entry of this.entries)
            entry.z.onChange(() => this.resort())

        this.resort()

        this.watchMutes(layers, slots)
    }


    /**
     * Restart when the user mutes or unmutes something.
     *
     * A switchable ControlGroup has no onChange, and its restartOnChange would restart on every change
     * of every control inside it (including the Z and the controls of the layer animation itself).
     * So instead we watch for meta updates and check if an enabled-state actually changed.
     */
    private watchMutes(layers: ControlGroup, slots: Array<Slot>) {

        if (this.muteWatcher !== undefined)
            layers.__updateMetaCallbacks.unregister(this.muteWatcher)

        this.muteStates = [{group: layers, enabled: layers.enabled}]
        for (const slot of slots)
            this.muteStates.push({group: slot.group, enabled: slot.group.enabled})

        this.muteWatcher = () => {
            if (!this.valid)
                return

            for (const state of this.muteStates)
                if (state.group.enabled !== state.enabled) {
                    this.restart()
                    return
                }
        }

        layers.__updateMetaCallbacks.register(this.muteWatcher)
    }


    /**
     * Render all entries in the order the user wants.
     * Rendering is done in the order the boxes were added, and the pixels live inside the entry boxes,
     * so re-adding them is all it takes: nothing is restarted or lost.
     */
    resort() {
        if (!this.valid)
            return

        //take over the animation from the parent box, so we decide where it is rendered.
        //(adding something thats already in a Set keeps its original position, so this is a no-op after the first time)
        this.box.delete(this.baseBox)
        this.box.add(this.container)

        this.container.clear()
        for (const entry of [...this.entries].sort((a, b) => a.z.value - b.z.value))
            this.container.add(entry.box)
    }


    /** Remove all layers and the container from the parent box */
    remove() {
        this.valid = false

        if (this.layersGroup !== undefined && this.muteWatcher !== undefined)
            this.layersGroup.__updateMetaCallbacks.unregister(this.muteWatcher)

        this.box.delete(this.container)
    }


    /** Files of the currently running layer animations, so AnimationManager can watch them as well */
    filenames() {
        return this.layerFilenames
    }


    /** Get or create the controls of one layer */
    private slotControls(layers: ControlGroup, nr: number): Slot {

        const group = layers.group(slotName(nr), false, false, true, true)

        //NOTE: controls persist between restarts, so the choices of an existing control can be
        //outdated: new animations may have appeared, and the presets depend on the selected animation.
        const animation = group.select("Animation", NONE, animationChoices(), true)
        animation.meta.choices = animationChoices()
        if (!hasChoice(animation.meta.choices, animation.selected))
            animation.selected = NONE

        const preset = group.select("Preset", NONE, presetChoices(animation.selected))
        preset.meta.choices = presetChoices(animation.selected)
        if (!hasChoice(preset.meta.choices, preset.selected))
            preset.selected = NONE

        const z = group.value("Z", nr * 10, -100, 100, 1)

        return {nr, group, animation, preset, z}
    }


    /** Load and start the animation of one layer */
    private async runSlot(slot: Slot) {

        if (!this.valid)
            return

        const animationName = slot.animation.selected

        //Store the current values, so the settings of a previously selected animation are not lost
        //when we remove its controls below. (save() keeps values of controls that no longer exist,
        //so they come back when the user selects that animation again)
        slot.group.save()
        for (const control of Object.values(slot.group.meta.controls))
            if (control.meta.type === 'controls' && control.meta.name !== animationName)
                slot.group.remove(control)

        //empty or muted layer
        if (animationName === NONE || !slot.group.enabled)
            return

        let animationClass
        try {
            animationClass = await presetStore.loadAnimation(animationName)
        } catch (e) {
            console.error(`LayerStack: cannot load layer animation ${animationName}: `, e)
            return
        }

        if (!this.valid)
            return

        const controls = slot.group.group(animationName)
        this.presetOnChange(slot, animationName, controls)

        const box = new PixelBox(this.container)
        this.entries.push({box, z: slot.z})
        this.layerFilenames.push(presetStore.animationFilename(animationName))

        try {
            const promise = new animationClass().run(box, this.scheduler, controls)
            if (promise !== undefined)
                promise.catch((e) => console.error(`LayerStack: layer ${animationName} failed: `, e))
        } catch (e) {
            console.error(`LayerStack: layer ${animationName} failed: `, e)
        }
    }


    /**
     * Load the selected preset into a layer, but only when the user actually selects one:
     * a preset is just a starting point, after that the values are part of our own preset.
     */
    private presetOnChange(slot: Slot, animationName: string, controls: ControlGroup) {

        //NOTE: onChange() always calls back once during registration, and we dont want to overwrite
        //the users changes with the preset again on every restart.
        let registering = true

        slot.preset.onChange(() => {
            if (registering)
                return

            const presetName = slot.preset.selected
            if (presetName === NONE)
                return

            presetStore.load(animationName, presetName)
                .then((preset) => {
                    if (!this.valid)
                        return
                    controls.load(preset.values)
                    this.restart()
                })
                .catch((e) => console.error(`LayerStack: cannot load preset ${animationName}/${presetName}: `, e))
        })

        registering = false
    }
}


function slotName(nr: number) {
    return `Layer ${nr}`
}

function hasChoice(choices: Choices, id: string) {
    return choices.some((choice) => choice.id === id)
}

//flatten the animation/preset tree into a plain list of animations
function animationItems(list: AnimationListType = presetStore.animationPresetList, ret: Array<AnimationListItemType> = []) {
    for (const item of list) {
        const dir = item as AnimationListDirType
        if (dir.animationList !== undefined)
            animationItems(dir.animationList, ret)
        else
            ret.push(item as AnimationListItemType)
    }
    return ret
}

function animationChoices(): Choices {
    const choices: Choices = [{id: NONE, name: NONE}]
    for (const item of animationItems().sort((a, b) => a.name.localeCompare(b.name)))
        choices.push({id: item.name, name: item.name})
    return choices
}

function presetChoices(animationName: string): Choices {
    const choices: Choices = [{id: NONE, name: NONE}]

    if (animationName !== NONE) {
        const item = animationItems().find((item) => item.name === animationName)
        if (item !== undefined)
            for (const preset of item.presets)
                choices.push({id: preset.name, name: preset.name})
    }

    return choices
}
