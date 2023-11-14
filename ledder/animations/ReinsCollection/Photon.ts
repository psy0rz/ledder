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
            alpha=Math.round(aSum/aMass)
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
        let pl=new PixelList()
        if (this.stack.length>0)
        {
            for (let p=0;p<this.stack.length;p++)
            {
                pl.add(this.stack[p].render())
                //console.log(this.stack[p].pixel.color)
            }
        }
        return pl
    }
}

class Photonmatrix
{
    width:number
    height:number
    photonStack: PhotonStack[]
    palette:Color[]
    

    constructor(width:number,height:number)
    {
        this.width=width
        this.height=height
        this.photonStack=[]
        this.palette=[]
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
        let intx=Math.round(x)
        let inty=Math.round(y)
        let index=0
        if (intx>=0 && intx<=this.width && inty>=0 && inty<=this.height)
        {
            index=(this.width * inty) + intx 
        }
        //console.log(intx,inty,this.width,this.height, this.width*this.height,index)
        return index
    }

    addPixelList(pixellist)
    {

    }

    addPixel(pixel:Pixel)
    {
        let index=this.xyToIndex(pixel.x,pixel.y)
        if (this.photonStack[index])
        {
            this.photonStack[index].addPixel(pixel)
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


    addRandomPixels(colorPalette, colorindex, colorshift)
    {
        let d=new Date()
     
        //put random pixels at random positions (just for testing)
        for (let radius=0; radius<this.width;radius++)
        {
            for (let circle=0; circle<360; circle++)
            {
                colorindex=colorindex+colorshift
                colorindex=colorindex%colorPalette.length
                let x=Math.round(Math.sin(circle/60)*(radius) +(this.width/2 ))
                let y=Math.round(Math.cos(circle/60)*(radius) + (this.height/2))
                this.addPixel(new Pixel(x,y,colorPalette[colorindex]))
            }
        }
    }

    render()
    {
        let pl=new PixelList()
        for (let p=0;p<this.photonStack.length;p++)
        {
            if (this.photonStack[p])
            {
                pl.add(this.photonStack[p].render())
            }
        }
        return pl
    }
   
}

export default class Photonmatrixtest extends Animator {

    static category = "Basic"
    static title = "Photon"
    static description = "Photon test"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        const animatorControl             = controls.group("Photon",true)
        const colorshiftControl             = animatorControl.value("Color shift", 1, 1, 32, 1)
        const intervalControl             = animatorControl.value("Animation interval", 1, 1, 10, 1)
        const colorPaletteControl   = patternSelect(animatorControl, 'Color Palette', 'DimmedReinbow')
        let photon=new Photonmatrix(box.width(),box.height())
        let pixellist=new PixelList()
        box.add(pixellist)

      
        scheduler.intervalControlled(intervalControl, (frameNr) => {
            pixellist.clear()
           
                photon.addRandomPixels(colorPaletteControl,frameNr%colorPaletteControl.length,colorshiftControl.value)
           
            photon.update()
            let newPixelData:PixelList=photon.render()
            //console.log(newPixelData)
            pixellist.add(newPixelData)
        })


       
    }
}
