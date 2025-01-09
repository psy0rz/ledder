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

    protected displays: Set<Display>
    public readonly box: PixelBox
    protected readonly scheduler: Scheduler


    constructor( description='') {
        this.displays = new Set()

        this.description=description

        this.controlGroup = new ControlGroup('root')
        this.scheduler = new Scheduler()

        this.box = new PixelBox({xMin:0,xMax:32,yMin:0,yMax:8})
        this.scheduler.__setDefaultFrameTime(60/1000000)
        this.animationManager = new AnimationManager(this.box, this.scheduler, this.controlGroup)
    }

    addDisplay( display : Display ) {
        this.displays.add(display)
        //primary/first display?
        if (this.displays.size===1) {
            this.box.xMin=display.xMin
            this.box.yMin=display.yMin
            this.box.yMax=display.yMax
            this.box.xMax=display.xMax
            this.scheduler.__setDefaultFrameTime(display.defaultFrameTimeMicros)
            this.start()
        }
    }

    removeDisplay(display : Display) {
        this.displays.delete(display)
        if (this.displays.size===0) {
            //"If a tree falls in a forest and no one is around to hear it, does it make a sound?"
            this.stop()
         }
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