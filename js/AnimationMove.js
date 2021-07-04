//moves animations x and y coordiantes in a certain direction with a certain speed
import { Animation } from "./Animation.js";
export class AnimationMove extends Animation {
    constructor(matrix, delay, xStep, yStep) {
        super(matrix);
        matrix.scheduler.interval(delay, (frameNr) => {
            for (let i = 0, n = this.pixels.length; i < n; ++i) {
                const p = this.pixels[i];
                p.x = p.x + xStep;
                p.y = p.y + yStep;
            }
            return (this.keep);
        });
    }
}
//# sourceMappingURL=AnimationMove.js.map