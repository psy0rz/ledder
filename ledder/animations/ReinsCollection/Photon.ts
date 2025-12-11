import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import {random} from "../../utils.js"
import Animator from "../../Animator.js"
import DrawLine from "../../draw/DrawLine.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"
import { patternSelect } from "../../ColorPatterns.js"
import Marquee from "../Text/Marquee.js"
import Fire from "../Fires/Fire.js"

class PhotonPixel 
{
    pixel:Pixel
    mass:number
   
    constructor(pixel:Pixel)
    {
        this.pixel=pixel
        this.mass=1.0
    }

    render()
    {
        return this.pixel
    }
}

class PhotonStack
{
    x:number
    y:number
    stack:PhotonPixel[]

    constructor(x:number,y:number)
    {
        this.x=x
        this.y=y
        this.stack=[]
    }

    update()
    {
        //flatten stack (x/y position) by calculating replacement pixel.
        let red=0
        let green=0
        let blue=0
        let alpha=0
        let rSum=0
        let gSum=0
        let bSum=0
        let aSum=0
        let rMass=0
        let gMass=0
        let bMass=0
        let aMass=0
        if (this.stack.length>0)
        {
            for (let p=0;p<this.stack.length;p++)
            {
                rSum=rSum+this.stack[p].pixel.color.r*this.stack[p].mass
                rMass=rMass+this.stack[p].mass
                gSum=gSum+this.stack[p].pixel.color.g*this.stack[p].mass
                gMass=gMass+this.stack[p].mass
                bSum=bSum+this.stack[p].pixel.color.b*this.stack[p].mass
                bMass=bMass+this.stack[p].mass
                aSum=aSum+this.stack[p].pixel.color.a*this.stack[p].mass
                aMass=aMass+this.stack[p].mass
            }
            red=Math.round(rSum/rMass)
            green=Math.round(gSum/gMass)
            blue=Math.round(bSum/bMass)
            alpha=Math.min(0.8,aSum/aMass)
            this.stack=[]
            this.stack.push(new PhotonPixel(new Pixel(this.x,this.y,new Color(red,green,blue,alpha))))
        }
        
    }

    addPixel(pixel:Pixel)
    {
        this.stack.push(new PhotonPixel(pixel))
    }

    render()
    {
        if (this.stack.length === 0) return null;
        if (this.stack.length === 1) return this.stack[0].pixel;
        
        let pl = new PixelList();
        for (let p=0; p<this.stack.length; p++)
        {
            pl.add(this.stack[p].pixel);
        }
        return pl;
    }
}

class Photonmatrix
{
    width:number
    height:number
    photonStack: PhotonStack[]
    palette:Color[]
    magic:number
    magic2:number

    radius:number
    

    constructor(width:number,height:number)
    {
        this.width=width
        this.height=height
        this.photonStack=[]
        this.palette=[]
        this.magic=0
        this.magic2=0
        this.radius=0
        for (let y=0;y<height;y++)
        {
            for (let x=0;x<width;x++)
            {
                this.photonStack.push(new PhotonStack(x,y))
            }
        }
    }

    xyToIndex(x:number,y:number)
    {
        const intx = Math.floor(x);
        const inty = Math.floor(y);
        if (intx < 0 || intx >= this.width || inty < 0 || inty >= this.height) return -1;
        return (this.width * inty) + intx;
    }

    addPixelList(pixellist)
    {

    }

    addPixel(pixel:Pixel)
    {
        const index = this.xyToIndex(pixel.x, pixel.y);
        if (index >= 0) {
            this.photonStack[index].addPixel(pixel);
        }
    }

    update()
    {
        for (let s=0;s<this.photonStack.length;s++)
        {
            if (this.photonStack[s])
            {
                this.photonStack[s].update()
            }
        }
    }

 
    addRandomPhoton(colorPalette,colorindex,colorshift)
    {
      const centerX = this.width / 2;
      const centerY = this.height / 2;
      const radiusFactor = this.width / 720; // Pre-calculate 360/(360/width/2)
      
      for (let q=0; q<3; q++)
      {
        this.magic++;
        const magicOffset = this.magic / 60;
        
        for (let i=0; i<360; i++)
        {
                colorindex = (colorindex + colorshift) % colorPalette.length;
                const angle = (i + this.magic) / 60;
                const radius = i * radiusFactor;
                const x = Math.round(Math.sin(angle) * radius + centerX);
                const y = Math.round(Math.cos(angle) * radius + centerY);
                this.addPixel(new Pixel(x, y, colorPalette[colorindex]));
        }
      }
    }

    addRandomCircles(colorPalette, colorindex, colorshift)
    {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const paletteLen = colorPalette.length;
        
        for (let radius=0; radius<this.width; radius++)
        {
            for (let circle=0; circle<360; circle++)
            {
                colorindex = (colorindex + colorshift) % paletteLen;
                const angle = circle / 60;
                const x = Math.round(Math.sin(angle) * radius + centerX);
                const y = Math.round(Math.cos(angle) * radius + centerY);
                const color = colorPalette[colorindex];
                this.addPixel(new Pixel(x, y, new Color(color.r, color.g, color.b, 0.5)));
            }
        }
    }


    addRandomGrid(colorPalette, colorindex, colorshift)
    {
        //put random pixels at random positions (just for testing)
        for (let x=0; x<this.width;x++)
        {
            for (let y=0; y<this.height; y++)
            {
                colorindex=colorindex+colorshift
                colorindex=colorindex%colorPalette.length
                let color=colorPalette[colorindex].copy()
                color.a=0.5
                this.addPixel(new Pixel(x,y,colorPalette[colorindex].copy()))
            }
        }

        for (let y=0; y<this.height;y++)
        {
            for (let x=0; x<this.width; x++)
            {
                colorindex=colorindex+colorshift
                colorindex=colorindex%colorPalette.length
                let color=colorPalette[colorindex].copy()
                color.a=0.5
                this.addPixel(new Pixel(x,y,colorPalette[colorindex].copy()))
            }
        }   
    }

    addClouds(colorPalette, colorindex, colorshift)
    {
            this.magic = (this.magic + 1) % this.width;
            const paletteLen = colorPalette.length;
            const invPI = 1 / Math.PI;
            
            for (let x=0; x<this.width; x++)
            {
                colorindex = (colorindex + colorshift) % paletteLen;
                const y = Math.random() * this.height;
                const xx = (x + this.magic) % this.width;
                const color = colorPalette[(colorindex + x) % paletteLen];
                const alpha = (Math.sin((x + y) * invPI) + 1) * 0.5;
                this.addPixel(new Pixel(xx, y, new Color(color.r, color.g, color.b, alpha)));
            }
    }

    julia(c,px:number,py:number,width:number,height:number,zoom:number)
    {
        //calculate the initial real and imaginary part of z, based on the pixel location and zoom and position values
         let newRe = 1.5 * (px - width / 2) / (0.5 * zoom * width) ;
         let newIm = (py - height / 2) / (0.5 * zoom * height);
         let oldRe=0;
         let oldIm=0
         //i will represent the number of iterations
         let n=0
         //start the iteration process
         do
         {
             //remember value of previous iteration
             oldRe = newRe;
             oldIm = newIm;
             //the actual iteration, the real and imaginary part are calculated
             newRe = oldRe * oldRe - oldIm * oldIm + c.cx
             newIm = 2 * oldRe * oldIm + c.cy
             //if the point is outside the circle with radius 2: stop
             if((newRe * newRe + newIm * newIm) > 4) break;
             n++
         } while (n<500)
         return n
    }

    addJulia(colorpalette,colorindex,colorshift)
    {
        this.magic=Math.max(2,this.magic)
        let hotspotsel=this.magic2
        this.magic=Math.max(1,this.magic*1.001)
        let hotspots=[
            { cx:-0.74800888462543, cy:0.058641210013121,  maxz:2.80},
            { cx:0.31997989023329, cy:0.037739114652372,   maxz:8},
            { cx:0.30532223412791, cy:0.028030387481731,   maxz:8.05},
            { cx:-1.4183762254903, cy:-0.00058322469430364, maxz:9}
        ]
        let c=hotspots[this.magic2]
        let zoom=this.magic
        if (zoom>Math.pow(10,c.maxz-1))
        {
            zoom=1
            this.magic=1
            this.magic2++
            if (this.magic2>hotspots.length-1) {  this.magic2=0}
        }
       
        const paletteLen = colorpalette.length;
        for (let x=0; x<this.width; x++){
            for (let y=0; y<this.height; y++){
                const pixelcolor = this.julia(c, x, y, this.width, this.height, zoom);
                if (pixelcolor > 0)
                {
                    const color = colorpalette[pixelcolor % paletteLen];
                    const c = new Color(color.r, color.g, color.b, 0.7);
                    this.addPixel(new Pixel(x, y, c));
                }
            }
        }
    }

    addStripes(colorPalette, colorindex, colorshift)
    {
        
            this.magic=this.magic+Math.random()*8
            this.magic=this.magic%360
            let cx=(this.width/2)
            let cy=(this.height/2)
            let rx=cx+(Math.sin(this.magic/60)*(this.width/2))
            let ry=cy+(Math.cos(this.magic/60)*(this.width/2))
            let distance=Math.sqrt(Math.pow(cx-rx,2)+(Math.pow(cy-ry,2)))
            let xd=(rx-cx)/distance
            let yd=(ry-cy)/distance

            let x=cx
            let y=cy
                
            for (let ll=0;ll<distance;ll++)
            {
                colorindex=colorindex+colorshift
                colorindex=colorindex%colorPalette.length
                let color=colorPalette[(colorindex)%colorPalette.length]
                let ccolor=color.copy()
                ccolor.a= Math.max(0,Math.min(1,ccolor.a/((ll+1)/colorPalette.length)))
            
                x=(x+xd)
                y=(y+yd)
                this.addPixel(new Pixel(Math.round(x),Math.round(y),ccolor))
            }
            
        
    }

    shift(pixelcount)
    {

    }




    render()
    {
        const pl = new PixelList();
        for (let p=0; p<this.photonStack.length; p++)
        {
            const rendered = this.photonStack[p].render();
            if (rendered) {
                pl.add(rendered);
            }
        }
        return pl;
    }
   
}

export default class Photonmatrixtest extends Animator {

    static category = "Basic"
    static title = "Photon"
    static description = "Photon test"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        let choices=[]
        choices.push({id:1, name:"Photon"})
        choices.push({id:2, name:"SinCos"})
        choices.push({id:3, name:"XY"})
        choices.push({id:4, name:"Clouds"})
        choices.push({id:5, name:"Stripes"})
        choices.push({id:6, name:"Julia"})

        const animatorControl               = controls.group("Photon",true)
        const colorshiftControl             = animatorControl.value("Color shift", 0, 0 ,32, 1)
        const intervalControl               = animatorControl.value("Animation interval", 1, 1, 10, 1)
       
        const patternControl                = animatorControl.select("Algoritm","Photon",choices,true)
        const colorPaletteControl           = patternSelect(animatorControl, 'Color Palette', 'DimmedReinbow')
        const fireEnabledControl            = animatorControl.switch("Fire enable",false,true)
        const marqueeEnabledControl          = animatorControl.switch("Marquee enable",false,true)
        const fireControl                   = animatorControl.group("Fire")
        const marqueeControl                = animatorControl.group("Marquee")
       
       
       
       
        let photon=new Photonmatrix(box.width(),box.height())

        if (fireEnabledControl.enabled)
        {
            let fire=new Fire()
            fire.run(box,scheduler,fireControl)
        }
        
        let pixellist=new PixelList()
        box.add(pixellist)

        
        if (marqueeEnabledControl.enabled)
        {
            let marquee=new Marquee()
            marquee.run(box,scheduler,marqueeControl)
        }
      
        scheduler.intervalControlled(intervalControl, (frameNr) => {
            pixellist.clear()
            switch (patternControl.selected)
            {
               
               
                
                case "Photon":  
                case "1":       photon.addRandomPhoton(colorPaletteControl,frameNr%colorPaletteControl.length,colorshiftControl.value); break;
                case "SinCos": 
                case "2":       photon.addRandomCircles(colorPaletteControl,frameNr%colorPaletteControl.length,colorshiftControl.value); break
                case "XY":   
                case "3":       photon.addRandomGrid(colorPaletteControl,frameNr%colorPaletteControl.length,colorshiftControl.value); break
                case "Clouds":   
                case "4":       photon.addClouds(colorPaletteControl,frameNr%colorPaletteControl.length,colorshiftControl.value); break
                case "Stripes":   
                case "5":       photon.addStripes(colorPaletteControl,frameNr%colorPaletteControl.length,colorshiftControl.value); break
                case "Julia":   
                case "6":       photon.addJulia(colorPaletteControl,frameNr%colorPaletteControl.length,colorshiftControl.value); break
            }
            photon.update()
            let newPixelData:PixelList=photon.render()
            //console.log(newPixelData)
            pixellist.add(newPixelData)
        })


       
    }
}
