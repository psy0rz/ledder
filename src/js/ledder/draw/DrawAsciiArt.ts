import Draw from "../Draw.js";
import {Color} from "../Color.js";
import {Matrix} from "../Matrix.js";
import {Pixel} from "../Pixel.js";

//based on official basic webcolors, but modified for better contast on leds
//https://en.wikipedia.org/wiki/Web_colors
const internetColorMap = {
    w: new Color(0xff, 0xff, 0xff,1 ,true),   //white
    5: new Color(0x80, 0x80, 0x80,1, true),   //gray
    0: new Color(0, 0, 0,1, true),            //black

    r: new Color(0xff, 0, 0,1, true),         //100% red
    m: new Color(0x80, 0, 0,1, true),         //maroon
    y: new Color(0xff, 0xff, 0,1, true),      //yellow
    o: new Color(0x80, 0x80, 0,1, true),      //olive
    l: new Color(0, 0xff, 0,1, true),         //100% green (lime)
    g: new Color(0, 0x80, 0,1, true),         //green
    a: new Color(0, 0xff, 0xff,1, true),      //aqua
    t: new Color(0, 0x80, 0x80,1, true),      //teal
    b: new Color(0, 0, 0xff,1, true),         //100% blue
    n: new Color(0, 0, 0x80,1, true),         //navy
    f: new Color(0xff, 0, 0xff,1, true),      //fuchsia
    p: new Color(0x80, 0, 0x80,1, true),      //purple
}

export default class DrawAsciiArt extends  Draw {
    constructor(x: number, y: number, ascii:string, copy=true, colorMap=internetColorMap) {
        super();

        let currX = x;
        let currY = y;

        for (const c of ascii) {
            // a . is a empty space
            if (c == '.')
                currX++;
            // next line
            else if (c == '\n') {
                currX = x;
                currY--;
            } else {
                //add actual pixel with requested color
                if (colorMap[c] !== undefined) {
                    if (copy)
                        this.add(new Pixel( currX, currY, colorMap[c].copy()))
                    else
                        this.add(new Pixel( currX, currY, colorMap[c]))
                    currX++;
                }
            }
        }
    }

}
