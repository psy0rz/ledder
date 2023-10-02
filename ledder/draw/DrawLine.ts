 import Draw from "../Draw.js";
 import Pixel from "../Pixel.js";
 import PixelList from "../PixelList.js";
 import ColorInterface from "../ColorInterface.js";
 import Color from "../Color.js";


 //draw a simple line .
 export default class DrawLine extends Draw {
     constructor(x1: number, y1: number, x2: number, y2: number, color1: ColorInterface,color2: ColorInterface) {
       
         super();
         let pixel1=new Pixel(x1,y1,color1)
         let pixel2=new Pixel(x2,y2,color2)
        
         
         let line=new PixelList()
         let xDiff=(pixel2.x-pixel1.x)
         let yDiff=(pixel2.y-pixel1.y)
         let distance=Math.sqrt(Math.pow(xDiff,2)+Math.pow(yDiff,2))
 

         if (distance>0)
         {
            let x=pixel1.x
            let y=pixel1.y
            for (let i=0; i<=distance; i++)
            {
                let weight=i/distance
               
                line.add(new Pixel(x,y,this.interpolateColor(color1,color2,Math.abs(weight))))
                x=x+xDiff/distance
                y=y+yDiff/distance
            }
            this.add(line)
         }

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


