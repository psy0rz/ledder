//moves animations x and y coordiantes in a certain direction with a certain speed
import { Animation } from "./Animation.js";
export class AnimationMove extends Animation {
    /**
     * Move pixels in specified direction
     * @param matrix
     * @param delay Delay between each step
     * @param xStep Step size of X (can be negative as well)
     * @param yStep Step size of Y (can be negative as well)
     * @param wrap Wrap pixels around if they go outside of the matrix
     */
    constructor(matrix, delay, xStep, yStep, wrap = false) {
        super(matrix);
        matrix.scheduler.intervalControlled(delay, (frameNr) => {
            for (let i = 0, n = this.pixels.length; i < n; ++i) {
                const p = this.pixels[i];
                p.x = p.x + xStep.value;
                p.y = p.y + yStep.value;
                if (wrap) {
                    if (p.x >= matrix.width)
                        p.x -= matrix.width;
                    else if (p.x < 0)
                        p.x += matrix.width;
                    if (p.y >= matrix.height)
                        p.y -= matrix.height;
                    else if (p.y < 0)
                        p.y += matrix.height;
                }
            }
            return (this.keep);
        });
    }
}
//# sourceMappingURL=AnimationMove.js.map