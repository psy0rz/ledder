import { Animation } from "./Animation.js";
export class AnimationWobbleY extends Animation {
    constructor(matrix, amount, interval, offset = 0) {
        super(matrix);
        let inverter = 1;
        matrix.scheduler.intervalControlled(interval, () => {
            const step = amount.value * inverter;
            inverter = inverter * -1;
            for (let i = 0, n = this.pixels.length; i < n; ++i)
                this.pixels[i].y += step;
        }, offset);
    }
}
//# sourceMappingURL=AnimationWobbleY.js.map