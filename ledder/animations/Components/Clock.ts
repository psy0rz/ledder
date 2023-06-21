import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import {fonts, fontSelect} from "../../fonts.js"
import DrawText from "../../draw/DrawText.js"
import Pixel from "../../Pixel.js"
import PixelList from "../../PixelList.js"
import Color from "../../Color.js"


export default class Clock extends Animator {
    static category = "Time"
    static title = "Clock"
    static description = "blabla"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, x = 0, y = 0) 
    {
      
        const colorControlH = controls.color("Hour color", 255, 0, 0);
        const colorControlM = controls.color("Minute color", 0, 255, 0);
        const colorControlS = controls.color("Second color", 0, 0, 255);
        const colorControlC = controls.color("Milli color", 0, 0, 255);
        const colorMarksControl = controls.color("Marks color", 32,0,0);
        const clockMarksControl = controls.switch("Hour marks", true, true);
        const clockTextControl = controls.switch("Text", true, true);
        const clockDotsControl = controls.switch("Dots", true, true);
        const clockIntervalControl = controls.value("Clock interval", 1, 1, 10, 0.1);
        scheduler.intervalControlled(clockIntervalControl, (frameNr) => {
            //box.filterRGB(20,40,60,10)
            box.clear()
            let time=new Date()
            let timestring=""
            let minutes="00"+time.getMinutes().toString()
            let hours="00"+time.getHours().toString()
            let seconds="00"+time.getSeconds().toString()
            let millis="00"+time.getMilliseconds().toString()
            let charwidth=fontSelect(controls).width
            let charheight=fontSelect(controls).height
            let yoffset=Math.round((box.height()-charheight)/2)
            let xoffset=0
            if (box.width()<40)
            {
                //seconds dont fit on a 32 pixel screen
                timestring=hours+""+minutes.substring(minutes.length-2,minutes.length)
                xoffset=Math.round((box.width()-(timestring.length*charwidth))/2)
                if (xoffset<0) {xoffset=0}
            }
            else
            {
                timestring=hours.substring(hours.length-2,hours.length)+""+minutes.substring(minutes.length-2,minutes.length)+""+seconds.substring(seconds.length-2,seconds.length)
                xoffset=Math.round((box.width()-(timestring.length*charwidth))/2)
            }
            const textH = new DrawText(xoffset, yoffset, fontSelect(controls),hours.substring(hours.length-2,hours.length) , colorControlH)
            const textM = new DrawText(xoffset+(charwidth*2), yoffset, fontSelect(controls),minutes.substring(minutes.length-2,minutes.length) , colorControlM)
            const textS = new DrawText(xoffset+(charwidth*4), yoffset, fontSelect(controls),seconds.substring(seconds.length-2,seconds.length) , colorControlS)
            const colors={"h":colorControlH,"m":colorControlM,"s":colorControlS,"c":colorControlC,"x":colorMarksControl}

            if (clockTextControl.enabled)
            {
                if (box.width()>40)
                {
                    box.add(textS)
                }
                box.add(textM)
                box.add(textH)
            }

            if (clockMarksControl.enabled)
            {
                let borderledsCount=(box.width()*2)+((box.height())*2)
                box.add(this.drawHourMarks(box,borderledsCount,colors))
            }

            if (clockDotsControl.enabled)
            {
                box.add(this.drawSquareClock(box,time,colors))
            }
            
           

           
    
        });
       
    }

    drawSquareClock(box:PixelBox, time:Date,colors)
    {
        let borderledsCount=(box.width()*2)+((box.height())*2)
        let hx=Math.round(borderledsCount/12*(time.getHours()%12)+(time.getMinutes()/60))
        let mx=Math.round(borderledsCount/60*(time.getMinutes()+(time.getSeconds()/60)))
        let sx=Math.round(borderledsCount/60*(time.getSeconds()+(time.getMilliseconds()/1000)))
        let cx=Math.round(borderledsCount/1000*(time.getMilliseconds()))
        let pl=new PixelList()
       
       
        //most significant on top
       colors.c.a=0.8
        pl.add(this.drawTail(box,cx,Math.round(borderledsCount/24),colors.c ))
        pl.add( this.mapSquareClockPixel(box,cx,colors.c ))
        pl.add(this.drawTail(box,sx,Math.round(borderledsCount/60),colors.s )) // this.mapSquareClockPixel(box,sx,colors.s ))
        pl.add(this.drawTail(box,mx,Math.round(borderledsCount/24),colors.m )) //pl.add( this.mapSquareClockPixel(box,mx,colors.m ))
        pl.add(this.drawTail(box,hx,Math.round(borderledsCount/12),colors.h )) //pl.add( this.mapSquareClockPixel(box,hx,colors.h ))
        
        return pl
    }

    drawHourMarks(box:PixelBox,borderledsCount:number,colors)
    {
        let p=new PixelList();
        let t=new Date();
        let glow=Math.round(t.getMilliseconds()/1000*255)
        for (let i=0;i<12;i=i+1)
        {
            let j=Math.round(i*(borderledsCount/12))
            colors.x.a=0.3
            p.add(this.mapSquareClockPixel(box,j,colors.x))
        }
        return p;
    }

    drawTail(box:PixelBox,borderledIndex:number,tailLength:number,color:Color)
    {
        let pl=new PixelList()
        let borderledsCount=(box.width()*2)+((box.height())*2)
        let col=color.copy()
        let newLedIndex=0
        //console.log("tail",tailLength,color)
        for (let j=0; j<tailLength;j++)
        {
            let col=color.copy()
            let c=col.copy()
            let d=1/(tailLength*1.0)
            c.a=1-Math.min(1,Math.max(0.2,(col.a*(j*d))))
            newLedIndex=(borderledIndex-j)%borderledsCount;
            if (newLedIndex<0) {newLedIndex=borderledsCount-newLedIndex}
            //console.log("colortail",newLedIndex,c)
            pl.add(  this.mapSquareClockPixel( box,  newLedIndex ,c   ))
        }
        return pl
    }

    mapSquareClockPixel(box:PixelBox,borderledIndex:number,color:Color)
    {
        let x=0
        let y=0
        let cx=(Math.round(box.width()/2))
        let cy=(Math.round(box.height()/2))
        let borderledsCount=(box.width()*2)+((box.height())*2)
        let breakpoint0=-1
        let breakpoint1=(box.width()/2)
        let breakpoint2=breakpoint1+(box.height())
        let breakpoint3=breakpoint2+box.width()
        let breakpoint4=breakpoint3+(box.height())
        let breakpoint5=breakpoint4+(box.width()/2)

        if (borderledIndex==0)
        {
            x=box.width()/2
            y=0;
        }

        if (borderledIndex>breakpoint0 && borderledIndex<breakpoint1)
        {    //from top center to top right
             x=Math.round((box.width()/2)+borderledIndex)
             y=0
        }

        if (borderledIndex==Math.round(breakpoint1))
        {
            x=box.width()-1
            y=0;
        }

        if (borderledIndex>breakpoint1 && borderledIndex<breakpoint2)
        {
            //top right to bottom right
             x=box.width()-1
             y=(borderledIndex-breakpoint1)-1
        }

        if (borderledIndex==Math.round(breakpoint2))
        {
            x=box.width()-1
            y=box.height()-1
        }

        if (borderledIndex>breakpoint2 && borderledIndex<breakpoint3)
        {
            //bottom right to bottom left
             x=box.width()-(borderledIndex-breakpoint2)-1
             y=box.height()-1
        }

        if (borderledIndex==Math.round(breakpoint3))
        {
            x=0
            y=box.height()-1
        }

        if (borderledIndex>breakpoint3 && borderledIndex<breakpoint4)
        {
             //bottom left to top left
             x=0
             y=box.height()-(borderledIndex-breakpoint3)-1
        }

        if (borderledIndex==Math.round(breakpoint4))
        {
            x=0
            y=0
        }

        if (borderledIndex>breakpoint4 && borderledIndex<breakpoint5)
        {
            //top left to top center
             x=borderledIndex-breakpoint4-1
             y=0
        }


        if (borderledIndex==Math.round(breakpoint5))
        {
            x=box.width()/2
            y=0
        }

        let pixel=new Pixel(x,y,color)
        return pixel
    }
}
