import {ColorInterface} from "../ColorInterface.js";
import {Pixel} from "../Pixel.js";
import {Font} from "../Font.js";
import Draw from "../Draw.js";

//rendered font text. x,y are left bottom coordinates
export default class DrawText extends Draw {

    constructor(x: number, y: number, font: Font, text: string,  color: ColorInterface) {
        super()

        for (let charNr = 0; charNr < text.length; charNr++) {
            const glyph = font.getGlyph(text.charCodeAt(charNr))

            if (glyph.bitmap) {

                for (let row = 0; row < glyph.bitmap.height; row++) {
                    const offset = (row * glyph.bitmap.pitch)
                    const bits = glyph.bitmap.buffer.readUInt8(offset)
                    for (let col = 0; col < glyph.bitmap.width; col++) {

                        const thisX =  x + col + glyph.bitmapLeft
                        const thisY =  y + glyph.bitmapTop - row-1 + font.baseOffset

                        if (bits & (1 << (7-col) ))
                            this.add(new Pixel( thisX, thisY, color))
                    }
                }
            }

            x = x + glyph.metrics.horiAdvance / 64

        }
    }

}
