//render base class
//exposes the animationManager and controlGroup that may be accessed directly.
//can render to one or more display, the first one is the "main" display that determines the size of the box and fps
import AnimationManager from "./AnimationManager.js"
import ControlGroup from "../ControlGroup.js"
import Display from "../Display.js"
import PixelBox from "../PixelBox.js"
import Scheduler from "../Scheduler.js"

export class Render {

    public readonly animationManager: AnimationManager
    public readonly controlGroup: ControlGroup
    public readonly description: string

    public displays: Array<Display>
    protected readonly box: PixelBox
    protected readonly scheduler: Scheduler


    constructor(displays: Array<Display>, description='') {
        this.displays = displays

        this.description=description

        this.controlGroup = new ControlGroup('root')
        this.box = new PixelBox(displays[0])
        this.scheduler = new Scheduler()
        this.scheduler.__setDefaultFrameTime(displays[0].defaultFrameTimeMicros)
        this.animationManager = new AnimationManager(this.box, this.scheduler, this.controlGroup)
    }

    getStats() {
        let count = 0


        this.box.forEachPixel(() => {
            count++
        })
        return (`${this.description}: ${count} pixels.\n${this.scheduler.__getStats()}`)
    }


    start()
    {

    }

    stop(){

    }

}