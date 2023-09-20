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
  

    constructor(x:number, y:number,maxWidth:number,maxHeight:number,colorPalette) {
        this.centerX = x
        this.centerY = y
        this.pixellist = new PixelList();
        this.points=[]
        this.maxHeight=maxHeight
        this.maxWidth=maxWidth
        this.radius=1
        this.energy=0
        this.particlecount=0
        this.colorpalette=colorPalette
        this.colorindex=random(0,colorPalette.length)
    }

    generate(i:number)
    {
        this.particlecount=i
        this.points=[]
        this.speed=random(0,10)
        for (let l=0;l<i;l++)
        {
            let x=this.centerX
            let y=this.centerY
            this.points.push({x:x,y:y,i:1,type:random(0,3),energy:random(0.2,1.0) })
        }
        //console.log(this.points)
    }



    update()
    { 
      this.pixellist.clear();
      this.radius=this.radius+(this.speed/10)
        
        this.energy=0
        this.colorindex=this.colorindex+10
        this.colorindex=this.colorindex%(this.colorpalette.length-1)
       for (let i=0;i<this.points.length;i++)
       {
          
            this.points[i].energy=this.points[i].energy-0.03
            this.points[i].y=Math.cos(i)*(this.radius/2)+this.centerY
            this.points[i].x=Math.sin(i)*(this.radius/2)+this.centerX
           
           
            
            this.points[i].y= this.points[i].y +random(0,1)
            this.points[i].x=this.points[i].x+random(0,1)-1
           
          
           
           let color=this.colorpalette[this.colorindex].copy()
           color.a=Math.min(this.points[i].energy,0.7)
         
           this.pixellist.add( new Pixel(this.points[i].x,this.points[i].y,color ))
           this.energy=this.energy+this.points[i].energy
       }
       if (this.energy<1)
       {
        this.pixellist.clear();
          this.centerX=random(0,this.maxWidth)
          this.centerY=random(0,this.maxHeight)
          this.generate(this.particlecount)
          this.radius=random(1,4)
          
       }
    }
}

export default class Fireworks extends Animator {

    static category = "Basic"
    static title = "Fireworks"
    static description = "vuurdingpijlenzonderpijl"


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        const fwControl=controls.group("Fireworks",true)
        const intervalControl = fwControl.value("Animation interval", 1, 1, 10, 1)
        const particlesControl= fwControl.value("Particles", 1, 1, 100, 1)
        const explosionsControl= fwControl.value("Simultanious explosion", 1, 1, 100, 1)
        const colorPaletteControl     = patternSelect(fwControl, 'Color Palette', 'DimmedReinbow')
        const cloudlist=new PixelList()
        box.add(cloudlist)
        let clouds=[]
        for (let i=0;i<explosionsControl.value;i++)
        {
            clouds[i]=new CloudGeometry(box.width()/2,box.height()/2,box.width(),box.height(),colorPaletteControl)
            clouds[i].generate(particlesControl.value)
        }   
        

       scheduler.intervalControlled(intervalControl, (frameNr) => {

           //cloudlist.clear()
           for (let i=0;i<explosionsControl.value;i++)
           {
            clouds[i].update();
            cloudlist.add(clouds[i].pixellist)
           }   
            
        })


       
    }
}
