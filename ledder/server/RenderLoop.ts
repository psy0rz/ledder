import Display from "../Display.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import PixelBox from "../PixelBox.js"
import AnimationManager from "./AnimationManager.js"

/**
 * Main renderer. Will create an AnimationManager that manages an Animation, and renders it to specified Display
 */
export class RenderLoop {
    private display: Display

    private nextTimeMicros: number
    private lastFrameMicros:number

    private keepRendering: boolean

    public readonly animationManager: AnimationManager
    private readonly box: PixelBox
    private readonly scheduler: Scheduler
    public readonly controlGroup: ControlGroup

    constructor(display: Display) {
        this.display = display

        this.controlGroup = new ControlGroup('root')
        this.box = new PixelBox(display)
        this.scheduler = new Scheduler()
        this.scheduler.setDefaultFrameTime(display.defaultFrameTimeMicros)
        this.animationManager = new AnimationManager(this.box, this.scheduler, this.controlGroup)
    }

    start() {
        if (!this.keepRendering) {
            this.keepRendering = true
            this.nextTimeMicros = Date.now() * 1000
            this.lastFrameMicros=0
            this.renderInterval()
        }
    }

    //the main step-render-send loop

    renderInterval() {
        if (!this.keepRendering)
            return

        this.nextTimeMicros += this.scheduler.step()
        if (this.nextTimeMicros-this.lastFrameMicros>=this.display.minFrameTimeMicros) {
            try {
                this.display.render(this.box)
            } catch (e) {
                console.error("Exception while rendering:", e)
            }
            this.display.frame(this.nextTimeMicros)
            this.lastFrameMicros=this.nextTimeMicros
        }

        const intervalmS = (this.nextTimeMicros /1000) - Date.now()
        setTimeout(() => this.renderInterval(), intervalmS)

    }

    stop() {
        this.keepRendering = false
        this.animationManager.stop(false)
    }

    getStats()
    {
            let count=0
            this.box.forEachPixel( ()=>{
                count++
            })
            return (`${count} pixels.\n${this.scheduler.getStats()}`)
    }

}


