import {Matrix} from "./Matrix.js";
import {ControlGroup} from "./ControlGroup.js";

//an effect can be applied to pixelcontainers or colors  (via run() )
export default class Fx {
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
    run(...any):Promise<any>
    {
        console.error("Error: This fx has no run() function?")
        return (new Promise( undefined))

    }

    //stops the effect
    async stop()
    {
        this.running=false
        return (this.promise)
    }


}

