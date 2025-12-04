import type ColorInterface from "../ColorInterface.js"
import Pixel from "../Pixel.js"
import Font from "../Font.js"
import Draw from "../Draw.js"



//rendered font text.
export default class DrawText extends Draw {

    constructor(x: number, y: number, font: Font, text: string, color: ColorInterface, scale: number = 1.0) {
        super()

        for (let charNr = 0; charNr < text.length; charNr++) {
            const glyph = font.getGlyph(text.charCodeAt(charNr))

            if (glyph.bitmap) {

                for (let row = 0; row < glyph.bitmap.height; row++) {
                    const offset = (row * glyph.bitmap.pitch)
                    const bits = glyph.bitmap.buffer.readUInt16BE(offset)
                    for (let col = 0; col < glyph.bitmap.width; col++) {

                        const thisX = x + (col + glyph.bitmapLeft) * scale
//                        const thisY =  y + glyph.bitmapTop - row-1 + font.baseOffset
                        const thisY = y + (- glyph.bitmapTop + row + font.height-1 + font.baseOffset) * scale

                        if (bits & (1 << (15 - col))) {
                            // For scale > 1, draw multiple pixels to create scaled effect
                            if (scale > 1) {
                                for (let sy = 0; sy < scale; sy++) {
                                    for (let sx = 0; sx < scale; sx++) {
                                        this.add(new Pixel(thisX + sx, thisY + sy, color))
                                    }
                                }
                            } else {
                                this.add(new Pixel(thisX, thisY, color))
                            }
                        }
                    }
                }
            }

            x = x + (glyph.metrics.horiAdvance / 64) * scale

        }
    }
}

