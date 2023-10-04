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



export default class Dnaspiral extends Animator {
    static category = "Misc"
    static title = "Pacman"
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
        let halfWidth=box.width()*0.25
        //let frequency=box.width()*0.25
        let yi=0;
        if (frequency==0) {frequency=0.00001}
        for (let i=start;i<start+box.height();i=i+(1/iterations))
        {
            let foreground=false
            yi++;
            let y=i-start
            let colorPhase=93
            let x1=Math.sin(i/frequency)*halfWidth+(halfWidth*2)
            let a1=Math.min(Math.max((Math.sin((i/frequency)+colorPhase)+1)/2,0.0),1.0)
            let c1=color1.copy()
            c1.a=a1
           
            pl.add(new Pixel(x1-1,y,new Color(color1.r,color1.g,color1.b,(a1/iterations)/2)))
            pl.add(new Pixel(x1+1,y,new Color(color1.r,color1.g,color1.b,(a1/iterations)/2)))

            let x2=Math.sin((i/frequency)+60)*halfWidth+(halfWidth*2)
            let a2=Math.min(Math.max((Math.sin((i/frequency)+colorPhase+60)+1)/2,0.0),1.0)
            let c2=color2.copy()
            c2.a=a2
            pl.add(new Pixel(x2-1,y,new Color(color2.r,color2.g,color2.b,(a2/iterations)/2)))
            pl.add(new Pixel(x2+1,y,new Color(color2.r,color2.g,color2.b,(a2/iterations)/2)))

            if (Math.sin(i/frequency)>Math.sin((i+0.01)/frequency)){
                pl.add(new Pixel(x2,y,c2))
                pl.add(new Pixel(x1,y,c1))
                foreground=true;
            }
            else
            {
                pl.add(new Pixel(x1,y,c1))
                pl.add(new Pixel(x2,y,c2))
                foreground=false;
            }
          
            if ((yi>(stepcount)) )
            {
               yi=0
                let opacityMultiplier=1
                //if (frequency)
                let p1=x1
                let p2=x2
               
                if (x1>x2) {p1=x2; p2=x1; }
                let xdiff=(p2-p1)*1.00
                for (let j=0;j<xdiff;j=j+1)
                {
                    let colorFrom=c1.copy()
                    let colorTo=c2.copy()
                    //if (x1>x2) { colorFrom=c2.copy(); colorTo=c1.copy();}
                    let myRed   =   this.mapValue(j/(xdiff-1),colorFrom.r,colorTo.r)
                    let myGreen =   this.mapValue(j/(xdiff-1),colorFrom.g,colorTo.g)
                    let myBlue  =   this.mapValue(j/(xdiff-1),colorFrom.b,colorTo.b)
                    let myAlpha =   this.mapValue(j/(xdiff-1),a1,a2)/2
                   // if (foreground) {myAlpha =   this.mapValue(j/(xdiff-1),a2,a1) /2}
                    let myColor=new Color(myRed,myGreen,myBlue,myAlpha)
                    pl.add(new Pixel(j+p1,y,myColor))
                }
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
