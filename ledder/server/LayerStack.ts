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

const LAYERS_GROUP_NAME = "Layers"

//we always show one more (empty) layer than the user is actually using, up to this maximum.
const MAX_LAYERS = 16


//controls of one layer
type LayerControls = {
    layerNr: number
    layerGroup: ControlGroup
    animationSelect: ControlSelect
    presetSelect: ControlSelect
    zControl: ControlValue
}

//a box thats rendered at a certain Z: either a layer, or the animation the user selected
type ZOrderedBox = {
    box: PixelBox
    zControl: ControlValue
}


export default class LayerStack {

    //parent box, usually the box of the renderer
    private readonly parentBox: PixelBox

    //holds all z-ordered boxes, so we can re-order them without touching anything we dont own
    private readonly stackBox: PixelBox

    //box of the animation the user has selected
    private readonly animationBox: PixelBox

    private readonly scheduler: Scheduler
    private readonly rootControls: ControlGroup

    //asks AnimationManager to restart everything (used after loading a preset into a layer)
    private readonly restartAnimation: () => void

    private zOrderedBoxes: Array<ZOrderedBox>
    private layerFilenames: Array<string>

    //set by removeLayers(), so async stuff thats still running cannot do any harm anymore
    private removed: boolean

    constructor(parentBox: PixelBox, animationBox: PixelBox, scheduler: Scheduler, rootControls: ControlGroup, restartAnimation: () => void) {
        this.parentBox = parentBox
        this.animationBox = animationBox
        this.scheduler = scheduler
        this.rootControls = rootControls
        this.restartAnimation = restartAnimation

        this.zOrderedBoxes = []
        this.layerFilenames = []
        this.removed = false

        //NOTE: the stackBox stays detached until applyZOrder() attaches it. This way the animation keeps
        //rendering from the parent box while we load the layers from disk, instead of turning black.
        this.stackBox = new PixelBox(parentBox)
    }


    /** Create the layer controls and start all configured layers */
    async createLayers() {

        //normally called once per instance, but dont accumulate boxes/layers if its not
        this.zOrderedBoxes = []
        this.layerFilenames = []

        //restartOnChange only applies to the switch of the group itself, so muting/unmuting all layers restarts.
        const layersControls = this.rootControls.group(LAYERS_GROUP_NAME, true, true, true, true)

        //the selected animation is just another z-ordered box, so layers can be put behind it as well
        this.zOrderedBoxes.push({
            box: this.animationBox,
            zControl: layersControls.value("Z of animation", 0, -100, 100, 1)
        })

        //note that creating the controls also loads their values from the preset, which is how we
        //find out how many layers this preset actually uses.
        const animations = allAnimations().sort((a, b) => a.name.localeCompare(b.name))
        let layers: Array<LayerControls> = []
        for (let layerNr = 1; layerNr <= MAX_LAYERS; layerNr++)
            layers.push(this.createLayerControls(layersControls, layerNr, animations))

        //show all used layers, plus one empty one to add the next layer to. remove the rest again.
        let lastUsedLayerNr = 0
        for (const layer of layers)
            if (layer.animationSelect.selected !== NONE)
                lastUsedLayerNr = layer.layerNr

        for (let layerNr = lastUsedLayerNr + 2; layerNr <= MAX_LAYERS; layerNr++)
            layersControls.remove(layerGroupName(layerNr))
        layers = layers.slice(0, lastUsedLayerNr + 1)

        //only show the layer settings unfolded when this preset actually uses layers
        layersControls.meta.collapsed = (lastUsedLayerNr === 0)

        if (layersControls.enabled) {
            //dont let the animation advance while we're loading layers from disk
            this.scheduler.stop()
            try {
                for (const layer of layers)
                    await this.startLayer(layer)
            } finally {
                //a restart during the loading above already resetted the scheduler
                if (!this.removed)
                    this.scheduler.resume()
            }
        }

        //we were removed while loading layers from disk, so dont attach anything anymore
        if (this.removed)
            return

        //changing the order shouldnt restart anything, so we handle it ourselves
        for (const zOrderedBox of this.zOrderedBoxes)
            zOrderedBox.zControl.onChange(() => this.applyZOrder())

        this.applyZOrder()
    }


    /**
     * Render all boxes in the order the user wants.
     * Rendering is done in the order the boxes were added, and the pixels live inside those boxes,
     * so re-adding them is all it takes: nothing is restarted or lost.
     */
    applyZOrder() {
        if (this.removed)
            return

        //take over the animation from the parent box, so we decide where it is rendered.
        //(adding something thats already in a Set keeps its original position, so this is a no-op after the first time)
        this.parentBox.delete(this.animationBox)
        this.parentBox.add(this.stackBox)

        this.stackBox.clear()
        for (const zOrderedBox of [...this.zOrderedBoxes].sort((a, b) => a.zControl.value - b.zControl.value))
            this.stackBox.add(zOrderedBox.box)
    }


    /** Remove all layers and the stackBox from the parent box */
    removeLayers() {
        this.removed = true

        this.parentBox.delete(this.stackBox)
    }


    /** Files of the currently running layer animations, so AnimationManager can watch them as well */
    animationFilenames() {
        return this.layerFilenames
    }


    /** Get or create the controls of one layer */
    private createLayerControls(layersControls: ControlGroup, layerNr: number, animations: Array<AnimationListItemType>): LayerControls {

        //restartOnChange only applies to the switch of the group itself, so muting/unmuting this layer restarts.
        const layerGroup = layersControls.group(layerGroupName(layerNr), true, false, true, true)

        //NOTE: controls persist between restarts, so the choices of an existing control can be
        //outdated: new animations may have appeared, and the presets depend on the selected animation.
        const animationSelect = layerGroup.select("Animation", NONE, animationChoices(animations), true)
        animationSelect.meta.choices = animationChoices(animations)
        if (!choiceExists(animationSelect.meta.choices, animationSelect.selected))
            animationSelect.selected = NONE

        const presetSelect = layerGroup.select("Preset", NONE, presetChoices(animations, animationSelect.selected))
        presetSelect.meta.choices = presetChoices(animations, animationSelect.selected)
        if (!choiceExists(presetSelect.meta.choices, presetSelect.selected))
            presetSelect.selected = NONE

        //NOTE: the range has to fit the default Z of the last layer (MAX_LAYERS * 10)
        const zControl = layerGroup.value("Z", layerNr * 10, -200, 200, 1)

        return {layerNr, layerGroup, animationSelect, presetSelect, zControl}
    }


    /** Load and start the animation of one layer */
    private async startLayer(layer: LayerControls) {

        if (this.removed)
            return

        const animationName = layer.animationSelect.selected

        //Store the current values, so the settings of a previously selected animation are not lost
        //when we remove its controls below. (save() keeps values of controls that no longer exist,
        //so they come back when the user selects that animation again)
        layer.layerGroup.save()
        for (const control of Object.values(layer.layerGroup.meta.controls))
            if (control.meta.type === 'controls' && control.meta.name !== animationName)
                layer.layerGroup.remove(control)

        //empty or muted layer
        if (animationName === NONE || !layer.layerGroup.enabled)
            return

        let animationClass
        try {
            animationClass = await presetStore.loadAnimation(animationName)
        } catch (e) {
            console.error(`LayerStack: cannot load layer animation ${animationName}: `, e)
            return
        }

        if (this.removed)
            return

        //the animation gets its own group, so its controls cant collide with ours (or with those of a
        //previously selected animation). The GUI renders it inline, so the user doesnt see the difference.
        const animationControls = layer.layerGroup.group(animationName)
        animationControls.meta.inline = true

        this.loadPresetWhenSelected(layer, animationName, animationControls)

        const layerBox = new PixelBox(this.stackBox)
        this.zOrderedBoxes.push({box: layerBox, zControl: layer.zControl})
        this.layerFilenames.push(presetStore.animationFilename(animationName))

        try {
            const promise = new animationClass().run(layerBox, this.scheduler, animationControls)
            //not awaited: a layer usually runs forever. (and run() isnt always async)
            if (typeof promise?.catch === 'function')
                promise.catch((e) => console.error(`LayerStack: layer ${animationName} failed: `, e))
        } catch (e) {
            console.error(`LayerStack: layer ${animationName} failed: `, e)
        }
    }


    /**
     * Load the selected preset into a layer, but only when the user actually selects one:
     * a preset is just a starting point, after that the values are part of our own preset.
     */
    private loadPresetWhenSelected(layer: LayerControls, animationName: string, animationControls: ControlGroup) {

        //NOTE: onChange() always calls back once during registration, and we dont want to overwrite
        //the users changes with the preset again on every restart.
        let registering = true

        layer.presetSelect.onChange(() => {
            if (registering)
                return

            const presetName = layer.presetSelect.selected
            if (presetName === NONE)
                return

            presetStore.load(animationName, presetName)
                .then((preset) => {
                    if (this.removed)
                        return
                    animationControls.load(preset.values)
                    this.restartAnimation()
                })
                .catch((e) => console.error(`LayerStack: cannot load preset ${animationName}/${presetName}: `, e))
        })

        registering = false
    }
}


function layerGroupName(layerNr: number) {
    return `Layer ${layerNr}`
}

function choiceExists(choices: Choices, id: string) {
    return choices.some((choice) => choice.id === id)
}

//flatten the animation/preset tree into a plain list of animations
function allAnimations(animationList: AnimationListType = presetStore.animationPresetList, found: Array<AnimationListItemType> = []) {
    for (const item of animationList) {
        const dir = item as AnimationListDirType
        if (dir.animationList !== undefined)
            allAnimations(dir.animationList, found)
        else
            found.push(item as AnimationListItemType)
    }
    return found
}

function animationChoices(animations: Array<AnimationListItemType>): Choices {
    const choices: Choices = [{id: NONE, name: NONE}]
    for (const animation of animations)
        choices.push({id: animation.name, name: animation.name})
    return choices
}

function presetChoices(animations: Array<AnimationListItemType>, animationName: string): Choices {
    const choices: Choices = [{id: NONE, name: NONE}]

    if (animationName !== NONE) {
        const animation = animations.find((animation) => animation.name === animationName)
        if (animation !== undefined)
            for (const preset of animation.presets)
                choices.push({id: preset.name, name: preset.name})
    }

    return choices
}
