import type ColorInterface from "../ColorInterface.js"
import Pixel from "../Pixel.js"
import Font from "../Font.js"
import Draw from "../Draw.js"

/** Where each line is placed relative to the anchor x */
export type HorizontalAlign = "left" | "centered" | "right"

/** Where the whole text block is placed relative to the anchor y */
export type VerticalAlign = "top" | "middle" | "bottom"


function isWhitespace(char: string) {
    return char === " " || char === "\t" || char === "\n"
}

//text may wrap to the next line after these characters
function endsWord(char: string) {
    return isWhitespace(char) || char === "-"
}


//rendered font text.
//x,y is the anchor point: each line is horizontally aligned on it by itself, the block as a whole is
//vertically aligned on it.
//wrapWidth is how wide a line may get before it wraps to the next one. Leave it out to never wrap.
export default class DrawText extends Draw {

    constructor(x: number, y: number, font: Font, rawText: string, color: ColorInterface,
                scale: number = 1.0, wrapWidth?: number,
                hAlign: HorizontalAlign = "left", vAlign: VerticalAlign = "top") {
        super()

        //so the layout below only ever has to look for "\n"
        const text = rawText.replace(/\r\n?/g, "\n")

        const lineHeight = font.height * scale
        const maxLineWidth = wrapWidth ?? Infinity

        const glyphs = []
        const advances = []
        for (let charNr = 0; charNr < text.length; charNr++) {
            const glyph = font.getGlyph(text.charCodeAt(charNr))
            glyphs.push(glyph)
            advances.push((glyph.metrics.horiAdvance / 64) * scale)
        }

        //width of the unbreakable word starting at charNr: everything up to the next whitespace, hyphen included.
        const wordWidthAt = (charNr: number) => {
            let width = 0
            for (let i = charNr; i < text.length; i++) {
                if (isWhitespace(text[i]))
                    break
                width += advances[i]
                if (text[i] === "-")
                    break
            }
            return width
        }

        //Lay out every character: which line it lands on and where the pen is on that line.
        //lineNr is -1 for characters that render nothing: newlines, and whitespace that a wrap
        //swallowed, so neither indents the new line.
        const lineNrs: number[] = []
        const penXs: number[] = []
        let penX = 0
        let lineNr = 0

        for (let charNr = 0; charNr < text.length; charNr++) {
            const advance = advances[charNr]

            //explicit line break: always breaks, even on an empty line (giving a blank line)
            if (text[charNr] === "\n") {
                lineNrs.push(-1)
                penXs.push(0)
                penX = 0
                lineNr++
                continue
            }

            if (penX > 0) {

                const startsWord = endsWord(text[charNr - 1])
                const wordWidth = startsWord ? wordWidthAt(charNr) : 0

                //wrap the whole word, unless the word never fits on a line: then wrap per character.
                const wrapsWholeWord = startsWord && wordWidth <= maxLineWidth
                const needsWrap = wrapsWholeWord ? (penX + wordWidth > maxLineWidth) : (penX + advance > maxLineWidth)

                if (needsWrap) {
                    penX = 0
                    lineNr++

                    if (isWhitespace(text[charNr])) {
                        lineNrs.push(-1)
                        penXs.push(0)
                        continue
                    }
                }
            }

            lineNrs.push(lineNr)
            penXs.push(penX)
            penX = penX + advance
        }

        //Render each line into its own list, still in pen coordinates (line 0 starting at 0,0).
        const pixelsPerLine: Array<Array<Pixel>> = []
        for (let i = 0; i <= lineNr; i++)
            pixelsPerLine.push([])

        for (let charNr = 0; charNr < text.length; charNr++) {
            const glyph = glyphs[charNr]

            if (lineNrs[charNr] === -1 || !glyph.bitmap)
                continue

            const linePixels = pixelsPerLine[lineNrs[charNr]]
            const penY = lineNrs[charNr] * lineHeight

            for (let row = 0; row < glyph.bitmap.height; row++) {
                const offset = (row * glyph.bitmap.pitch)
                const bits = glyph.bitmap.buffer.readUInt16BE(offset)
                for (let col = 0; col < glyph.bitmap.width; col++) {

                    const thisX = penXs[charNr] + (col + glyph.bitmapLeft) * scale
                    const thisY = penY + (- glyph.bitmapTop + row + font.height-1 + font.baseOffset) * scale

                    if (bits & (1 << (15 - col))) {
                        // For scale > 1, draw multiple pixels to create scaled effect
                        if (scale > 1) {
                            for (let sy = 0; sy < scale; sy++) {
                                for (let sx = 0; sx < scale; sx++) {
                                    linePixels.push(new Pixel(thisX + sx, thisY + sy, color))
                                }
                            }
                        } else {
                            linePixels.push(new Pixel(thisX, thisY, color))
                        }
                    }
                }
            }
        }

        //Horizontally align every line on the anchor, by its own rendered width.
        for (const linePixels of pixelsPerLine) {

            if (linePixels.length === 0)
                continue

            let inkMinX = linePixels[0].x
            let inkMaxX = linePixels[0].x
            for (const pixel of linePixels) {
                inkMinX = Math.min(inkMinX, pixel.x)
                inkMaxX = Math.max(inkMaxX, pixel.x)
            }

            let lineX = x  //left: the pen starts on the anchor, so lines never jitter on glyph bearings
            if (hAlign === "centered")
                lineX = x - Math.round((inkMinX + inkMaxX) / 2)
            else if (hAlign === "right")
                lineX = x - inkMaxX

            for (const pixel of linePixels) {
                pixel.x = pixel.x + lineX
                this.add(pixel)
            }
        }

        //Vertically align the block as a whole on the anchor.
        const blockBbox = this.bbox()
        if (blockBbox !== undefined) {

            let blockY = y  //top: the first line starts on the anchor
            if (vAlign === "middle")
                blockY = y - Math.round((blockBbox.yMin + blockBbox.yMax) / 2)
            else if (vAlign === "bottom")
                blockY = y - blockBbox.yMax

            this.move(0, blockY)
        }
    }
}

