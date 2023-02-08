
//index of cached color objects. use this if you dont want duplicate color objects for the same color.
import Color from "./Color.js"

export default class ColorCache {
    private colors: Color[]

    constructor() {
        this.colors = []
    }


    get(r, g, b, a) {
        const index = (r << 24) + (g << 16) + (b << 8) + ~~(a * 255)
        if (this.colors[index] === undefined)
            this.colors[index] = new Color(r, g, b, a)
        return this.colors[index]

    }

    getObject(c: Color) {

        const index = c.r << 24 + c.g << 16 + c.b << 8 + ~~(c.a * 255)
        if (this.colors[index] === undefined)
            this.colors[index] = c

        return this.colors[index]

    }

}