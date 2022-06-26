import {Matrix} from "./Matrix.js";
import {PixelContainer} from "./PixelContainer.js";
import {Scheduler} from "./Scheduler.js";
import {ControlGroup} from "./ControlGroup.js";


/**
 * An animation is a pixelcontainer and animates the properties of those pixels via the scheduler.
 */
export class Animation {

    // keep: boolean;
    static category = "Misc"
    static title = "Untitled"
    static description = ""
    static presetDir = "Unspecified"

    //preview settings, fiddle with this to optimize your preview image (usually no need to change)
    static previewSkip = 120 //number of input-frames to skip
    static previewDivider = 1 //divide input FPS by this
    static previewFrames = 240 //preview image should output this many frames


    //will be overridden in animation subclass
    async run(matrix: Matrix, scheduler: Scheduler, controls: ControlGroup) {
        console.error("Error: This animation has no run() function?")

    }
}

