import {Control} from "./Control.js";
import {ColorInterface} from "./ColorInterface.js";

export class ControlColor extends Control implements ColorInterface {
    r: number;
    g: number;
    b: number;
    a: number;

    constructor(name: string, r: number, g: number, b: number, a: number=1) {
        super( name);
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}
