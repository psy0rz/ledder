import {PixelContainer} from "./PixelContainer.js";
import {Matrix} from "./Matrix.js";
import {ColorInterface} from "./ColorInterface.js";
import {Pixel} from "./Pixel.js";
import {Font} from "./Font.js";

//rendered font text, consisting of a bunch of Pixel objects
export class CharPixels extends PixelContainer {

    //total width of whole text
    width: number
    //total height of whole text
    height: number

    constructor(matrix: Matrix, font: Font, text: string, xStart: number, yStart: number, color: ColorInterface) {
        super()

        this.width = 0

        for (let charNr = 0; charNr < text.length; charNr++) {
            const glyph = font.getGlyph(text.charCodeAt(charNr))
            this.height = font.height

            if (glyph.bitmap) {

                for (let row = 0; row < glyph.bitmap.height; row++) {
                    const offset = (row * glyph.bitmap.pitch)
                    const bits = glyph.bitmap.buffer.readUInt8(offset)
                    for (let col = 0; col < glyph.bitmap.width; col++) {

                        const x = xStart + this.width + col + glyph.bitmapLeft
                        const y = yStart + glyph.bitmapTop - row + font.baseOffset

                        if (bits & (1 << (7-col) ))
                            this.pixels.push(new Pixel(matrix, x, y, color))
                    }
                }
            }

            this.width = this.width + glyph.metrics.horiAdvance / 64

        }
    }

    //usefull for rotate and other fx
    bbox() {
        return ({
            xMin: 0,
            yMin: 0,
            yMax: this.height,
            xMax: this.width
        })
    }
}
