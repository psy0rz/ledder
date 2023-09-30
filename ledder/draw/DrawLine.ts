 import Draw from "../Draw.js";
 import Pixel from "../Pixel.js";
 import PixelList from "../PixelList.js";
 import ColorInterface from "../ColorInterface.js";

 //draw a simple line .
 export default class DrawLine extends Draw {
     constructor(x1: number, y1: number, x2: number, y2: number, color: ColorInterface) {
        let line=new PixelList()
         super();
         let xDiff=x2-x1
         let yDiff=y2-y1
         let xDelta=Math.sign(xDiff)
         let yDelta=Math.sign(yDiff)
         let yDeltaPerX=yDiff/xDiff
         let y=y1
         for (let x = x1; x < x2 ; x+=xDelta)
         {
            y=y+yDeltaPerX
            line.add(new Pixel(x,y,color))
         }
         this.add(line)

     }
 }


