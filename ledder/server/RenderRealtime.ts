import {Render} from "./Render.js"

/**
 * Main realtime renderer. Will create an AnimationManager that manages an Animation, and renders it to specified Display
 * To be used with display drivers that control hardware.
 */
export class RenderRealtime extends Render {

    private nextTimeMicros: number



    private timer: NodeJS.Timeout


    async start() {
        if (this.timer===undefined) {
            this.nextTimeMicros = Date.now() * 1000
            this.resetStats()


            this.animationManager.run()
            await this.renderInterval()
            console.log(`RenderRealtime ${this.description} started.`)
        }
    }

    //the main step-render-send loop

     async renderInterval() {

        this.statsFrames++

        let nowUS = Date.now() * 1000

        this.nextTimeMicros += await this.scheduler.__step(true)



        //too slow, or other clock problem
        if (Math.abs(this.nextTimeMicros - nowUS) > this.scheduler.__frameTimeMicros * 2) {
            //reset
            this.nextTimeMicros = nowUS + this.scheduler.__frameTimeMicros
            this.statsDroppedFrames++
        }

        for (const display of this.displays) {
            try {

                display.render(this.box)
            } catch (e) {
                console.error("Exception while rendering:", e)
            }

            if (display===this.primaryDisplay)
                this.statsBytes=this.statsBytes+display.frame(this.nextTimeMicros)
            else
                display.frame(this.nextTimeMicros)
        }

        const intervalmS = (this.nextTimeMicros / 1000) - Date.now()
        this.statsIdleMs = this.statsIdleMs + intervalmS
        if (intervalmS <= 0)
            this.statsLateFrames++

        this.timer=setTimeout(() => this.renderInterval(), intervalmS)

    }

    async stop() {
        if (this.timer!==undefined) {
            clearTimeout(this.timer)
            this.timer=undefined
            this.animationManager.stop(true)
            console.log(`RenderRealtime ${this.description} stopped.`)
        }
    }



}


