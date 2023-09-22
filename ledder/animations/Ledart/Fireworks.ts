import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import {random} from "../../utils.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"
import { patternSelect } from "../../ColorPatterns.js"





class CloudGeometry{
    centerX:number
    centerY:number
    maxHeight:number
    minHeight:number=0
    maxWidth:number
    minWidth:number=0
    points=[]
    pixellist:PixelList
    radius:number
    energy:number
    colorindex:number
    particlecount:number
    colorpalette
    speed:number
   box:PixelBox
    particleTTL:number
  

    constructor(box:PixelBox,colorPalette,speed:number,particleTTL) {

        this.box=box
        this.centerX = box.width()/2
        this.centerY = box.height()/2
        this.pixellist = new PixelList();
        this.points=[]
        this.maxHeight=box.height()
        this.maxWidth=box.width()
        this.radius=1
        this.energy=0
        this.particlecount=0
        this.colorpalette=colorPalette
        this.colorindex=random(0,colorPalette.length-1)
        this.speed=speed
        this.particleTTL=particleTTL  
    }

    generate(i:number)
    {
        this.particlecount=i
        this.points=[]
        for (let l=0;l<i;l++)
        {
            let x=this.centerX
            let y=this.centerY
            let energy=random(0,2000)/1000.0
            this.points.push({x:x,y:y,i:1,energy:energy })
        }
        //console.log(this.points)
    }


    remapX(box:PixelBox,x:number)
    {
        //if (x<0) {x=x+box.width()}
        //if (x>box.width()) { x=x-box.width()}
        return x
    }

    remapY(box:PixelBox,y:number)
    {
        //if (y<0) {y=y+box.height()}
        //if (y>box.height()) { y=y-box.height()}
        return y
    }


    update()
    { 
       this.pixellist.clear();
       this.radius=this.radius+this.speed
       this.energy=0
       this.colorindex=(this.colorindex+1)%(this.colorpalette.length-1)
       for (let i=0;i<this.points.length;i++)
       {
           if (this.points[i]!=undefined)
           {
                this.points[i].energy   = Math.max(0,this.points[i].energy-this.particleTTL)
                this.points[i].y        = this.remapY(this.box,Math.cos(i)*(this.radius/2)+this.centerY)
                this.points[i].x        = this.remapX(this.box,Math.sin(i)*(this.radius/2)+this.centerX)
                let color               = this.colorpalette[this.colorindex].copy()
                color.a                 = Math.min(1,this.points[i].energy)
                this.pixellist.add( new Pixel(this.points[i].x,this.points[i].y,color ))
                this.energy=this.energy+this.points[i].energy
           }
       }
       if (this.energy<0.5)
       {
          this.pixellist.clear();
          this.centerX=random(0,this.maxWidth)
          this.centerY=random(0,this.maxHeight)
          this.generate(this.particlecount)
          this.radius=random(0,2)
       }
    }
}

export default class Fireworks extends Animator {

    static category = "Basic"
    static title = "Fireworks"
    static description = "vuurpijlen"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        const fwControl             = controls.group("Fireworks",true)
        const intervalControl       = fwControl.value("Animation interval", 1, 1, 10, 1)
        const particlesControl      = fwControl.value("Particles", 1, 1, 200, 1)
        const explosionsControl     = fwControl.value("Simultanious explosions", 1, 1, 32, 1)
        const speedRangeControl     = fwControl.value("Speed range",0.5,0,1,0.1,true)
        const particleTTLControl    = fwControl.value("Particle decay",0.03,0.001,0.1,0.001,true)
        const colorPaletteControl   = patternSelect(fwControl, 'Color Palette', 'DimmedReinbow')
        const cloudlist=new PixelList()
        box.add(cloudlist)
        let clouds=[]
        for (let i=0;i<explosionsControl.value;i++)
        {
                clouds[i]=new CloudGeometry(box,colorPaletteControl,speedRangeControl.value,particleTTLControl.value)
                clouds[i].generate(particlesControl.value)
        }   
      
        

       scheduler.intervalControlled(intervalControl, (frameNr) => {
           for (let i=0;i<explosionsControl.value;i++)
           {
              if (clouds[i]!=undefined)
              {
                    clouds[i].update();
                    if (clouds[i].pixellist!=undefined)
                    {
                        cloudlist.add(clouds[i].pixellist)
                    }
              }
           }   
        })


       
    }
}
