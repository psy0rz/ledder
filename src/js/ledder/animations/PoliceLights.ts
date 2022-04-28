import {Animation} from "../Animation.js";
import {Matrix} from "../Matrix.js";
import {Pixel} from "../Pixel.js";

export default class PoliceLights extends Animation {

    static title = "Police lights"
    static description = ""
    static presetDir = "policelights"
    static category = "Signal lights"

    constructor(matrix: Matrix) {
        super(matrix);


        const color1Control = matrix.preset.color("Color 1", 255, 0, 0, 1);

        for (let x=0;x<matrix.width/5; x++)
            for (let y=0;y<matrix.height; y++)
                new Pixel(matrix,x,y,color1Control)





    }


}
