import {Animation} from "./Animation.js";

export class AnimationWobbleY extends Animation {

    constructor(matrix, amount, interval, offset = 0) {
        super(matrix);

        matrix.scheduler.interval(interval, () => {
                for (let i = 0, n = this.pixels.length; i < n; ++i)
                    this.pixels[i].y += amount;

                amount = -amount

            }, offset
        )

    }
}
