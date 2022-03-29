import {ColorInterface} from "./ColorInterface.js";

export class Color implements ColorInterface {
    r: number
    g: number
    b: number
    a: number

    constructor(r: number, g: number, b: number, a: number=1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}
