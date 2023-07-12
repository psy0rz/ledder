import {Render} from "./Render.js"

/**
 * Main realtime renderer. Will create an AnimationManager that manages an Animation, and renders it to specified Display
 * To be used with display drivers that control hardware.
 */
export class RenderRealtime extends Render {

    private nextTimeMicros: number
    private lastFrameMicros: number

    private keepRendering: boolean


    start() {
        if (!this.keepRendering) {
            this.keepRendering = true
            this.nextTimeMicros = Date.now() * 1000
            this.lastFrameMicros = 0
            this.renderInterval()
        }
    }

    //the main step-render-send loop

    async renderInterval() {
        if (!this.keepRendering)
            return

        this.nextTimeMicros += await this.scheduler.__step(true)
        if (this.nextTimeMicros - this.lastFrameMicros >= this.display.minFrameTimeMicros) {
            try {
                this.display.render(this.box)
            } catch (e) {
                console.error("Exception while rendering:", e)
            }
            this.display.frame(this.nextTimeMicros)
            this.lastFrameMicros = this.nextTimeMicros
        }

        const intervalmS = (this.nextTimeMicros / 1000) - Date.now()
        setTimeout(() => this.renderInterval(), intervalmS)

    }

    stop() {
        this.keepRendering = false
        this.animationManager.stop(false)
    }


}


