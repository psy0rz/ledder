import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import PixelList from "../../PixelList.js"
import Color from "../../Color.js"


export default class Pixelfan extends Animator {
    static category = "Ledart"
    static title = "Pixelfan"
    static description = "led ventlator thingy"
    

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) 
    {
        const countControl = controls.value("particle count", 100, 1, 3000, 1,true)
        const radiusControl = controls.value("radius modifier", 1, 1, 100, 1,true)
        const speedControl = controls.value("delay", 10, 1, 100, 1,true)
        const intervalControl = controls.value("Fractal interval", 1, 1, 10, 0.1)
        let pixelList=new PixelList()
        box.add(pixelList)
        let randomizer=0

        //create a fixed number of pixels
        for (let i=0;i<countControl.value;i++)
        {
            pixelList.add(new Pixel(box.middleX(),box.middleY(),new Color(255,255,255,1)))
        }

        scheduler.intervalControlled(intervalControl, (frameNr) => {
           let pixelnum=0;
           randomizer++
           let sinrand=randomizer/speedControl.value //Math.sin(randomizer/60)+1
           pixelList.forEachPixel((p, parent) => {
           
                let x=p.x
                let y=p.y
                let rx=pixelnum/radiusControl.value
                let ry=pixelnum/radiusControl.value
               /* if (pixelnum>0)
                {
                    rx=rx*5;
                    ry=ry*5;
                }*/

              
                x=(Math.round(Math.sin((rx+sinrand+pixelnum))*(rx)+(box.middleX())))
                y=(Math.round(Math.cos((ry+sinrand+pixelnum))*(ry)+(box.middleY())))
                p.x=x
                p.y=y
                //p.wrapX(box)
                //p.wrapY(box)
                p.color.r=Math.round(Math.sin((randomizer+pixelnum)/100))*127+127
                p.color.g=Math.round(Math.cos((randomizer+pixelnum)/100))*127+127
                p.color.b=Math.round(Math.sin((randomizer+pixelnum)/100))*127+127
                pixelnum++
               
           });
           
           
    
        });
       
    }

    
}
