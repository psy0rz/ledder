import {Matrix} from "../Matrix.js";
import {PixelContainer} from "../PixelContainer.js";
import {Fx} from "../Fx.js";

export default class FxRotateLeft extends Fx {

    static title = "Rotate pixels left in its bounding box"

    constructor(matrix: Matrix, pixelContainer: PixelContainer, controlPrefix: string) {
        super(matrix, pixelContainer, controlPrefix)

        const delayControl = matrix.preset.value(controlPrefix + ' delay', 1, 0.1, 10, 0.1)

        const padding = matrix.preset.value(controlPrefix + ' padding', 0, 0, matrix.width, 1)

        let left = 0
        let right = 0
        let bbox = pixelContainer.bbox()

        matrix.scheduler.intervalControlled(delayControl, (frameNr) => {
            for (const p of this.pixelContainer.pixels) {
                p.x = p.x - 1
                if (p.x < 0)
                    p.x = bbox.xMax + padding.value
            }
        })
    }

}
