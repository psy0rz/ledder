import {Animation} from "./Animation.js";
import {Pixel} from "./Pixel.js";
import {Matrix} from "./Matrix.js";
import {Color} from "./Color.js";


//based on official basic webcolors
//https://en.wikipedia.org/wiki/Web_colors
const internetColorMap = {
  w: new Color(0xff, 0xff, 0xff),   //white
  s: new Color(0xc0, 0xc0, 0xc0),   //silver (75%)
  5: new Color(0x80, 0x80, 0x80),   //gray (50%)
  0: new Color(0, 0, 0),            //black

  r: new Color(0xff, 0, 0),         //100% red
  m: new Color(0x80, 0, 0),         //maroon
  y: new Color(0xff, 0xff, 0),      //yellow
  o: new Color(0x80, 0x80, 0),      //olive
  l: new Color(0, 0xff, 0),         //100% green (lime)
  g: new Color(0, 0x80, 0),         //green
  a: new Color(0, 0xff, 0xff),      //aqua
  t: new Color(0, 0x80, 0x80),      //teal
  b: new Color(0, 0, 0xff),         //100% blue
  n: new Color(0, 0, 0x80),         //navy
  f: new Color(0xff, 0, 0xff),      //fuchsia
  p: new Color(0x80, 0, 0x80),      //purple
}


export class AnimationAsciiArt extends Animation {

  /**
   * Create pixels from ascii art. Look at AnimationNyancat for example.
   * Spaces will be ignored, use . as "space"
   *
   * @param matrix
   * @param x
   * @param y
   * @param ascii
   * @param customColorMap
   */
  constructor(matrix: Matrix, x: number, y: number, ascii, customColorMap=undefined) {
    super(matrix);

    let colorMap
    if (customColorMap !== undefined)
      colorMap = customColorMap
    else
      colorMap = internetColorMap

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
          const p=new Pixel(matrix, currX, currY, colorMap[c])
          this.addPixel(p)
           currX++;
        }
      }
    }
  }
}
