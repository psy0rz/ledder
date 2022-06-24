import {Matrix} from "./Matrix.js";
import {PixelContainer} from "./PixelContainer.js";
import {Scheduler} from "./Scheduler.js";
import {ControlGroup} from "./ControlGroup.js";


/**
 * An animation is a pixelcontainer and animates the properties of those pixels via the scheduler.
 */
export class Animation  {

    // keep: boolean;
    static category = "Misc"
    static title = "Untitled"
    static description = ""
    static presetDir = "Unspecified"

    //preview settings, fiddle with this to optimize your preview image (usually no need to change)
    static previewSkip = 120 //number of input-frames to skip
    static previewDivider = 1 //divide input FPS by this
    static previewFrames = 240 //preview image should output this many frames


    constructor() {
        // this.keep = true;
    }

    //will be overridden in animation subclass
    async run(matrix: Matrix, scheduler: Scheduler, controls: ControlGroup)
    {
        console.error("Error: This animation has no run() function?")

    }

    //unschedules animation, removes pixels.
    //Also removes pixels from matrix if fromMatrix=true.
    // destroy(fromMatrix = true) {
    //     if (fromMatrix) {
    //         for (let i = 0, n = this.pixels.length; i < n; ++i) {
    //             this.matrix.removePixels(this.pixels);
    //         }
    //     }
    //     this.pixels = [];
    //     this.keep = false;
    // }


}

