import {Color} from "./Color.js";

////////////////// calculate converion table for fire-intensity (0-100) to Color()
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



//////////////////// bertrix fire colors
function calculateFireColorsBertrik() {
    let i;
    let k = 0;
    let r = 0, g = 0, b = 0;
    let colors=[]

    // black to red
    for (i = 0; i < 255; i++) {
        colors[k++]=new Color( r,g,b);
        r++;
    }

    // red to yellow
    for (i = 0; i < 255; i++) {
        colors[k++]=new Color( r,g,b);
        g++;
    }

    // yellow to white
    for (i = 0; i < 255; i++) {
        colors[k++]=new Color( r,g,b);
        b++;
    }
    // // just white
    // for (i = 0; i < 30; i++) {
    //     colors[k++]=new Color( r,g,b);
    // }
    return colors
}
export const fireColorsBertrik=calculateFireColorsBertrik()
