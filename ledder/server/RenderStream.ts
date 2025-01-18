import {Render} from "./Render.js"
import {Writable} from "node:stream"

/** Non-realtime rendering , for use in tcp streaming for example.
 * This renders as fast as the display driver allows, letting the driver/client handle the fps rates.
 * This means buffers are hopefully filled and displaying will be smooth and stutterless.
 */
export class RenderStream extends Render {

    /*
    Renders and sends one frame.
    Caller should keep calling us as fast as possible, as long as the external writable is draining.
     */
    async render(fh: Writable, encodedFrame: number[]) {


        //render as fast as possible, filling writable buffers
        let frameTime = 0

        const _this = this

        async function fillFh() {

            console.log("FILLING1")
            do {

                //NOTE: await is needed, to allow  microtasks to run!
                frameTime = frameTime + await _this.scheduler.__step(false)

                frameTime = ~~(frameTime / _this.primaryDisplay.frameRoundingMicros) * _this.primaryDisplay.frameRoundingMicros

                encodedFrame.length = 0
                for (let display of _this.displays) {
                    display.render(_this.box)
                    display.frame(frameTime)
                }
            } while (fh.write(new Uint8Array(encodedFrame)))
            console.log("FULL")
        }

        fh.on('drain', async () => {
            console.log("CONTINUE")
            await fillFh()
        })

        fh.on('close', () => {
            console.log("CLOSED")
            this.animationManager.stop(false)
        })

        await fillFh()

    }

}