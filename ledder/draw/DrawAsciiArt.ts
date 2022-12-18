import Draw from "../Draw.js";
import Pixel from "../Pixel.js";
import ColorInterface from "../ColorInterface.js";

//draw pixels via ascii art. x,y are top left coordinate
// - whitespace is ignored
// - empty space: .
// - pixel      : (anything else)
export default class DrawAsciiArt extends Draw {
    constructor(x: number, y: number, color: ColorInterface, ascii: string, copyColor = false) {
        super();

        let currX = x;
        let currY = y;

        ascii=ascii.replace(/^\s*/, "")


        for (const c of ascii) {
            // a . is a empty space
            if (c == '.')
                currX++;
            // next line
            else if (c == '\n') {
                currX = x;
                currY++;
            //everything NON-whitespace:
            } else if (/\S/.test(c)) {
                if (copyColor)
                    this.add(new Pixel(currX, currY, color.copy()))
                else
                    this.add(new Pixel(currX, currY, color))
                currX++
            }
        }
    }
}


