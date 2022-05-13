import {PixelContainer} from "./PixelContainer.js";
import {Matrix} from "./Matrix.js";
import {Scheduler} from "./Scheduler.js";
import {PresetControl} from "./PresetControl.js";

//an effect can be applied to pixelcontainers or colors usually (via run() )
export class Fx {
    static title = "Untitled"

    promise: Promise<any>
    running: boolean
    matrix: Matrix
    controls: PresetControl


    constructor(matrix: Matrix, controls: PresetControl) {
        this.matrix = matrix
        this.controls=controls

        this.running=true
    }

    //run fx on pixels. Should return a promise and NOT be async.
    run(...any)
    {
        console.error("Error: This fx has no run() function?")

    }

    //stops the effect
    async stop()
    {
        this.running=false
        return (this.promise)
    }


}

