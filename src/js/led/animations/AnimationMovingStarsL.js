import { Animation } from "../Animation.js";
import { PixelStar } from "./PixelStar.js";
import { random } from "../util.js";
import { AnimationMove } from "../AnimationMove.js";
export class AnimationMovingStarsL extends Animation {
    constructor(matrix) {
        super(matrix);
        const intervalControl = matrix.preset.value("Star move interval", 3, 1, 30, 0);
        const blinkDelayControl = matrix.preset.value("Star twinkle interval", 5.8, 1, 10, 0);
        const starDensityControl = matrix.preset.value("Star density", 10, 1, 100, 1);
        const starColorControl = matrix.preset.color("Star color", 128, 128, 128);
        matrix.scheduler.interval(20, () => {
            //add new flying star at right side
            const star = new PixelStar(matrix, matrix.width + 2, random(0, matrix.height), starColorControl, blinkDelayControl, true);
            const mover = new AnimationMove(matrix, intervalControl, { value: -1 }, { value: 0 });
            mover.addPixel(star);
            //destroy star at left side
            matrix.scheduler.interval((matrix.width + 2) * intervalControl.value, () => {
                mover.destroy(true);
                star.destroy(matrix);
                return false;
            });
            //schedule creation of next star at random time
            return (random(intervalControl.value, (100 * intervalControl.value) / starDensityControl.value));
            // return(1);
            //
        });
    }
}
AnimationMovingStarsL.category = "Basic";
AnimationMovingStarsL.title = "Moving stars left";
AnimationMovingStarsL.description = "Used in nyancat :)";
AnimationMovingStarsL.presetDir = "Moving stars";
//# sourceMappingURL=AnimationMovingStarsL.js.map