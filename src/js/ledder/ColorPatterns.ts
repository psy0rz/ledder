import {Color} from "./Color.js";
import {Pixel} from "./Pixel.js";
import {Display} from "./Display.js";
import {ControlGroup} from "./ControlGroup.js";
import {Font} from "./Font.js";
import {fonts} from "./fonts.js";

//all color patterns are just an array of Color() objects of arbitrairy length.

////////////////// doom fire colors
// from https://github.com/filipedeschamps/doom-fire-algorithm/blob/master/playground/render-with-canvas-and-hsl-colors/fire.js
function calculateFireColorsDoom() {

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

export const fireColorsDoom=calculateFireColorsDoom()



//////////////////// bertrik fire colors
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


///////////////////////////brainsmoke fire colors
//brainsmoke color pattern
function calculateFireColorsBrainsmoke() {

    let ret = []
    for (let x = 0; x < 256; x++) {

        const c=x/256

        let [r, g, b] = [c ** 1 * 3, c ** 1.5 * 4., c ** 2]

        if (r > 1.)
            r = 1.
        if (g > 1.)
            g = 1.
        if (b > 1.)
            b = 1.

        if (r == 1 && g == 1 && b == 1)
            [r, g, b] = [1, 1, 1]

        ret.push(new Color(~~(r * 255), ~~(g * 255), ~~(b * 255)))
    }
    return(ret)
}
export const fireColorsBrainsmoke=calculateFireColorsBrainsmoke()

//just to see the difference and orientation
export function testFirecolors(matrix:Display)
{
    for (let x = 0; x < matrix.width; x++) {
        matrix.add(new Pixel(x, 3, fireColorsBertrik[~~(x / matrix.width * fireColorsBertrik.length)]))
        matrix.add(new Pixel(x, 2, fireColorsDoom[~~(x / matrix.width * fireColorsDoom.length)]))
        matrix.add(new Pixel(x, 1, fireColorsBrainsmoke[~~(x / matrix.width * fireColorsBrainsmoke.length)]))
    }
}


const patterns={
    'Doom fire': fireColorsDoom,
    'Bertrik fire': fireColorsBertrik,
    'Brainsmoke fire': fireColorsBrainsmoke
}

//helper to make it easier to let the user select a color pattern
export function patternSelect(control:ControlGroup, name='Color pattern', selected='Bertrik fire' ):Array<Color>
{
    let choices = []
    for (const [id, color] of Object.entries(patterns)) {
        choices.push({id: id, name: id})
    }

    const patternControl = control.select(name, selected, choices, true)
    const pattern = patterns[patternControl.selected]
    return (pattern)
}
