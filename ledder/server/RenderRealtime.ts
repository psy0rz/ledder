import {Render} from "./Render.js"

/**
 * Main realtime renderer. Will create an AnimationManager that manages an Animation, and renders it to specified Display
 * To be used with display drivers that control hardware.
 *
 * Note that the time passed to frame() is "synthetic": its aways increased by the frame-time, regardless of the actual local time.
 * This helpts smooth playback on wifi devices with buffering.
 */

//too small and low-bandwith animations will not have enough data. too big and high-bandwidth animations will stutter on the preview side (tcp backpressure)
    // NOTE: 0 seems to be ok for now, since there is already enough buffering once the esp starts decoding it seems. (around 500mS lag)
const BUFFER_MS=0

export class RenderRealtime extends Render {

    private displayNextTimeMicros: number
    private localNextTimeMicros: number


    private timer: NodeJS.Timeout


    async start() {
        if (this.timer === undefined) {

            this.resetStats()
            this.resetTimers()

            this.animationManager.run()
            await this.renderInterval()
            console.log(`RenderRealtime ${this.getPrimaryDisplay().descriptionControl.text} started.`)
        }
    }


    resetTimers()
    {
        this.displayNextTimeMicros = 0;
        this.localNextTimeMicros=Date.now() * 1000 - (BUFFER_MS*1000)
    }

    //the main step-render-send loop
    async renderInterval() {

        let intervalmS=0;

        if (this.primaryDisplay.ready) {
            let nowUS = Date.now() * 1000
            this.statsFrames++

            //do THE step that runs all the animations
            let step=await this.scheduler.__step(true)
            this.displayNextTimeMicros += step
            this.localNextTimeMicros+=step

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

            //set next time. while the buffer-ahead cushion isnt full yet this is negative,
            //so we keep rendering as fast as possible until its full (or backpressure pauses us)
            intervalmS = ((this.localNextTimeMicros ) / 1000) - Date.now()

        } else {
            //display not ready, wait 1 interval (it will catch up again when its ready since we use synthetic time)
            intervalmS=this.scheduler.__frameTimeMicros/1000
        }
        if (intervalmS<0) {
            this.statsLag=-~~intervalmS
            intervalmS = 0
        }
        this.statsIdleMs = this.statsIdleMs + intervalmS
        this.timer = setTimeout(() => this.renderInterval(), intervalmS)


    }

    async stop() {
        if (this.timer !== undefined) {
            clearInterval(this.timer)
            this.timer = undefined
            this.animationManager.stop(true)
            console.log(`RenderRealtime ${this.getPrimaryDisplay().descriptionControl.text} stopped.`)
        }
    }


}


