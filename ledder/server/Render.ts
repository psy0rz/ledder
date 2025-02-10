//render base class
//exposes the animationManager and controlGroup that may be accessed directly.
//can render to one or more display, the first one is the "main" display that determines the size of the box and fps
import AnimationManager from "./AnimationManager.js"
import ControlGroup from "../ControlGroup.js"
import Display from "../Display.js"
import PixelBox from "../PixelBox.js"
import Scheduler from "../Scheduler.js"


//A renderer can have multiple displays
//The first one is the primary display and determines box-size and framerate.
//Displays can be added/removed on the fly
//Adding/removing the first display will also start/stop the renderer.


export class Render {

    public readonly animationManager: AnimationManager
    public readonly controlGroup: ControlGroup
    public readonly description: string

    protected displays: Set<Display>
    protected primaryDisplay: Display

    public readonly box: PixelBox
    protected readonly scheduler: Scheduler


    protected statsLastTimestampMs:number
    protected statsIdleMs:number
    protected statsLateFrames: number
    protected statsDroppedFrames: number
    protected statsFrames: number
    protected statsBytes: number



    constructor( description='') {
        this.displays = new Set()

        this.description=description

        this.controlGroup = new ControlGroup('root')
        this.scheduler = new Scheduler()

        this.box = new PixelBox({xMin:0,xMax:31,yMin:0,yMax:7})
        this.scheduler.__setDefaultFrameTime(60/1000000)
        this.animationManager = new AnimationManager(this.box, this.scheduler, this.controlGroup)


        this.resetStats()


    }

    resetStats() {
        this.statsLateFrames = 0
        this.statsDroppedFrames = 0
        this.statsBytes = 0
        this.statsIdleMs = 0
        this.statsFrames=0
        this.statsLastTimestampMs=Date.now()

    }


    getPrimaryDisplay()
    {
        return this.primaryDisplay
    }


    async addDisplay( display : Display ) {
        this.displays.add(display)
        //primary/first display?
        if (this.displays.size===1) {
            this.primaryDisplay=display
            this.box.xMin=display.xMin
            this.box.yMin=display.yMin
            this.box.yMax=display.yMax
            this.box.xMax=display.xMax
            this.scheduler.__setDefaultFrameTime(display.defaultFrameTimeMicros)
            await this.start()
        }
    }

    async removeDisplay(display : Display) {
        this.displays.delete(display)
        if (this.displays.size===0) {
            //"If a tree falls in a forest and no one is around to hear it, does it make a sound?"
            await this.stop()
            this.primaryDisplay=undefined
         }
    }

    getStats() {

        const deltaS=(Date.now()-this.statsLastTimestampMs)/1000
        const fps=~~(this.statsFrames/deltaS)
        const kbps =~~(this.statsBytes/deltaS/1000)

        let busyPerc= ~~(100-(((this.statsIdleMs/1000)/deltaS )*100))
        if (busyPerc<0)
            busyPerc=0



        const statStr= (`${fps} fps (${this.statsLateFrames} late, ${this.statsDroppedFrames} dropped), ${kbps} KB/s, ${busyPerc}% busy`)
        this.resetStats()
        return statStr

    }


    async start()
    {

    }

    async stop(){

    }

}