import PixelBox from "../PixelBox.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import Animator from "../Animator.js"
import {FxFadeMask} from "../fx/FxFadeMask.js"
import AnimationManager from "../server/AnimationManager.js"
import {presetStore} from "../server/PresetStore.js"
import type ControlSelect from "../ControlSelect.js"
import type {Choices} from "../ControlSelect.js"
import type ControlValue from "../ControlValue.js"
import type {AnimationListType, AnimationListItemType, AnimationListDirType} from "../AnimationListTypes.js"


//shown when a slide is empty
const NONE = "(none)"

//we always show one more (empty) slide than the user is actually using, up to this maximum.
const MAX_SLIDES = 32


//controls of one slide
type SlideControls = {
    slideNr: number
    slideGroup: ControlGroup
    animationSelect: ControlSelect
    presetSelect: ControlSelect
    timeControl: ControlValue
    orderControl: ControlValue
}


/**
 * Shows a sequence of animations one after another, picked from the whole animation/preset tree the
 * same way LayerStack lets you pick layers. Each slide has its own animation, preset, display time and
 * order number, so slides can be reordered without renumbering them all. "Start at" jumps straight to a
 * slide, which is handy while tuning a single slide instead of waiting through the ones before it.
 */
export default class Slideshow extends Animator {
    static title = "Slideshow"
    static description = "Shows a sequence of animations, one after another"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const fader = new FxFadeMask(scheduler, controls)

        const effectSelect = controls.select("Effect", "Fade", [{id: "Fade", name: "Fade"}, {id: "None", name: "None"}], true)
        const fadeTimeControl = controls.value("Fade time (ms)", 500, 0, 5000, 10, true)
        const startAtControl = controls.value("Start at", 1, 1, MAX_SLIDES, 1, true)

        const slidesGroup = controls.group("Slides", true)
        const animations = allAnimations().sort((a, b) => a.name.localeCompare(b.name))

        let slides: Array<SlideControls> = []
        for (let slideNr = 1; slideNr <= MAX_SLIDES; slideNr++)
            slides.push(createSlideControls(slidesGroup, slideNr, animations))

        //show all used slides, plus one empty one to add the next slide to. remove the rest again.
        let lastUsedSlideNr = 0
        for (const slide of slides)
            if (slide.animationSelect.selected !== NONE)
                lastUsedSlideNr = slide.slideNr

        for (let slideNr = lastUsedSlideNr + 2; slideNr <= MAX_SLIDES; slideNr++)
            slidesGroup.remove(slideGroupName(slideNr))
        slides = slides.slice(0, lastUsedSlideNr + 1)

        //the currently showing slide is run through an AnimationManager, so it gets its own lifecycle
        //(loading, revocable proxies, autoreload on file change) exactly like the animation the user
        //would pick directly. Its controls show up live, under "Now playing", while its slide is up.
        const playingControls = controls.group("Now playing", true, true)
        const manager = new AnimationManager(box, scheduler, playingControls)

        while (true) {
            const activeSlides = slides
                .filter((slide) => slide.animationSelect.selected !== NONE)
                .sort((a, b) => a.orderControl.value - b.orderControl.value)

            if (activeSlides.length === 0) {
                await scheduler.delayTime(1)
                continue
            }

            const startIndex = Math.min(Math.max(startAtControl.value - 1, 0), activeSlides.length - 1)

            for (let i = startIndex; i < activeSlides.length; i++) {
                const slide = activeSlides[i]
                const useFade = effectSelect.selected === "Fade"
                const fadeFrames = scheduler.timeToFrames(fadeTimeControl.value / 1000)

                //fade out the previous slide, then swap it for the next one behind the mask
                if (box.size > 0 && useFade)
                    await fader.run(box, true, fadeFrames)

                const presetName = slide.presetSelect.selected === NONE ? "default" : slide.presetSelect.selected
                await manager.select(`${slide.animationSelect.selected}/${presetName}`, false)

                if (useFade)
                    await fader.run(box, false, fadeFrames)

                await scheduler.delayTime(slide.timeControl.value / 1000)
            }
        }
    }
}


function slideGroupName(slideNr: number) {
    return `Slide ${slideNr}`
}


/** Get or create the controls of one slide */
function createSlideControls(slidesGroup: ControlGroup, slideNr: number, animations: Array<AnimationListItemType>): SlideControls {

    const slideGroup = slidesGroup.group(slideGroupName(slideNr), true)

    //NOTE: controls persist between restarts, so the choices of an existing control can be
    //outdated: new animations may have appeared, and the presets depend on the selected animation.
    const animationSelect = slideGroup.select("Animation", NONE, animationChoices(animations), true)
    animationSelect.meta.choices = animationChoices(animations)
    if (!choiceExists(animationSelect.meta.choices, animationSelect.selected))
        animationSelect.selected = NONE

    const presetSelect = slideGroup.select("Preset", NONE, presetChoices(animations, animationSelect.selected), true)
    presetSelect.meta.choices = presetChoices(animations, animationSelect.selected)
    if (!choiceExists(presetSelect.meta.choices, presetSelect.selected))
        presetSelect.selected = NONE

    const timeControl = slideGroup.value("Time (ms)", 8000, 100, 60000, 100, true)

    //NOTE: the range has to fit the default order of the last slide (MAX_SLIDES * 10)
    const orderControl = slideGroup.value("Order", slideNr * 10, 0, MAX_SLIDES * 10, 1, true)

    return {slideNr, slideGroup, animationSelect, presetSelect, timeControl, orderControl}
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
