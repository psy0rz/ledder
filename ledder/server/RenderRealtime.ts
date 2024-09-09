import {Render} from "./Render.js"

/**
 * Main realtime renderer. Will create an AnimationManager that manages an Animation, and renders it to specified Display
 * To be used with display drivers that control hardware.
 */
export class RenderRealtime extends Render {

    private nextTimeMicros: number
    private lastFrameMicros: number

    private keepRendering: boolean

    //statistics
    private lastStatUpdate:number;
    private lateFrames: number;
    private idleMS: number;
    //frames that are TOO early for the hardware's max update speed:
    private droppedFrames:number;



    start() {
        if (!this.keepRendering) {
            this.keepRendering = true
            this.nextTimeMicros = Date.now() * 1000
            this.lastFrameMicros = 0
            this.lastStatUpdate=Date.now()

            this.lateFrames=0
            this.idleMS =0
            this.droppedFrames=0;


            this.renderInterval()
        }
    }

    //the main step-render-send loop

    async renderInterval() {
        if (!this.keepRendering)
            return

        let nowUS=Date.now()*1000

        this.nextTimeMicros+=  await this.scheduler.__step(true)

        //max 10 frames difference
        if (Math.abs(this.nextTimeMicros-nowUS)>this.scheduler.__frameTimeMicros*10) {
            //reset
            this.nextTimeMicros = nowUS+this.scheduler.__frameTimeMicros;
        }

        if ( nowUS-this.lastFrameMicros >= this.display.minFrameTimeMicros) {
            try {
                this.display.render(this.box)
            } catch (e) {
                console.error("Exception while rendering:", e)
            }
            this.display.frame(this.nextTimeMicros)
            this.lastFrameMicros = nowUS
        }
        else
        {
            this.droppedFrames++;
        }

        if (nowUS-this.lastStatUpdate>1000000)
        {

            console.log(`RenderRealtime: ${this.lateFrames} late. ${this.droppedFrames} dropped. ${ Math.round( ( 1000-this.idleMS)/10) }% busy.`)
            this.lastStatUpdate=nowUS
            this.droppedFrames=0;
            this.lateFrames=0;
            this.idleMS=0
        }

        const intervalmS = (this.nextTimeMicros / 1000) - Date.now()
        this.idleMS=this.idleMS+intervalmS
        if (intervalmS<=0)
            this.lateFrames++
        // console.log(intervalmS)
        setTimeout(() => this.renderInterval(), intervalmS)

    }

    stop() {
        this.keepRendering = false
        this.animationManager.stop(false)
    }


}


