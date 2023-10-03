import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import DrawAsciiArt from "../../draw/DrawAsciiArt.js"
import FxMovie from "../../fx/FxMovie.js"
import FxRotate from "../../fx/FxRotate.js"
import Animator from "../../Animator.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"
import Color from "../../Color.js"
import Pixel from "../../Pixel.js"
import DrawLine from "../../draw/DrawLine.js"



export default class Grasmaaier extends Animator {
    static category = "Misc"
    static title = "Dnah"
    static description = "blabla"

    mapValue(value:number,sourceMin:number,sourceMax:number)
    {
       
        let sourceDiff=(sourceMax-sourceMin)
        let ret=(sourceDiff*value)+sourceMin
        ret=Math.min(sourceMax,ret)
        ret=Math.max(sourceMin,ret)
        return ret
    }

    drawDna(box:PixelBox,iterations:number, start:number,frequency:number,color1,color2,stepcount)
    {
        let pl=new PixelList();
        let halfHeight=(box.height()/2.0)
        let h2=box.height()/2
        let xi=0;
        if (frequency==0) {frequency=0.00001}
        let y1=0
        let a1=0
        let c1:Color
        let y2=0
        let a2=0
        let c2:Color
        for (let i=start;i<start+box.width();i=i+(1/iterations))
        {
           
            
            let foreground=false
            xi++;
            let x=i-start
            let colorPhase=93
            
            y1=Math.sin(i/frequency)*halfHeight+(halfHeight)
            a1=Math.min(Math.max((Math.sin((i/frequency)+colorPhase)+1)/2,0.0),1.0)
            c1=color1.copy()
            c1.a=a1
           
            //pl.add(new Pixel(x-1,y1,new Color(color1.r,color1.g,color1.b,(a1/iterations)/2)))
            //pl.add(new Pixel(x+1,y1,new Color(color1.r,color1.g,color1.b,(a1/iterations)/2)))

            y2=Math.sin((i/frequency)+60)*halfHeight+(halfHeight)
            a2=Math.min(Math.max((Math.sin((i/frequency)+colorPhase+60)+1)/2,0.0),1.0)
            c2=color2.copy()
            c2.a=a2
           // pl.add(new Pixel(x-1,y2,new Color(color2.r,color2.g,color2.b,(a2/iterations)/2)))
            //pl.add(new Pixel(x+1,y2,new Color(color2.r,color2.g,color2.b,(a2/iterations)/2)))

            //pl.add(new Pixel(i-start,box.height()/2-1,c1))
            //pl.add(new Pixel(i-start,box.height()/2+1,c2))

            if (((x)%stepcount)<1 )
            {
               pl.add(new DrawLine(x,y1,x+0.1,y2,c1,c2))
            }
            

            if (Math.sin(i/frequency)>Math.sin((i+0.01)/frequency)){
                pl.add(new Pixel(x,box.height()/2,c2))
                pl.add(new Pixel(x,box.height()/2,c1))
                pl.add(new Pixel(x,y2,c2))
                pl.add(new Pixel(x,y1,c1))
              
                foreground=true;
            }
            else
            {
                pl.add(new Pixel(x,box.height()/2,c2))
                pl.add(new Pixel(x,box.height()/2,c1))
                pl.add(new Pixel(x,y1,c1))
                pl.add(new Pixel(x,y2,c2))
              
                foreground=false;
            }
          
            
           
        }
        
        return pl
    }

    

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, x = 0, y = 0) {

        const dnaControls=controls.group("Dna")
        const dnaIntervalControl = dnaControls.value("Clock interval", 1, 1, 10, 0.1,true)
        const dnaFrequencyControl = dnaControls.value("Frequency", 10,-32, 32, 0.1,true)
        const dnaSpeedControl = dnaControls.value("speed", 0.2, -1, 1, 0.01,true)
        const dnaIterationControl = dnaControls.value("iterations", 1, 1, 10, 1,true)
        const dnaStepCount= dnaControls.value("steps", 2, 0, 32, 1,true)
        const dnaColor1=dnaControls.color("color1",255,0,0,1,true)
        const dnaColor2=dnaControls.color("color2",0,0,255,1,true)
        let frameCounter=0
        let framebuffer:PixelList=new PixelList()
        box.add(framebuffer)

        scheduler.intervalControlled(dnaIntervalControl, (frameNr) => {
            frameCounter=frameCounter+(dnaSpeedControl.value)
         framebuffer.clear()
         framebuffer.add(this.drawDna(box,dnaIterationControl.value,frameCounter,dnaFrequencyControl.value,dnaColor1,dnaColor2,dnaStepCount.value))
    
        })


    }
}
