import {PixelContainer} from "./PixelContainer.js";
import {Matrix} from "./Matrix.js";
import {Scheduler} from "./Scheduler.js";
import {PresetControl} from "./PresetControl.js";

//an effect can be applied to pixelcontainers or colors usually (via run() )
export class Fx {
    static title = "Untitled"

    controlPrefix: string
    matrix: Matrix
    promise: Promise<any>
    running: boolean

    constructor(matrix: Matrix, name:string) {

        this.matrix = matrix
        this.running=true
    }

    //run fx on pixels
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

