import Font from "./Font.js";
import ControlGroup from "./ControlGroup.js";

//good places for more fonts:
// https://damieng.com/typography/zx-origins/#All/All
// https://fontstruct.com/gallery/tag/41/Pixels
// https://github.com/rewtnull/amigafonts


export let fonts = {
    'Atari regular': new Font('Atari', 'fonts/EightBit Atari-Regular.ttf', 8, 8, 0),
    'C64 mono': new Font('C64 monospaced', 'fonts/C64_Pro_Mono-STYLE.otf', 8, 8, 0),
    'C64': new Font('C64', 'fonts/C64_Pro-STYLE.otf', 8, 8, 0),
    'IBM bios': new Font('IBM bios', 'fonts/PxPlus_IBM_BIOS.ttf', 8, 8, 0),
    'MSX': new Font('MSX', 'fonts/MSX-Screen0.ttf', 8, 8, 0),
    'ZX Sierra Quest': new Font('ZX Sierra Quest', 'fonts/ZX Sierra Quest.ttf', 8, 8, -1),
    'Anarchist': new Font('Anarchist', 'fonts/Anarchist.ttf', 8, 8, 1),
    'Skid Row': new Font('Skid Row', 'fonts/Skid Row.ttf', 8, 8, 0),
    'Quasar': new Font('Quasar', 'fonts/Quasar.ttf', 8, 8, 0),
    'Computer': new Font('Computer', 'fonts/Computer.ttf', 7, 8, 0),
    'Picopixel': new Font('Picopixel', 'fonts/Picopixel.ttf', 7, 7, -1),
    'ORG v01': new Font('Org v01', 'fonts/ORG_V01_.TTF', 8, 8, -2),
    'Tiny 3x3': new Font('Tiny 3x3', 'fonts/tiny3x3a.ttf', 4, 4, 0),
    'Pixel-Gosub': new Font('Pixel-Gosub', 'fonts/pixel-gosub.ttf', 7, 7, -1),
    //broken:
    // 'Tom thumb': new Font('Tom thumb', 'fonts/tom-thumb.bdf', 6, 6, 0),
}

//helper to make it easier to let the user select a font
export function fontSelect(control:ControlGroup, name='Font', defaultFont='C64' , heightOffset=0):Font
{
    let choices = []
    for (const [id, font] of Object.entries(fonts)) {
        choices.push({id: id, name: font.name})
    }


    const fontControl = control.select(name, defaultFont, choices, true)
    const heightControl = control.value(name+ ' height', heightOffset,0,100,1, true)
    const widthControl = control.value(name+ ' width', heightOffset,0,100,1, true)

    const f=fonts[fontControl.selected]
    const fontCopy = new Font(f.name, f.filename, f.width+widthControl.value, f.height + heightControl.value, f.baseOffset)
    fontCopy.load()
    return (fontCopy)
}
