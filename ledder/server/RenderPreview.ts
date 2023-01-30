import {Render} from "./Render.js"

/** Renderer to create previews.
 * E.g.: skip the first frames, render only a fixed amount of frames, and can do frame skipping.
 * Normally only used with DisplayApng()
 */
export class RenderPreview extends Render {
    /*
     * Pre-render animation preview.
     * Display-class and caller are reponsible for saving the result somewhere.
     */
    async render(animationName:string, presetName:string) {
        this.animationManager.stop(false)
        await this.animationManager.loadAnimation(animationName)
        await this.animationManager.loadPreset(presetName)
        this.animationManager.run()

        //skip first frames, just run scheduler
        for (let i = 0; i < this.animationManager.animationClass.previewSkip; i++)
            //NOTE: await is needed, to allow other microtasks to run!
            await this.scheduler.step()

        //render frames
        let displayTime = 0
        let frameTime = 0
        for (let i = 0; i < this.animationManager.animationClass.previewFrames; i++) {

            for (let d = 0; d < this.animationManager.animationClass.previewDivider; d++) {
                //NOTE: await is needed, to allow  microtasks to run!
                frameTime = frameTime + await this.scheduler.step()
            }

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