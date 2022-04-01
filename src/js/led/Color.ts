import {ColorInterface} from "./ColorInterface.js";
import convert from "color-convert"

export class Color implements ColorInterface {
    r: number
    g: number
    b: number
    a: number

    constructor(r: number=255, g: number=255, b: number=255, a: number=1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    //TODO: optimize

    //h: 0-360
    //s: 0-100
    //l: 0-100
    setHsl(h,s,l)
    {
        const rgb = convert.hsl.rgb([h,s,l])
        this.r=rgb[0]
        this.g=rgb[1]
        this.b=rgb[2]

    }
}
