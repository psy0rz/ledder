import {Matrix} from "../Matrix.js";
import {PixelContainer} from "../PixelContainer.js";
import {Fx} from "../Fx.js";
import {ControlValue} from "../ControlValue.js";

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

    intervalControl: ControlValue

    constructor(matrix: Matrix, controlPrefix: string, delay=1) {
        super(matrix, controlPrefix,)

        this.intervalControl = matrix.preset.value(controlPrefix + ' interval', 1, 1, 60, 1)
    }

    run(pixelContainer)
    {
        let bbox = pixelContainer.bbox()
        let step=-1
        this.running=true
        this.promise=this.matrix.scheduler.intervalControlled(this.intervalControl, (frameNr) => {
            for (const p of pixelContainer.pixels) {
                p.x = p.x + step
                if (p.x < bbox.xMin)
                    p.x = bbox.xMax
            }
            return (this.running)
        })

        return (this.promise)
    }
}
