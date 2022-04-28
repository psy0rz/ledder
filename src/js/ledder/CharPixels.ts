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

    constructor(matrix: Matrix, font: Font, text: string, x: number, y: number, color: ColorInterface) {
        super()

        this.width = 0

        for (let charNr = 0; charNr < text.length; charNr++) {
            const glyph = font.getGlyph(text.charCodeAt(charNr))
            this.height = font.height

            if (glyph.bitmap) {

                for (let row = 0; row < glyph.bitmap.height; row++) {
                    for (let col = 0; col < glyph.bitmap.width; col++) {
                        const offset = (row * glyph.bitmap.pitch) + col
                        const gray = glyph.bitmap.buffer.readUInt8(offset)

                        const x = this.width + col + glyph.bitmapLeft
                        const y = glyph.bitmapTop - row + font.baseOffset

                        if (gray > 128)
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
