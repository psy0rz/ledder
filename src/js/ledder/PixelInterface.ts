import {ColorInterface} from "./ColorInterface.js";
import {Matrix} from "./Matrix.js";

export interface PixelInterface {
    x: number;
    y: number;
    color: ColorInterface;

    destroy(matrix);

    // render(matrix: Matrix);

}
