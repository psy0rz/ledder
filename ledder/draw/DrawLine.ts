 import Draw from "../Draw.js";
 import Pixel from "../Pixel.js";
 import PixelList from "../PixelList.js";
 import ColorInterface from "../ColorInterface.js";
 import Color from "../Color.js";


 //draw a simple line .
 export default class DrawLine extends Draw {
     constructor(x1: number, y1: number, x2: number, y2: number, color1: ColorInterface,color2: ColorInterface,antialias:boolean=true) {
       
         super();
         let line=new PixelList()
         line.add(new Pixel(0,0,new Color(0,0,0,0)))
         let xDiff=(x2-x1)
         let xDiffAbs=Math.abs(xDiff)
         let yDiff=y2-y1
         let ratio=1
         if (xDiff!=0) { ratio=yDiff/(xDiffAbs) }
         let xDelta=Math.sign(xDiff)
         let yDeltaPerX=yDiff/xDiff
         let y=y1
         for (let x = 0; x < xDiffAbs ; x=x+Math.abs(xDelta))
         {
            y=y+yDeltaPerX
            let weight=0;
            if (xDiff!=0) { weight=x/xDiff } else {weight=1}
            for (let yy=0;yy<Math.abs(ratio);yy++)
            {
              //console.log(x,y,weight)
              line.add(new Pixel(x1+x,y+yy,this.interpolateColor(color1,color2,Math.abs(weight))))
              if (antialias)
              {
                line.add(new Pixel(x1+x+0.5,y+yy+0.5,this.interpolateColor(color1,color2,Math.abs(weight/2))))
              }
            }
         }
         this.add(line)

     }

     interpolateColor(color1:ColorInterface,color2:ColorInterface,weight:number)
     {
        let c1=color1.copy()
        let c2=color2.copy()
        let r=Math.round((c1.r*(1-weight)) + (c2.r*weight))
        let g=Math.round((c1.g*(1-weight)) + (c2.g*weight))
        let b=Math.round((c1.b*(1-weight)) + (c2.b*weight))
        let a=Math.min(1.0,(c1.a*(1-weight)) + (c2.a*weight))
        return new Color(r,g,b,a)
     }

 }


