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




export class XYCoordinate {
    x:number
    y:number
    constructor(x:number,y:number)
    {
        this.x=x
        this.y=y
    }
}

export class Grasspriet {
    groundX:number
    height:number
    colorGround:Color
    colorTop:Color

    constructor(x:number,height:number,colorGround:Color,colorTop:Color)
    {
        this.groundX=x
        this.height=height
        this.colorGround=colorGround
        this.colorTop=colorTop
    }
}

export class Grass {

    bbox_ul:XYCoordinate
    bbox_lr:XYCoordinate
    wind:number
    density:number
    height:number
    pixellist:PixelList
    sprietjes=[]

    constructor(x1:number,y1:number,x2:number,y2:number,height:number,wind:number,density:number)
    {
        this.pixellist=new PixelList()
        this.bbox_ul=new XYCoordinate(x1,y1)
        this.bbox_lr=new XYCoordinate(x2,y2)
        this.wind=wind
        this.height=height
        this.density=density
        this.sprietjes=[]
        let grassprietCount=(x2-x1)*density
        for (let s=0;s<grassprietCount;s++)
        {
            let greeniness=random(100,255)
            let newGrassprietje=new Grasspriet(random(x1,x2),random(1,this.height),new Color(0,greeniness,0,0.8),new Color(0,greeniness-100,0,0.1))
            this.sprietjes.push(newGrassprietje)
            //console.log(newGrassprietje)
        }
        
    }

    render(box,counter,wind)
    {
        //console.log("grass render")
        let pl=new PixelList()
        let bottomY=this.bbox_lr.y
        for (let s=0;s<this.sprietjes.length;s++)
        {
            this.wind=Math.abs(wind*Math.abs(Math.sin(s+(counter/10)))%(this.bbox_lr.x-this.bbox_ul.x))
            pl.add(new DrawLine(this.sprietjes[s].groundX+this.wind,bottomY-this.sprietjes[s].height,this.sprietjes[s].groundX,bottomY,this.sprietjes[s].colorTop,this.sprietjes[s].colorGround))
        }
        return pl
    }
}



export class Cloud {
    centerX:number
    bottomY:number
    height:number
    width:number
    colorBottom:Color
    colorTop:Color
    heightOffset:number
    pixellist:PixelList

    constructor(centerX:number,bottomY:number, width:number, height:number, colorBottom:Color,colorTop:Color)
    {
        this.centerX=centerX
        this.bottomY=bottomY
        this.height=height
        this.width=width
        this.colorBottom=colorBottom
        this.colorTop=colorTop
        this.pixellist=new PixelList()
        this.heightOffset=0
            for (let x=0;x<this.width;x++)
            {
                let yTop=Math.abs((Math.sin((x*10)/(this.width+1))+1)*(this.bottomY/2))
                let yBottom=Math.abs((Math.cos((x*10)/(this.width+1))+1)*(this.bottomY/2))+this.bottomY
                this.pixellist.add(new DrawLine(x,yTop,x,yBottom,this.colorTop,this.colorBottom))
                this.pixellist.add(new DrawLine(width-x,yTop,width-x,yBottom,this.colorTop,this.colorBottom))
            }
        this.pixellist=this.pixellist.prune()
    }

}


export class SunMoon {
    x:number
    y:number
    radius:number
    color:Color
    intensity:number
   

    constructor(x,y,radius,color,intensity)
    {
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
        this.intensity=intensity
    
    }

    render(box)
    {
        let  pixellist:PixelList=new PixelList()
        pixellist.clear()
        for (let r=1;r<this.radius;r++)
        {
            for (let i=0;i<Math.pow(r+2,3);i++)
            {
                let x=Math.sin((r+i)/15.0)*(r/2)
                let y=Math.cos((r+i)/15.0)*(r/2)
                pixellist.add(new Pixel(this.x+x,this.y+y,this.color))


            }
        }
        return pixellist
    }
}

export class Sky {

    bbox_ul:XYCoordinate
    bbox_lr:XYCoordinate
    wind:number
    width:number
    density:number
    height:number
  
    cloudDensity:number
    humidity:number
    cloudTemperature:number
    groundTemperature:number
    clouds=[]
    neerslag=[]
    sunMoon:SunMoon
    

    constructor(x1:number,y1:number,x2:number,y2:number,width:number,height:number,wind:number,cloudDensity:number,airTemperature:number,groundTemperature:number,humidity:number)
    {
      
        this.bbox_ul=new XYCoordinate(x1,y1)
        this.bbox_lr=new XYCoordinate(x2,y2)
        this.wind=wind
        this.width=width
        this.height=height
        this.density=cloudDensity
        this.clouds=[]
        this.neerslag=[]
        this.sunMoon=new SunMoon(8,4,6,new Color(255,255,0,1),1)
        let cloudCount=this.density*10
        for (let s=0;s<cloudCount;s++)
        {
            let cloudiness=random(100,255)
            let xRnd=random(0,100)
            let bottomY=height

            for (let t=0;t<this.density;t++)
            {
                let newCloud=new Cloud(xRnd+(8+this.width*t),this.height,xRnd+(8+this.width*t),this.height,new Color(cloudiness,cloudiness,cloudiness,0.1),new Color(cloudiness,cloudiness,cloudiness,0.0))
                this.clouds.push(newCloud)
            }
            
        }
        
    }

    render(box, counter,wind)
    {
        let pl=new PixelList()
        pl.add(this.sunMoon.render(box))
        let bottomY=this.bbox_lr.y
        //console.log(this.clouds)
        for (let s=0;s<this.clouds.length;s++)
        {
            this.clouds[s].centerX=Math.abs((this.clouds[s].centerX+this.wind/100)%(box.width()))
            let cloudp:PixelList=this.clouds[s].pixellist
            cloudp.move(this.wind+(wind/70),0)
            cloudp.wrapX(box)
            pl.add(cloudp)
        }
       
        return pl
    }
}


export default class Weiland extends Animator {
    static category = "Misc"
    static title = "Weiland"
    static description = "blabla"

   


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, x = 0, y = 0) {

        const meteoControls=controls.group("Meteo")
        const meteoAirTemperature=meteoControls.value('Sky temperature',10,-30,30,1,true)
        const meteoGroundTemperature=meteoControls.value('Ground temperature',10,-30,30,1,true)
        const meteoWindSpeed=meteoControls.value("Wind", 2, -7, 7, 1,false)
      
        const grassControls=controls.group("Grass")
        const grassIntervalControl = grassControls.value("Clock interval", 1, 1, 10, 0.1,true)
        const grassHeightControl = grassControls.value("Grass height", 3, 1, 64, 1,true)
        const grassDensityControl = grassControls.value("Grass Density", 0.8, 0, 10, 0.1,true)
      
        const cloudControls=controls.group("Clouds")
        const cloudHeightControl = cloudControls.value("Cloud height", 3, 1, 64, 1,true)
        const cloudWidthControl = cloudControls.value("Cloud width", 8, 1, 16, 1,true)
        const cloudDensityControl = cloudControls.value("Cloud Density", 1, 0, 2, 0.1,true)

        const rainControls=controls.group("Rain/Snow")
        const rainDensityControl = cloudControls.value("Rain Density", 1, 0, 10, 0.1,true)

        let framebuffer:PixelList=new PixelList()
        let bgbuffer:PixelList=new PixelList()
        for (let i=0;i<box.width();i++)
        {
            bgbuffer.add(new DrawLine(i,0,i,box.height(),new Color(0,0,64,1),new Color(0,0,255,0.5)))
        }

        box.add(bgbuffer)
        box.add(framebuffer)
       

        let gras=new Grass(0,0,box.width(),box.height(),grassHeightControl.value,meteoWindSpeed.value,grassDensityControl.value)
        let sky=new Sky(0,0,box.width(),box.height(),cloudWidthControl.value,cloudHeightControl.value,0,cloudDensityControl.value,10,20,50)
        console.log("tma initalized")

        scheduler.intervalControlled(grassIntervalControl, (frameNr) => {
            framebuffer.clear()
            framebuffer.add(sky.render(box,frameNr,meteoWindSpeed.value))
            framebuffer.add(gras.render(box,frameNr,meteoWindSpeed.value))
        })


    }
}
