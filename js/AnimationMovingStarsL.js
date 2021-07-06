import { Animation } from "./Animation.js";
import { PixelStar } from "./PixelStar.js";
import { random } from "./util.js";
import { AnimationMove } from "./AnimationMove.js";
export class AnimationMovingStarsL extends Animation {
    constructor(matrix, step = 1, delay = 2) {
        super(matrix);
        matrix.scheduler.interval(20, () => {
            //add new flying star at right side
            const star = new PixelStar(matrix, matrix.width + 2, random(0, matrix.height));
            const mover = new AnimationMove(matrix, delay, -step, 0);
            mover.addPixel(star);
            //destroy star at left side
            matrix.scheduler.interval(delay * matrix.width / step + 10, () => {
                mover.destroy(true);
                return false;
            });
            //schedule creation of next star at random time
            return (random(10, 30));
        });
    }
}
//# sourceMappingURL=AnimationMovingStarsL.js.map