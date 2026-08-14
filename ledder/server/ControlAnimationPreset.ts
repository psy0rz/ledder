/**
 * Lets the user pick an animation and one of its presets, for animations that run other animations
 * (LayerStack's layers, Slideshow's slides).
 *
 * The choices are rebuilt from what is currently on disk every time this is created, since controls
 * survive a restart: animations that appeared since the preset was saved show up, and a selection
 * that no longer exists falls back to "nothing selected".
 *
 * NOTE: like ControlPosition, this is a compound control: it creates real controls and resolves them
 * for the user, so its not a Control subclass. The controls are added to the group you pass in, not to
 * a group of their own, so they sit next to whatever else that group holds.
 *
 * Can only be used server-side. (it reads the animation list from disk)
 */

import type ControlGroup from "../ControlGroup.js"
import type ControlSelect from "../ControlSelect.js"
import type {Choices} from "../ControlSelect.js"
import type {AnimationListType, AnimationListItemType, AnimationListDirType} from "../AnimationListTypes.js"
import {presetStore} from "./PresetStore.js"


//shown when no animation is selected
export const NONE = "(none)"

//always offered as a preset, even when the animation has no default.json on disk: PresetStore.load()
//falls back to empty values for it, which comes down to "the animations own defaults".
const DEFAULT_PRESET = "default"


export default class ControlAnimationPreset {

    readonly animationSelect: ControlSelect
    readonly presetSelect: ControlSelect

    /**
     * @param controls The group to add the "Animation" and "Preset" controls to
     * @param restartOnPresetChange Restart the animation when the user picks another preset. Selecting
     *  another animation always restarts, since that changes which controls exist.
     */
    constructor(controls: ControlGroup, restartOnPresetChange: boolean = false) {

        const animations = sortedAnimations()

        //NOTE: controls persist between restarts, so the choices of an existing control can be
        //outdated: new animations may have appeared, and the presets depend on the selected animation.
        const animationChoiceList = animationChoices(animations)
        this.animationSelect = controls.select("Animation", NONE, animationChoiceList, true)
        this.animationSelect.meta.choices = animationChoiceList
        if (!choiceExists(animationChoiceList, this.animationSelect.selected))
            this.animationSelect.selected = NONE

        const presetChoiceList = presetChoices(animations, this.animationSelect.selected)
        this.presetSelect = controls.select("Preset", DEFAULT_PRESET, presetChoiceList, restartOnPresetChange)
        this.presetSelect.meta.choices = presetChoiceList
        if (!choiceExists(presetChoiceList, this.presetSelect.selected))
            this.presetSelect.selected = DEFAULT_PRESET
    }


    /** Name of the selected animation, or undefined when nothing is selected */
    get animationName(): string | undefined {
        return this.animationSelect.selected === NONE ? undefined : this.animationSelect.selected
    }


    /** Name of the selected preset. Always set, "default" means the animations own defaults. */
    get presetName(): string {
        return this.presetSelect.selected
    }
}


//Flattening and sorting the whole animation tree is too expensive to redo for every layer or slide,
//so keep the result until PresetStore rescans disk (it assigns a new list when it does).
let sortedAnimationsList: Array<AnimationListItemType> | undefined
let sortedAnimationsSource: AnimationListType | undefined

function sortedAnimations(): Array<AnimationListItemType> {
    if (sortedAnimationsSource !== presetStore.animationPresetList) {
        sortedAnimationsSource = presetStore.animationPresetList
        sortedAnimationsList = allAnimations().sort((a, b) => a.name.localeCompare(b.name))
    }

    return sortedAnimationsList
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
    const choices: Choices = [{id: DEFAULT_PRESET, name: DEFAULT_PRESET}]

    if (animationName !== NONE) {
        const animation = animations.find((animation) => animation.name === animationName)
        if (animation !== undefined)
            for (const preset of animation.presets)
                if (preset.name !== DEFAULT_PRESET)
                    choices.push({id: preset.name, name: preset.name})
    }

    return choices
}
