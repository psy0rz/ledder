import Scheduler from "./Scheduler.js"
import ControlGroup from "./ControlGroup.js"
import PixelBox from "./PixelBox.js"
import Pixel from "./Pixel.js"
import Color from "./Color.js"



/**
 * An animation is a pixelcontainer and animates the properties of those pixels via the scheduler.
 */
export default class Animator {

    // keep: boolean;
    static category = "Misc"
    static title = "Untitled"
    static description = ""

    //preview settings, fiddle with this to optimize your preview image (usually no need to change)
    static previewSkip = 120 //number of input-frames to skip
    static previewDivider = 1 //divide input FPS by this
    static previewFrames = 240 //preview image should output this many frames


    //will be overridden in animation subclass
    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup):Promise<any> {
        console.error("Error: This animation has no run() function?")

    }

    /**
     * Override this to receive realtime events from GUI clients while the animation runs (drawing input,
     * game controls, ...). Clients send these fire-and-forget via the "animationEvent" RPC notification;
     * events are only delivered while this instance is the currently running animation.
     * Receives the same box/scheduler/controls that were passed to run().
     *
     * Default events, available in every animation (call super.animationEvent() when overriding to keep them):
     *  "addPixel" {x, y, r, g, b, a}
     */
    animationEvent(name: string, data: any, box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        switch (name) {
            case "addPixel":
                box.add(new Pixel(data.x, data.y, new Color(data.r, data.g, data.b, data.a)))
                break
        }

    }

}

