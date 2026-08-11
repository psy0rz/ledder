import type ControlGroup from "./ControlGroup.js"
import type ControlValue from "./ControlValue.js"
import type ControlSwitch from "./ControlSwitch.js"
import type Display from "./Display.js"

/**
 * Settings that determine how the selected animation is rendered, instead of what it renders:
 * framerate and subpixel filtering (and probably more later).
 *
 * These belong to the user, not to the animation: they are plain controls in the root ControlGroup,
 * so they are always visible in the GUI and saved/loaded as part of the preset of the animation the
 * user selected. Animations cannot change them, which is the whole point: every layer and every
 * sub-animation renders into the same frames on the same display, so there is exactly one framerate
 * and one filtering mode, and letting animations set them means whichever layer ran last would win.
 *
 * Owned by the renderer, which reads the values below on every frame.
 */

const GROUP_NAME = "Render settings"

//fps of a control is a whole number, so these are the limits the user can pick between
const MIN_FPS = 1

export default class RenderSettings {

    //frametime of the fps the user picked, clamped to what the display can do
    public frameTimeMicros: number

    //spread pixels on fractional coordinates over the display pixels they overlap (expensive)
    public subpixelFiltering: boolean

    //limits of the primary display, until one is added we use the same defaults as Display
    private defaultFrameTimeMicros: number
    private minFrameTimeMicros: number

    //recreated on every animation start, undefined until then
    private fpsControl: ControlValue
    private subpixelFilteringControl: ControlSwitch

    constructor() {
        this.defaultFrameTimeMicros = ~~(1000000 / 60)
        this.minFrameTimeMicros = ~~(1000000 / 120)

        this.frameTimeMicros = this.defaultFrameTimeMicros
        this.subpixelFiltering = false
    }

    /**
     * Never call this directly, called by the renderer when its primary display changes.
     * The display determines the default framerate and the maximum the user can select.
     */
    public __useDisplayLimits(display: Display) {
        this.defaultFrameTimeMicros = display.defaultFrameTimeMicros
        this.minFrameTimeMicros = display.minFrameTimeMicros

        if (this.fpsControl !== undefined) {
            this.fpsControl.meta.max = this.maxFps()
            if (this.fpsControl.value > this.fpsControl.meta.max)
                this.fpsControl.value = this.fpsControl.meta.max
        }

        this.applyControls()
    }

    /**
     * Never call this directly, called by AnimationManager on every animation start.
     * Creating the controls also loads the values of the preset into them, so this is what makes the
     * settings part of the preset of the selected animation.
     */
    public __createControls(rootControls: ControlGroup) {
        const settingsControls = rootControls.group(GROUP_NAME, false, true)

        this.fpsControl = settingsControls.value("FPS", this.defaultFps(), MIN_FPS, this.maxFps(), 1)
        this.subpixelFilteringControl = settingsControls.switch("Subpixel filtering", false, false)

        //changing these takes effect on the next frame, so nothing has to be restarted
        this.fpsControl.onChange(() => this.applyControls())
        this.subpixelFilteringControl.onChange(() => this.applyControls())

        this.applyControls()
    }

    private applyControls() {
        if (this.fpsControl === undefined) {
            this.frameTimeMicros = this.defaultFrameTimeMicros
            this.subpixelFiltering = false
            return
        }

        //the display cannot go faster than its minimum frametime, so dont let the user ask for more
        //(a preset can hold an fps that a faster display allowed)
        if (this.fpsControl.value > this.fpsControl.meta.max)
            this.fpsControl.value = this.fpsControl.meta.max

        this.frameTimeMicros = ~~(1000000 / this.fpsControl.value)

        this.subpixelFiltering = this.subpixelFilteringControl.enabled
    }

    private defaultFps() {
        return Math.round(1000000 / this.defaultFrameTimeMicros)
    }

    private maxFps() {
        return Math.round(1000000 / this.minFrameTimeMicros)
    }
}
