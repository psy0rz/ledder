import freetype, {type FontFace, type Glyph} from "freetype2";

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


}
