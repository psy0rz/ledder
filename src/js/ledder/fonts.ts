import {Font} from "./Font.js";
import {ControlGroup} from "./ControlGroup.js";

//good places for more fonts:
// https://damieng.com/typography/zx-origins/#All/All
// https://fontstruct.com/gallery/tag/41/Pixels
// https://github.com/rewtnull/amigafonts


export let fonts = {
    'Atari regular': new Font('Atari', 'fonts/EightBit Atari-Regular.ttf', 0, 8, 0),
    'C64 mono': new Font('C64 monospaced', 'fonts/C64_Pro_Mono-STYLE.otf', 0, 8, 0),
    'C64': new Font('C64', 'fonts/C64_Pro-STYLE.otf', 0, 8, 0),
    'IBM bios': new Font('IBM bios', 'fonts/PxPlus_IBM_BIOS.ttf', 0, 8, 0),
    'MSX': new Font('MSX', 'fonts/MSX-Screen0.ttf', 0, 8, 0),
    'ZX Sierra Quest': new Font('ZX Sierra Quest', 'fonts/ZX Sierra Quest.ttf', 0, 8, 0),
    'Anarchist': new Font('Anarchist', 'fonts/Anarchist.ttf', 0, 8, -1),
    'Skid Row': new Font('Skid Row', 'fonts/Skid Row.ttf', 0, 8, 0),
    'Quasar': new Font('Quasar', 'fonts/Quasar.ttf', 0, 8, 0),
    'Computer': new Font('Computer', 'fonts/Computer.ttf', 0, 8, 0),
    'Picopixel': new Font('Picopixel', 'fonts/Picopixel.ttf', 0, 7, 0),
    'ORG v01': new Font('Org v01', 'fonts/ORG_V01_.TTF', 0, 8, 0),
    'Tiny 3x3': new Font('Tiny 3x3', 'fonts/tiny3x3a.ttf', 4, 4, 0),
    'Tom thumb': new Font('Tom thumb', 'fonts/tom-thumb.bdf', 4, 6, 0),
}

//helper to make it easier to let the user select a font
export function fontSelect(control:ControlGroup, name='Font', selected='C64' ):Font
{
    let choices = []
    for (const [id, font] of Object.entries(fonts)) {
        choices.push({id: id, name: font.name})
    }

    const fontControl = control.select(name, selected, choices, true)
    const font = fonts[fontControl.selected]
    font.load()
    return (font)
}
