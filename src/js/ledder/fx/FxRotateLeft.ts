import {Matrix} from "../Matrix.js";
import {PixelContainer} from "../PixelContainer.js";
import {Fx} from "../Fx.js";
import {xml} from "svelte/types/compiler/utils/namespaces.js";

export default class FxRotateLeft extends Fx {

    static title = "Rotate pixels left inside bounding box of the pixelcontainer"

    constructor(matrix: Matrix, pixelContainer: PixelContainer, controlPrefix: string) {
        super(matrix, pixelContainer, controlPrefix)

        const delayControl = matrix.preset.value(controlPrefix + ' delay', 1, 0.1, 10, 0.1)


        // let left = 0
        // let right = 0
        let bbox = pixelContainer.bbox()

        // let startOffset=bbox.xMin
        // let padding=paddingControl.value


        let step=-1
        // let wrapOffset=bbox.xMax-bbox.xMin

        matrix.scheduler.intervalControlled(delayControl, (frameNr) => {


            // //reset rotation when padding changes
            // if (padding!=paddingControl.value) {
            //     step = bbox.xMin - startOffset
            //     console.log(step)
            // }
            // else
            //     step=-1

            // startOffset=startOffset+step
            // if (startOffset < bbox.xMin)
            //     startOffset = bbox.xMax

            for (const p of this.pixelContainer.pixels) {
                p.x = p.x + step
                if (p.x < bbox.xMin)
                    p.x = bbox.xMax
            }

            // padding=paddingControl.value
        })
    }

}
