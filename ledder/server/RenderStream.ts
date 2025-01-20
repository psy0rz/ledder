import {Render} from "./Render.js"

/** Non-realtime rendering , for use in tcp streaming for example.
 * This renders as fast as the display driver allows, letting the driver/client handle the fps rates.
 * This means buffers are hopefully filled and displaying will be smooth and stutterless.
 */
export class RenderStream extends Render {


    frameTime:number

    constructor(description) {
        super(description);

        this.frameTime=0
    }


    //render one frame.
    async render() {

        //NOTE: await is needed, to allow  microtasks to run!
        this.frameTime = this.frameTime + await this.scheduler.__step(false)
        this.frameTime = ~~(this.frameTime / this.primaryDisplay.frameRoundingMicros) * this.primaryDisplay.frameRoundingMicros


        for (let display of this.displays) {
            display.render(this.box)
            const statBytes=display.frame(this.frameTime)
            if (display===this.primaryDisplay)
                this.statsBytes=this.statsBytes+statBytes
        }

        this.statsFrames=this.statsFrames+1
    }


}