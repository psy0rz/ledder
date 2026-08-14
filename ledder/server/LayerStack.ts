/**
 * Adds layers to any animation: extra animations that are rendered on top of, or behind, the animation
 * the user has selected. The order is determined by a user controllable Z value per layer.
 *
 * This is created and driven by AnimationManager, so every animation supports layers without needing
 * any code of its own. The layer settings live in the root ControlGroup, so they are saved and loaded
 * as part of a normal preset of the selected animation.
 *
 * Layers are recursive: an animation used as a layer gets its own LayerStack, so a preset that uses
 * layers keeps working when its used as a layer itself. Every layer gets its own container box that
 * takes up exactly one slot in our z-order, and the nested stack only re-orders inside that container.
 * So you stack whole stacks on top of eachother, and a nested layer can never end up between our own
 * layers.
 *
 * Can only be used server-side. (it loads animations from disk)
 */

import PixelBox from "../PixelBox.js"
import type Scheduler from "../Scheduler.js"
import type ControlGroup from "../ControlGroup.js"
import type ControlValue from "../ControlValue.js"
import ControlAnimationPreset from "./ControlAnimationPreset.js"
import {presetStore} from "./PresetStore.js"


//name of the group with all our layers: the top level has "Layers", a nested stack has "Sublayers",
//so its clear which stack a layer belongs to when you're looking at a deeply nested control tree.
const LAYERS_GROUP_NAME = "Layers"
const SUBLAYERS_GROUP_NAME = "Sublayers"

//we always show one more (empty) layer than the user is actually using, up to this maximum.
const MAX_LAYERS = 16

//how deep layers may be nested. Prevents endless recursion when presets refer to eachother,
//and keeps the control tree in the GUI readable.
const MAX_DEPTH = 3


//controls of one layer
type LayerControls = {
    layerNr: number
    layerGroup: ControlGroup
    animationPreset: ControlAnimationPreset
    zControl: ControlValue
}

//a box thats rendered at a certain Z: either a layer, or the animation the user selected
type ZOrderedBox = {
    box: PixelBox
    zControl: ControlValue
}

//where a nested stack sits in the layer tree, only used to give its controls names the user can follow
type Nesting = {
    //how many stacks are above us
    depth: number

    //numbers of the layers above us, e.g. "1.2." so our own layers become "Layer 1.2.1", "Layer 1.2.2", ...
    layerNumberPrefix: string

    //the animation this stack adds layers to, e.g. "Fires/Fire"
    hostAnimationName: string
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

    //where we are in the layer tree: undefined for the animation the user selected
    private readonly nesting: Nesting | undefined

    private zOrderedBoxes: Array<ZOrderedBox>
    private layerFilenames: Array<string>

    //the stacks of the layer animations, so we can remove them and collect their filenames
    private nestedStacks: Array<LayerStack>

    //set by removeLayers(), so async stuff thats still running cannot do any harm anymore
    private removed: boolean

    constructor(parentBox: PixelBox, animationBox: PixelBox, scheduler: Scheduler, rootControls: ControlGroup, restartAnimation: () => void, nesting?: Nesting) {
        this.parentBox = parentBox
        this.animationBox = animationBox
        this.scheduler = scheduler
        this.rootControls = rootControls
        this.restartAnimation = restartAnimation
        this.nesting = nesting

        this.zOrderedBoxes = []
        this.layerFilenames = []
        this.nestedStacks = []
        this.removed = false

        //NOTE: the stackBox stays detached until applyZOrder() attaches it. This way the animation keeps
        //rendering from the parent box while we load the layers from disk, instead of turning black.
        this.stackBox = new PixelBox(parentBox)
    }


    /** Create the layer controls and start all configured layers */
    async createLayers() {

        //too deeply nested: dont add layer controls at all. We never attach our stackBox, so the
        //animation just keeps rendering from the parent box.
        if (this.nesting !== undefined && this.nesting.depth >= MAX_DEPTH)
            return

        //normally called once per instance, but dont accumulate boxes/layers if its not
        this.zOrderedBoxes = []
        this.layerFilenames = []
        this.nestedStacks = []

        //restartOnChange only applies to the switch of the group itself, so muting/unmuting all layers restarts.
        const layersGroupName = (this.nesting === undefined) ? LAYERS_GROUP_NAME : SUBLAYERS_GROUP_NAME
        const layersControls = this.rootControls.group(layersGroupName, true, true, true, true)

        //the animation we add layers to is just another z-ordered box, so layers can be put behind it as well.
        //Naming it after the animation makes clear that this only orders it against our own layers.
        const hostZName = (this.nesting === undefined) ? "Z of animation" : `Z of ${this.nesting.hostAnimationName}`
        this.zOrderedBoxes.push({
            box: this.animationBox,
            zControl: layersControls.value(hostZName, 0, -100, 100, 1)
        })

        //note that creating the controls also loads their values from the preset, which is how we
        //find out how many layers this preset actually uses.
        let layers: Array<LayerControls> = []
        for (let layerNr = 1; layerNr <= MAX_LAYERS; layerNr++)
            layers.push(this.createLayerControls(layersControls, layerNr))

        //show all used layers, plus one empty one to add the next layer to. remove the rest again.
        let lastUsedLayerNr = 0
        for (const layer of layers)
            if (layer.animationPreset.animationName !== undefined)
                lastUsedLayerNr = layer.layerNr

        for (let layerNr = lastUsedLayerNr + 2; layerNr <= MAX_LAYERS; layerNr++)
            layersControls.remove(this.layerGroupName(layerNr))
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

        for (const nestedStack of this.nestedStacks)
            nestedStack.removeLayers()

        this.parentBox.delete(this.stackBox)
    }


    /** Files of all currently running layer animations, so AnimationManager can watch them as well */
    animationFilenames() {
        const filenames = [...this.layerFilenames]
        for (const nestedStack of this.nestedStacks)
            filenames.push(...nestedStack.animationFilenames())
        return filenames
    }


    /**
     * Name of the group of one of our layers. Nested stacks number their layers after the layer they
     * live in ("Layer 2.1"), so you can tell from the name alone which stack a layer belongs to.
     */
    private layerGroupName(layerNr: number) {
        const prefix = (this.nesting === undefined) ? "" : this.nesting.layerNumberPrefix
        return `Layer ${prefix}${layerNr}`
    }


    /** How a nested stack inside one of our layers should number and name its own controls */
    private nestingOfLayer(layer: LayerControls, animationName: string): Nesting {
        const prefix = (this.nesting === undefined) ? "" : this.nesting.layerNumberPrefix
        return {
            depth: (this.nesting === undefined) ? 1 : this.nesting.depth + 1,
            layerNumberPrefix: `${prefix}${layer.layerNr}.`,
            hostAnimationName: animationName,
        }
    }


    /** Get or create the controls of one layer */
    private createLayerControls(layersControls: ControlGroup, layerNr: number): LayerControls {

        //restartOnChange only applies to the switch of the group itself, so muting/unmuting this layer restarts.
        const layerGroup = layersControls.group(this.layerGroupName(layerNr), true, false, true, true)

        //a preset is just a starting point here (see loadPresetWhenSelected), so picking one shouldnt restart
        const animationPreset = new ControlAnimationPreset(layerGroup)

        //NOTE: the range has to fit the default Z of the last layer (MAX_LAYERS * 10)
        const zControl = layerGroup.value("Z", layerNr * 10, -200, 200, 1)

        return {layerNr, layerGroup, animationPreset, zControl}
    }


    /** Load and start the animation of one layer */
    private async startLayer(layer: LayerControls) {

        if (this.removed)
            return

        const animationName = layer.animationPreset.animationName

        //Store the current values, so the settings of a previously selected animation are not lost
        //when we remove its controls below. (save() keeps values of controls that no longer exist,
        //so they come back when the user selects that animation again)
        layer.layerGroup.save()
        for (const control of Object.values(layer.layerGroup.meta.controls))
            if (control.meta.type === 'controls' && control.meta.name !== animationName)
                layer.layerGroup.remove(control)

        //empty or muted layer
        if (animationName === undefined || !layer.layerGroup.enabled)
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

        //The container is what we z-order, the animation renders one level deeper. This way the nested
        //stack can re-order everything inside the container, without us undoing that in applyZOrder(),
        //and without the nested layers ever escaping the containers slot in our own z-order.
        const layerContainerBox = new PixelBox(this.stackBox)
        const layerAnimationBox = new PixelBox(layerContainerBox)
        layerContainerBox.add(layerAnimationBox)

        this.zOrderedBoxes.push({box: layerContainerBox, zControl: layer.zControl})
        this.layerFilenames.push(presetStore.animationFilename(animationName))

        try {
            const promise = new animationClass().run(layerAnimationBox, this.scheduler, animationControls)
            //not awaited: a layer usually runs forever. (and run() isnt always async)
            if (typeof promise?.catch === 'function')
                promise.catch((e) => console.error(`LayerStack: layer ${animationName} failed: `, e))
        } catch (e) {
            console.error(`LayerStack: layer ${animationName} failed: `, e)
        }

        //the layer animation might use layers itself. Its controls are its own root, so its layer
        //settings are saved as part of the layers controls, just like ours are part of the preset.
        const nestedStack = new LayerStack(layerContainerBox, layerAnimationBox, this.scheduler, animationControls, this.restartAnimation, this.nestingOfLayer(layer, animationName))
        this.nestedStacks.push(nestedStack)
        await nestedStack.createLayers()

        //we were removed while the nested stack was loading from disk, and removeLayers() may have
        //already passed it by, so make sure it doesnt keep running.
        if (this.removed)
            nestedStack.removeLayers()
    }


    /**
     * Load the selected preset into a layer, but only when the user actually selects one:
     * a preset is just a starting point, after that the values are part of our own preset.
     */
    private loadPresetWhenSelected(layer: LayerControls, animationName: string, animationControls: ControlGroup) {

        //NOTE: onChange() always calls back once during registration, and we dont want to overwrite
        //the users changes with the preset again on every restart.
        let registering = true

        layer.animationPreset.presetSelect.onChange(() => {
            if (registering)
                return

            const presetName = layer.animationPreset.presetName

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
