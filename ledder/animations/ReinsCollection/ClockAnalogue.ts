import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import {fonts, fontSelect} from "../../fonts.js"
import DrawText from "../../draw/DrawText.js"
import Pixel from "../../Pixel.js"
import PixelList from "../../PixelList.js"
import DrawLine from "../../draw/DrawLine.js"
import Color from "../../Color.js"
import { patternSelect } from "../../ColorPatterns.js"

function deg2rad(degrees: number) {
   degrees = 180-(degrees)
    var pi = Math.PI;
    return degrees * (pi / 180);
}

export default class ClockAnalogue extends Animator {
    static category = "Time"
    static title = "Clock "
    static description = "analoge? klok"
    cx:number
    cy:number
    radius:number
    colorSettings
    colorIndex:number

    init(cx:number,cy:number,radius:number,colorSettings:Object)
    {
        this.cx=cx
        this.cy=cy
        this.radius=radius
        this.colorSettings=colorSettings
        this.colorIndex=0
    }

    drawClockStatics()
    {
        let pl=new PixelList()
        pl.add( new Pixel(this.cx,this.cy,new Color(255,255,255,0.3)))

        //hour marks
        for (let degrees=0; degrees<360; degrees=degrees+(360/12))
        {
            let x=Math.round(this.cx+(Math.sin(deg2rad(degrees))*(this.radius)))
            let y=Math.round(this.cy+(Math.cos(deg2rad(degrees))*(this.radius)))
            pl.add(new Pixel(x,y, new Color(0,0,255,0.5)))
        }
        return pl
    }

    drawHand(degrees,radius:number,color:Color)
    {
        let pl=new PixelList()
        let x=Math.round(this.cx+(Math.sin(deg2rad(degrees))*radius))
        let y=Math.round(this.cy+(Math.cos(deg2rad(degrees))*radius))
        let c=color.copy()
        pl.add(new Pixel(x,y,c))
        return pl
    }

    drawClockDynamics(box:PixelBox,time:Date)
    {
        let pl=new PixelList()
       
        //HOURS
        let degrees=(time.getHours()+(time.getMinutes()/60)  )*(360/12)
        pl.add(this.drawHand(degrees, (this.radius*0.6),  this.colorSettings.hours))
       
    
        //MINUTES
        degrees=(time.getMinutes()+(time.getSeconds()/60) )*(360/60)
        pl.add(this.drawHand(degrees, (this.radius*0.75),   this.colorSettings.minutes))
    
        //SECONDS
        degrees=(time.getSeconds() + (time.getMilliseconds()/1000))*(360/60)
        pl.add(this.drawHand(degrees, (this.radius),  this.colorSettings.seconds))
          

        //MILLIS
        degrees=time.getMilliseconds()*(360/1000)
        let xm=Math.round(this.cx+(Math.sin(deg2rad(degrees))*(this.radius)))
        let ym=Math.round(this.cy+(Math.cos(deg2rad(degrees))*(this.radius)))
        pl.add(new Pixel(xm,ym, this.colorSettings.millis))
        return pl
    }

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, x = 0, y = 0) 
    {
        const colors = patternSelect(controls, 'Color Palette', 'Rainbow')
        const colorControlH = controls.color("Hour color", 255, 0, 0);
        const colorControlM = controls.color("Minute color", 0, 255, 0);
        const colorControlS = controls.color("Second color", 0, 0, 255);
        const colorControlm= controls.color("Milli color", 0, 0, 255);
        const clockIntervalControl = controls.value("Clock interval", 1, 1, 10, 0.1);
        const font = fontSelect(controls, 'Font')
        let colorSettings={palette:colors,hours:colorControlH,minutes:colorControlM,seconds:colorControlS,millis:colorControlm,font:font}
        this.init(Math.round(box.width()/2),Math.round((box.height()-2)/2),Math.round((box.height()-2)/2),colorSettings)
      
        let plStatic=new PixelList()
        let plDynamic=new PixelList()
        box.add(plStatic)
        box.add(plDynamic)
        plStatic.add(this.drawClockStatics())
       
        scheduler.intervalControlled(clockIntervalControl, (frameNr) => {
            plDynamic.clear()
            plDynamic.add(this.drawClockDynamics(box,new Date()))
        });
       
    }

}
