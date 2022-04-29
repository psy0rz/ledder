import {Matrix} from "../Matrix.js";
import {PixelContainer} from "../PixelContainer.js";
import {Fx} from "../Fx.js";

// export default class FxBlink extends Fx {
//
//     static title = "Blink pixels"
//
//     constructor(matrix: Matrix, pixelContainer: PixelContainer, controlPrefix: string) {
//         super(matrix, pixelContainer, controlPrefix)
//
//         const delayControl = matrix.preset.value(controlPrefix + ' delay', 1, 0.1, 10, 0.1)
//
//         let bbox = pixelContainer.bbox()
//         let step=-1
//
//         matrix.scheduler.intervalControlled(delayControl, (frameNr) => {
//
//             for (const p of this.pixelContainer.pixels) {
//                 p.x = p.x + step
//                 if (p.x < bbox.xMin)
//                     p.x = bbox.xMax
//             }
//
//         })
//     }
//
// }


export default class FxRotateLeft extends Fx {

    static title = "Rotate pixels left inside bounding box of the pixelcontainer"

    constructor(matrix: Matrix, pixelContainer: PixelContainer, controlPrefix: string) {
        super(matrix, pixelContainer, controlPrefix)

        const delayControl = matrix.preset.value(controlPrefix + ' delay', 1, 0.1, 10, 0.1)

        let bbox = pixelContainer.bbox()
        let step=-1

        matrix.scheduler.intervalControlled(delayControl, (frameNr) => {

            for (const p of this.pixelContainer.pixels) {
                p.x = p.x + step
                if (p.x < bbox.xMin)
                    p.x = bbox.xMax
            }

        })
    }

}
