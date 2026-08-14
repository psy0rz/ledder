//render base class
//exposes the animationManager and controlGroup that may be accessed directly.
//can render to one or more display, the first one is the "main" display that determines the size of the box and fps
import AnimationManager from "./AnimationManager.js"
import ControlGroup from "../ControlGroup.js"
import Display from "../Display.js"
import PixelBox from "../PixelBox.js"
import Scheduler from "../Scheduler.js"
import RenderSettings from "../RenderSettings.js"
import {formatTimeAgo} from "../timeAgo.js"


//A renderer can have multiple displays
//The first one is the primary display and determines box-size and framerate.
//Displays can be added/removed on the fly
//Adding/removing the first display will also start/stop the renderer.


export class Render {

    public readonly animationManager: AnimationManager
    public readonly controlGroup: ControlGroup

    protected displays: Set<Display>
    protected primaryDisplay: Display

    public readonly box: PixelBox
    protected readonly scheduler: Scheduler

    //framerate and subpixel filtering, controlled by the user via the preset of the selected animation
    public readonly renderSettings: RenderSettings


    protected statsLastTimestampMs:number
    protected statsIdleMs:number
    protected statsLag: number
    protected statsFrames: number
    protected statsBytes: number

    //time we did not step the animation because the primary display was not ready for the next frame
    protected statsNotReadyMs: number



    constructor( ) {
        this.displays = new Set()


        this.controlGroup = new ControlGroup('root')
        this.renderSettings = new RenderSettings()
        this.scheduler = new Scheduler(this.renderSettings)

        this.box = new PixelBox({xMin:0,xMax:31,yMin:0,yMax:7})
        this.animationManager = new AnimationManager(this.box, this.scheduler, this.controlGroup, this.renderSettings, true)


        this.resetStats()


    }

    resetStats() {
        this.statsLag = 0
        this.statsBytes = 0
        this.statsIdleMs = 0
        this.statsFrames=0
        this.statsNotReadyMs = 0
        this.statsLastTimestampMs=Date.now()

    }


    getPrimaryDisplay()
    {
        return this.primaryDisplay
    }


    async addDisplay( display : Display ) {

        if (this.displays.has(display))
            return

        this.displays.add(display)
        //primary/first display?
        if (this.displays.size===1) {
            this.primaryDisplay=display
            this.box.xMin=display.xMin
            this.box.yMin=display.yMin
            this.box.yMax=display.yMax
            this.box.xMax=display.xMax
            this.renderSettings.__useDisplayLimits(display)
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

        //An offline display renders nothing at all, so fps, throughput and waiting time would all be
        //zero-ish numbers saying the same thing. Report why instead.
        if (this.primaryDisplay !== undefined && !this.primaryDisplay.isOnline()) {
            this.resetStats()

            if (this.primaryDisplay.lastSeenTimestampMs === undefined)
                return `OFFLINE (never seen)`

            return `OFFLINE (last seen ${formatTimeAgo(Date.now() - this.primaryDisplay.lastSeenTimestampMs)})`
        }

        const deltaS=(Date.now()-this.statsLastTimestampMs)/1000
        const fps=~~(this.statsFrames/deltaS)
        const kbps =~~(this.statsBytes/deltaS/1000)

        let busyPerc= ~~(100-(((this.statsIdleMs/1000)/deltaS )*100))
        if (busyPerc<0)
            busyPerc=0


        let waitingPerc = ~~(((this.statsNotReadyMs / 1000) / deltaS) * 100)
        if (waitingPerc > 100)
            waitingPerc = 100

        let statStr = (`${fps} fps, ${this.statsLag} mS lag, ${kbps} KB/s, ${busyPerc}% CPU`)

        //an online display that we keep having to wait for is what explains a dropped framerate
        if (waitingPerc > 0)
            statStr = statStr + `, ${waitingPerc}% waiting for display`

        this.resetStats()
        return statStr

    }


    resetTimers()
    {

    }

    async start()
    {

    }

    async stop(){

    }

}