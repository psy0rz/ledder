import freetype, {type FontFace, type Glyph} from "@julusian/freetype2"

//freetype2 wrapper, specially for low resolution display displays and pixelly fonts
//usually these fonts have one optimum height/width setting
export default class Font {
    name: string
    filename: string
    width: number
    height: number
    baseOffset: number

    fontFace: FontFace

    constructor(name: string, filename: string, width: number, height: number, baseOffset: number) {
        this.name = name
        this.filename = filename
        this.width = width
        this.height = height
        this.baseOffset = baseOffset

    }

    load() {
        if (!this.fontFace) {
            this.fontFace = freetype.NewFace(this.filename);
            this.fontFace.setPixelSizes(this.width, this.height);

        }
    }

    getGlyph(charCode: number): Glyph {
        return (this.fontFace.loadChar(charCode, {
            render: true,
            loadTarget: freetype.RenderMode.MONO,
            // monochrome: false,
            noAutohint: true
        }))
    }

    /**
     * Get glyph with anti-aliasing for scaled rendering
     */
    getGlyphAntialiased(charCode: number): Glyph {
        return (this.fontFace.loadChar(charCode, {
            render: true,
            loadTarget: freetype.RenderMode.NORMAL,
            noAutohint: false
        }))
    }

    /**
     * Measure actual pixel dimensions by analyzing rendered glyphs
     * Tests a sample of characters to determine real width and height
     */
    measureActualDimensions(): { width: number, height: number, details: any } {
        this.load();
        
        // Test characters that should represent typical character dimensions
        const testChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        
        let maxWidth = 0;
        let maxHeight = 0;
        let totalAdvance = 0;
        let charCount = 0;
        
        const charDetails: any[] = [];
        
        for (let i = 0; i < testChars.length; i++) {
            const charCode = testChars.charCodeAt(i);
            const glyph = this.getGlyph(charCode);
            
            if (glyph.bitmap) {
                const glyphWidth = glyph.bitmap.width;
                const glyphHeight = glyph.bitmap.height;
                const advance = Math.round(glyph.metrics.horiAdvance / 64);
                
                maxWidth = Math.max(maxWidth, glyphWidth);
                maxHeight = Math.max(maxHeight, glyphHeight);
                totalAdvance += advance;
                charCount++;
                
                charDetails.push({
                    char: testChars[i],
                    bitmapWidth: glyphWidth,
                    bitmapHeight: glyphHeight,
                    advance: advance,
                    bitmapLeft: glyph.bitmapLeft,
                    bitmapTop: glyph.bitmapTop
                });
            }
        }
        
        const avgAdvance = charCount > 0 ? Math.round(totalAdvance / charCount) : this.width;
        
        return {
            width: avgAdvance,  // Average character advance (spacing between chars)
            height: maxHeight,   // Maximum height needed
            details: {
                maxBitmapWidth: maxWidth,
                maxBitmapHeight: maxHeight,
                avgAdvance: avgAdvance,
                currentWidth: this.width,
                currentHeight: this.height,
                currentBaseOffset: this.baseOffset,
                sampleSize: charCount,
                charDetails: charDetails
            }
        };
    }

    /**
     * Auto-calibrate font dimensions based on actual measurements
     * Returns true if dimensions were updated
     */
    calibrate(): boolean {
        const measurements = this.measureActualDimensions();
        
        let updated = false;
        
        if (measurements.width !== this.width) {
            console.log(`Font ${this.name}: Updating width from ${this.width} to ${measurements.width}`);
            this.width = measurements.width;
            updated = true;
        }
        
        if (measurements.height !== this.height) {
            console.log(`Font ${this.name}: Updating height from ${this.height} to ${measurements.height}`);
            this.height = measurements.height;
            updated = true;
        }
        
        if (updated) {
            // Reload with new dimensions
            this.fontFace.setPixelSizes(this.width, this.height);
        }
        
        return updated;
    }


}
