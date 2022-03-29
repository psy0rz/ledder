import { Animation } from "./Animation.js";
import { randomFloat } from "./util.js";
export class AnimationFade extends Animation {
    /**
     * A plain linear fade that fades color to colorTarget within specified number of frames
     * Note that this directly manipulates the specified color-object. No need to add pixels for that purpose.
     * You can add them if you want to auto removePixels them (see removePixels)
     * @param matrix
     * @param color Color object to modify
     * @param colorTarget Target color to fade to
     * @param frames Number of frames to get to target
     * @param randomizer Randomize frames count by this factor. (0-1)
     * @param removePixels Set true to removePixels pixels from matrix after fade is complete. (Add pixels to this object in that case)
     */
    constructor(matrix, color, colorTarget, frames, randomizer = undefined, removePixels = false) {
        super(matrix);
        if (color.busy)
            return;
        color.busy = true;
        if (randomizer != undefined)
            this.frameNr = frames.value * randomFloat(1 - randomizer.value, 1 + randomizer.value);
        else
            this.frameNr = frames.value;
        this.stepR = (colorTarget.r - color.r) / this.frameNr;
        this.stepG = (colorTarget.g - color.g) / this.frameNr;
        this.stepB = (colorTarget.b - color.b) / this.frameNr;
        this.promise = matrix.scheduler.interval(1, () => {
            this.frameNr--;
            //make sure last step is exact on colorTarget (rounding errors)
            if (this.frameNr <= 0) {
                Object.assign(color, colorTarget);
                if (removePixels)
                    this.destroy(true);
                color.busy = false;
                return false;
            }
            //since all the pixels use this color-object, we can manipulate it directly:
            color.r += this.stepR;
            color.g += this.stepG;
            color.b += this.stepB;
            if (!this.keep)
                return false;
        });
    }
}
//# sourceMappingURL=AnimationFade.js.map