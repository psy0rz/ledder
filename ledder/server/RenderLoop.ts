import Display from "../Display.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import PixelBox from "../PixelBox.js"
import AnimationManager from "./AnimationManager.js"

/**
 * Main renderer. Will render an AnimationManager to a Display
 */
export class RenderLoop {
    private display: Display

    private nextTimeuS: number
    private keepRendering: boolean

    public animationManager: AnimationManager
    private box: PixelBox
    private scheduler: Scheduler
    private controlGroup: ControlGroup

    constructor(display: Display) {
        this.display = display

        this.controlGroup = new ControlGroup('root')
        this.box = new PixelBox(display)
        this.scheduler = new Scheduler()
        this.scheduler.setDefaultFrameTime(display.defaultFrameTime)
        this.animationManager = new AnimationManager(this.box, this.scheduler, this.controlGroup)
    }

    start() {
        if (!this.keepRendering) {
            this.keepRendering = true
            this.nextTimeuS = Date.now() * 1000
            this.renderFrame()
        }
    }

    renderFrame() {
        if (!this.keepRendering)
            return


        //step, render, send
        this.nextTimeuS += this.scheduler.step()
        try {
            this.display.render(this.box)
        } catch (e) {
            console.error("Exception while rendering:", e)
        }
        this.display.frame(this.nextTimeuS)

        const intervalmS = (this.nextTimeuS /1000) - Date.now()
        setTimeout(() => this.renderFrame(), intervalmS)

    }

    stop() {
        this.keepRendering = false
    }

}


