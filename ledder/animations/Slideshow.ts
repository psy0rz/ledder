import PixelBox from "../PixelBox.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import Animator from "../Animator.js"
import {FxFadeMask} from "../fx/FxFadeMask.js"
import AnimationManager from "../server/AnimationManager.js"
import ControlAnimationPreset from "../server/ControlAnimationPreset.js"
import type ControlValue from "../ControlValue.js"


//we always show one more (empty) slide than the user is actually using, up to this maximum.
const MAX_SLIDES = 32


//controls of one slide
type SlideControls = {
    slideNr: number
    slideGroup: ControlGroup
    animationPreset: ControlAnimationPreset
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
    static description = "Shows a sequence of animations, one after another"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const fader = new FxFadeMask(scheduler, controls)

        const effectSelect = controls.select("Effect", "Fade", [{id: "Fade", name: "Fade"}, {id: "None", name: "None"}], true)
        const fadeTimeControl = controls.value("Fade time (ms)", 500, 0, 5000, 10, true)
        const startAtControl = controls.value("Start at", 1, 1, MAX_SLIDES, 1, true)

        const slidesGroup = controls.group("Slides", true)

        let slides: Array<SlideControls> = []
        for (let slideNr = 1; slideNr <= MAX_SLIDES; slideNr++)
            slides.push(createSlideControls(slidesGroup, slideNr))

        //show all used slides, plus one empty one to add the next slide to. remove the rest again.
        let lastUsedSlideNr = 0
        for (const slide of slides)
            if (slide.animationPreset.animationName !== undefined)
                lastUsedSlideNr = slide.slideNr

        for (let slideNr = lastUsedSlideNr + 2; slideNr <= MAX_SLIDES; slideNr++)
            slidesGroup.remove(slideGroupName(slideNr))
        slides = slides.slice(0, lastUsedSlideNr + 1)

        //the currently showing slide is run through an AnimationManager, so it gets its own lifecycle
        //(loading, revocable proxies, autoreload on file change) exactly like the animation the user
        //would pick directly. Its controls show up live, under "Now playing", while its slide is up.
        const playingControls = controls.group("Now playing", true, true)
        const manager = new AnimationManager(box, scheduler, playingControls)

        //We own this manager, so we have to tear it down ourselves when we're stopped or restarted:
        //it watches the current slide's file for changes (autoreload), and a leaked watcher keeps
        //reloading animations into our box forever. Since every control here restarts us, that would
        //pile up a new watcher per tweak.
        let stopped = false
        scheduler.onCleanup(() => {
            stopped = true
            manager.stop(true)
        })

        while (!stopped) {
            const activeSlides = slides
                .filter((slide) => slide.animationPreset.animationName !== undefined)
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

                await manager.select(`${slide.animationPreset.animationName}/${slide.animationPreset.presetName}`, false)

                //select() re-arms the file watcher, so if we were cleaned up while it was loading we
                //have to stop the manager again, otherwise that watcher outlives us after all.
                if (stopped) {
                    manager.stop(true)
                    return
                }

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
function createSlideControls(slidesGroup: ControlGroup, slideNr: number): SlideControls {

    const slideGroup = slidesGroup.group(slideGroupName(slideNr), true)

    //picking another preset should restart, so the slide is shown with it right away
    const animationPreset = new ControlAnimationPreset(slideGroup, true)

    const timeControl = slideGroup.value("Time (ms)", 8000, 100, 60000, 100, true)

    //NOTE: the range has to fit the default order of the last slide (MAX_SLIDES * 10)
    const orderControl = slideGroup.value("Order", slideNr * 10, 0, MAX_SLIDES * 10, 1, true)

    return {slideNr, slideGroup, animationPreset, timeControl, orderControl}
}
