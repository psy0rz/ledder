import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import DrawLine from "../../draw/DrawLine.js"
import Animator from "../../Animator.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"
import Color from "../../Color.js"
import Pixel from "../../Pixel.js"
import {random} from "../../utils.js"
import {patternSelect} from "../../ColorPatterns.js"

export default class Lines extends Animator {
    static category = "Misc"
    static title = "Lines"
    static description = "blabla"


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, x = 0, y = 0) {

        const dnaControls=controls.group("Dna")
        const dnaIntervalControl = dnaControls.value("Clock interval", 1, 1, 10, 0.1,true)
        const bufferControl = dnaControls.value("Buffer size", 1, 1, 64, 1,true)
        let framebuffer:PixelList=new PixelList()
        box.add(framebuffer)
        let x1=0
        let x2=0
        let c1=new Color(255,0,0,1)
        let y1=box.width()/2
        let y2=box.height()/2
        let c2=new Color(0,0,255,1)
        let lineArray=[]

        scheduler.intervalControlled(dnaIntervalControl, (frameNr) => {
         framebuffer.clear()
         
         x1=x2
         y1=y2
         c1=c2
         x2=random(1,box.width()-1)
         y2=random(1,box.height()-1)
         c2=new Color(random(0,255),random(0,255),random(0,255),random(0,100)/100)
         lineArray.push(new DrawLine(x1,y1,x2,y2,c1,c2))
         if (lineArray.length>bufferControl.value) { lineArray.shift()}
         for (let i=0;i<lineArray.length;i++)
         {
            framebuffer.add(lineArray[i])
           
         }
         //framebuffer.add(new DrawLine(x1,y1,x2,y2,c1,c2))
        })


    }
}
