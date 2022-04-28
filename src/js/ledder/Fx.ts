import {PixelContainer} from "./PixelContainer.js";
import {Matrix} from "./Matrix.js";

//an effect can be applied to a pixelcontainer
export class Fx {
    static title = "Untitled"

    pixelContainer: PixelContainer
    controlPrefix: string
    matrix: Matrix

    constructor(matrix: Matrix, pixelContainer: PixelContainer, controlPrefix: string) {
        this.pixelContainer = pixelContainer
        this.controlPrefix = controlPrefix
        this.matrix = matrix
    }
}

