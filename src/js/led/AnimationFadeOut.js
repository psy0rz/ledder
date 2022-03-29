import { Animation } from "./Animation.js";
import { randomFloat } from "./util.js";
export class AnimationFadeOut extends Animation {
    /**
     * Fade out by using the alpha channel. This makes pixels more and more transparant during fade.
     * Note that this directly manipulates the specified color-object. No need to add pixels for that purpose.
     * You can add them if you want to auto removePixels them (see removePixels)
     * @param matrix
     * @param color Color object to modify
     * @param frames Number of frames to fade out
     * @param randomizer Randomize frames count by this factor. (0-1)
     * @param removePixels Set true to removePixels pixels from matrix after fade is complete. (Add pixels to this object in that case)
     */
    constructor(matrix, color, frames, randomizer = undefined, removePixels = false) {
        super(matrix);
        if (randomizer != undefined)
            this.frameNr = frames.value * randomFloat(1 - randomizer.value, 1 + randomizer.value);
        else
            this.frameNr = frames.value;
        this.stepA = -(color.a / this.frameNr);
        this.promise = matrix.scheduler.interval(1, () => {
            this.frameNr--;
            //make sure last step is exact on colorTarget (rounding errors)
            if (this.frameNr <= 0) {
                color.a = 0;
                if (removePixels)
                    this.destroy(true);
                return false;
            }
            //since all the pixels use this color-object, we can manipulate it directly:
            color.a += this.stepA;
            if (!this.keep)
                return false;
        });
    }
}
//# sourceMappingURL=AnimationFadeOut.js.map