import {PixelContainer} from "./PixelContainer.js";
import {Matrix} from "./Matrix.js";
import {Scheduler} from "./Scheduler.js";
import {ControlGroup} from "./ControlGroup.js";

//an effect can be applied to pixelcontainers or colors  (via run() )
export class Fx {
    static title = "Untitled"

    promise: Promise<any>
    running: boolean
    matrix: Matrix
    controls: ControlGroup


    constructor(matrix: Matrix, controlGroup: ControlGroup) {
        this.matrix = matrix
        this.controls=controlGroup

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

