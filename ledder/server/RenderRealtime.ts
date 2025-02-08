import {Render} from "./Render.js"

/**
 * Main realtime renderer. Will create an AnimationManager that manages an Animation, and renders it to specified Display
 * To be used with display drivers that control hardware.
 *
 * Note that the time passed to frame() is "synthetic": its aways increased by the frame-time, regardless of the actual local time.
 * This helpts smooth playback on wifi devices with buffering.
 */
export class RenderRealtime extends Render {

    private displayNextTimeMicros: number
    private localNextTimeMicros: number


    private timer: NodeJS.Timeout


    async start() {
        if (this.timer === undefined) {
            this.displayNextTimeMicros = 0;
            this.localNextTimeMicros=Date.now() * 1000

            this.resetStats()


            this.animationManager.run()
            await this.renderInterval()
            console.log(`RenderRealtime ${this.description} started.`)
        }
    }

    //the main step-render-send loop
    async renderInterval() {

        //If a display is not ready, we dont do an anmation step and render/send
        //So in that case we pause the animation, but drop a frame in timing.
        //This is usefull for streaming displays that can get full buffers (DisplayQoisHTTP)

        if (this.primaryDisplay.ready) {
            let nowUS = Date.now() * 1000
            this.statsFrames++

            //do THE step that runs all the animations
            let step=await this.scheduler.__step(true)
            this.displayNextTimeMicros += step
            this.localNextTimeMicros+=step

            //too slow, or other clock problem
            if (Math.abs(this.localNextTimeMicros - nowUS) > this.scheduler.__frameTimeMicros * 2) {
                //reset
                this.localNextTimeMicros = nowUS + this.scheduler.__frameTimeMicros
            }

            //render to all displays
            for (const display of this.displays) {
                if (display.ready) {
                    try {

                        display.render(this.box)
                    } catch (e) {
                        console.error("Exception while rendering:", e)
                    }

                    if (display === this.primaryDisplay)
                        this.statsBytes = this.statsBytes + display.frame(this.displayNextTimeMicros)
                    else
                        display.frame(this.displayNextTimeMicros)
                }


            }

            //set next time
            const intervalmS = (this.localNextTimeMicros / 1000) - Date.now()
            this.statsIdleMs = this.statsIdleMs + intervalmS
            if (intervalmS <= 0)
                this.statsLateFrames++

            this.timer = setTimeout(() => this.renderInterval(), intervalmS)
        } else {
            //droppped frame, just set timeout to try again
            this.statsDroppedFrames++
            this.timer = setTimeout(() => this.renderInterval(), this.scheduler.__frameTimeMicros/1000)
        }


    }

    async stop() {
        if (this.timer !== undefined) {
            clearInterval(this.timer)
            this.timer = undefined
            this.animationManager.stop(true)
            console.log(`RenderRealtime ${this.description} stopped.`)
        }
    }


}


