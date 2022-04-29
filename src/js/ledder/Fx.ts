import {PixelContainer} from "./PixelContainer.js";
import {Matrix} from "./Matrix.js";
import {Scheduler} from "./Scheduler.js";
import {PresetControl} from "./PresetControl.js";

//an effect can be applied to a pixelcontainer
export class Fx {
    static title = "Untitled"

    controlPrefix: string
    matrix: Matrix
    promise: Promise<any>
    running: boolean

    constructor(matrix: Matrix, controlPrefix: string) {
        this.controlPrefix = controlPrefix
        this.matrix = matrix
        this.running=true
    }

    //run the fx, while this.running is true
    //NOTE: This should not be a async function because then it will wrap our promises and exceptions arent catched when aborting intervals
    run(pixelContainer: PixelContainer, ...any)
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

