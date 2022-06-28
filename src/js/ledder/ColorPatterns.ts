import {Color} from "./Color.js";

//calculate converion table for fire-intensity (0-100) to Color()
function calculateFireColors() {

    const colors = []
    for (let i = 0; i <= 100; i++) {
        const colorH = (i * 40 / 100) / 360
        const colorS = 1;
        const colorL = i / 100;
        const c = new Color()
        c.setHsl(colorH, colorS, colorL)
        Object.freeze(c)
        //c.a=i/100
        colors.push(c)
    }
    return (colors)
}

export const fireColors=calculateFireColors()
