import {Matrix} from "../Matrix.js";
import {Fx} from "../Fx.js";
import {ControlValue} from "../ControlValue.js";


export default class FxRotateLeft extends Fx {

    static title = "Rotate pixels left inside bounding box of the pixelcontainer"

    intervalControl: ControlValue

    constructor(matrix: Matrix, name:string="Rotate left", interval=1) {
        super(matrix, controlPrefix)

        this.intervalControl = matrix.control.value(controlPrefix + ' interval', interval, 1, 60, 1)
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
            return (this.running && pixelContainer.pixels.length)
        })

        return (this.promise)
    }
}

