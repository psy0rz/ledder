import Color from "./Color.js"
import Pixel from "./Pixel.js"
import Display from "./Display.js"
import ControlGroup from "./ControlGroup.js"

//all color patterns are just an array of Color() objects of arbitrairy length.

////////////////// doom fire colors
// from https://github.com/filipedeschamps/doom-fire-algorithm/blob/master/playground/render-with-canvas-and-hsl-colors/fire.js
function calculateFireColorsDoom() {

    const colors = []
    for (let i = 0; i <= 100; i++) {
        const colorH = (i * 40 / 100) / 360
        const colorS = 1
        const colorL = i / 100
        const c = new Color()
        c.setHsl(colorH, colorS, colorL)
        c.freeze()
        //c.a=i/100
        colors.push(c)
    }

    //make sure 0 is transparent
    const c = new Color(0, 0, 0, 0, true)
    colors[0] = c


    return (colors)
}

export const fireColorsDoom = calculateFireColorsDoom()


//////////////////// bertrik fire colors
function calculateFireColorsBertrik() {
    let i
    let k = 0
    let r = 0, g = 0, b = 0
    let colors = []

    // black to red
    for (i = 0; i < 255; i++) {
        colors[k++] = new Color(r, g, b, 1, true)
        r++
    }

    // red to yellow
    for (i = 0; i < 255; i++) {
        colors[k++] = new Color(r, g, b, 1, true)
        g++
    }

    // yellow to white
    for (i = 0; i < 255; i++) {
        colors[k++] = new Color(r, g, b, 1, true)
        b++
    }
    // // just white
    // for (i = 0; i < 30; i++) {
    //     colors[k++]=new Color( r,g,b);
    // }

    //make sure 0 is transparent
    const c = new Color(0, 0, 0, 0, true)
    colors[0] = c


    return colors
}

export const fireColorsBertrik = calculateFireColorsBertrik()


///////////////////////////brainsmoke fire colors
//brainsmoke color pattern
function calculateFireColorsBrainsmoke() {

    let colors = []
    for (let x = 0; x < 256; x++) {

        const c = x / 256

        let [r, g, b] = [c ** 1 * 3, c ** 1.5 * 4., c ** 2]

        if (r > 1.)
            r = 1.
        if (g > 1.)
            g = 1.
        if (b > 1.)
            b = 1.

        if (r == 1 && g == 1 && b == 1)
            [r, g, b] = [1, 1, 1]

        colors.push(new Color(~~(r * 255), ~~(g * 255), ~~(b * 255), 1, true))
    }
    //make sure 0 is transparent
    const c = new Color(0, 0, 0, 0, true)
    colors[0] = c

    return (colors)
}

export const fireColorsBrainsmoke = calculateFireColorsBrainsmoke()


////////////////////////////////////////
function calculateRainbow() {
    let ret = []
    for (let i = 0; i < 1000; i++) {
        const c=new Color()
        c.setHsl(i / 1000, 1, 0.5)
        ret.push(c)
    }
    return ret
}


export const rainbow = calculateRainbow()

const patterns = {
    'Doom fire': fireColorsDoom,
    'Bertrik fire': fireColorsBertrik,
    'Brainsmoke fire': fireColorsBrainsmoke,
    'Rainbow': rainbow
}

//helper to make it easier to let the user select a color pattern
export function patternSelect(control: ControlGroup, name = 'Color pattern', selected = 'Bertrik fire'): Array<Color> {
    let choices = []
    for (const [id, color] of Object.entries(patterns)) {
        choices.push({id: id, name: id})
    }

    const patternControl = control.select(name, selected, choices, true)
    const patternRangeControl = control.range(name + ' range', 0, 100, 0, 100, 1, true)

    const pattern = patterns[patternControl.selected]
    if (patternRangeControl.from == 0 && patternRangeControl.to == 100)
        return pattern
    else {
        const startI = ~~(patternRangeControl.from / 100 * pattern.length)
        const endI = ~~(patternRangeControl.to / 100 * pattern.length)
        return (pattern.slice(startI, endI + 1))
    }
}
