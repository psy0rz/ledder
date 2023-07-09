import {Render} from "./Render.js"

/** Renderer to create statically pre-render stuff.
 * Normally used with DisplayQOISstream
 */
export class RenderStatic extends Render {
    /*
     * Pre-render animation preview to writable

     */
    async render( maxFrames: number) {
        // await this.animationManager.select(animationAndPresetPath, false)


        //render frames
        let displayTime = 0
        let frameTime = 0
        for (let i = 0; i < maxFrames; i++) {

            //NOTE: await is needed, to allow  microtasks to run!
            frameTime = frameTime + await this.scheduler.__step(false)

            frameTime = ~~(frameTime / this.display.frameRoundingMicros) * this.display.frameRoundingMicros

            //skip frames until frameTime is more than minimum allowed
            if (frameTime >= this.display.minFrameTimeMicros) {
                displayTime += frameTime
                frameTime = 0
                this.display.render(this.box)
                this.display.frame(displayTime)
            }
        }
        this.animationManager.stop(false)

    }

}