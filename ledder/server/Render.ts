//render base class
//exposes the animationManager and controlGroup that may be accessed directly.
import AnimationManager from "./AnimationManager.js"
import ControlGroup from "../ControlGroup.js"
import Display from "../Display.js"
import PixelBox from "../PixelBox.js"
import Scheduler from "../Scheduler.js"

export class Render {

    public readonly animationManager: AnimationManager
    public readonly controlGroup: ControlGroup
    public readonly description: string

    protected display: Display
    protected readonly box: PixelBox
    protected readonly scheduler: Scheduler


    constructor(display: Display, description='') {
        this.display = display

        this.description=description

        this.controlGroup = new ControlGroup('root')
        this.box = new PixelBox(display)
        this.scheduler = new Scheduler()
        this.scheduler.__setDefaultFrameTime(display.defaultFrameTimeMicros)
        this.animationManager = new AnimationManager(this.box, this.scheduler, this.controlGroup)
    }

    getStats() {
        let count = 0


        this.box.forEachPixel(() => {
            count++
        })
        return (`${this.description}: ${count} pixels.\n${this.scheduler.__getStats()}`)
    }

}