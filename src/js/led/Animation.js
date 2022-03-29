import { PixelContainer } from "./PixelContainer.js";
/**
 * An animation is a pixelcontainer and animates the properties of those pixels via the scheduler.
 */
export class Animation extends PixelContainer {
    constructor(matrix) {
        super();
        this.matrix = matrix;
        this.keep = true;
    }
    //unschedules animation, removes pixels.
    //Also removes pixels from matrix if fromMatrix=true.
    destroy(fromMatrix = true) {
        if (fromMatrix) {
            for (let i = 0, n = this.pixels.length; i < n; ++i) {
                this.matrix.removePixels(this.pixels);
            }
        }
        this.pixels = [];
        this.keep = false;
    }
}
Animation.category = "Misc";
Animation.title = "Untitled";
Animation.description = "";
Animation.presetDir = "Unspecified";
//preview settings, fiddle with this to optimize your preview image (usually no need to change)
Animation.previewSkip = 120; //number of input-frames to skip
Animation.previewDivider = 1; //divide input FPS by this
Animation.previewFrames = 240; //preview image should output this many frames
//# sourceMappingURL=Animation.js.map