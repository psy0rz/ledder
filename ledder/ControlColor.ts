//NOTE: controls are used by browser side as well, so dont import server-only stuff!
import {Control} from "./Control.js"
import type ColorInterface from "./ColorInterface.js"
import Color from "./Color.js"


export default class ControlColor extends Control implements ColorInterface {
    r: number
    g: number
    b: number
    a: number


    constructor(name: string, r: number = 128, g: number = 128, b: number = 128, a: number = 1, resetOnchange: boolean) {
        super(name, 'color', resetOnchange)
        this.r = r
        this.g = g
        this.b = b
        this.a = a
    }


    save() {
        return {
            r: this.r,
            g: this.g,
            b: this.b,
            a: this.a
        }
    }

    load(values) {
        this.r = values.r
        this.g = values.g
        this.b = values.b
        this.a = values.a
    }

    //returns a copy thats an actual Color() object
    copy(): ColorInterface {

        return (new Color(this.r, this.g, this.b, this.a))
    }

    equal(color: ColorInterface) {
        return this.r == color.r && this.g == color.g && this.b == color.b && this.a == color.a
    }

}
