import Draw from "../Draw.js";
import {Pixel} from "../Pixel.js";
import {ColorInterface} from "../ColorInterface.js";

//draw a simple filled box. x,y are left bottom coordinates
export default class DrawBox extends Draw {
    constructor(x: number, y: number, width: number, height: number, color: ColorInterface) {
        super();

        for (let thisX = x; thisX < x + width; thisX++)
            for (let thisY = y; thisY < y + height; thisY++)
                this.add(new Pixel(thisX, thisY, color))
    }
}


