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


function hourToLightFactor(hour:number)
{
   
    let lookup=[]
    lookup[0]={ 'light': 0.0, x:0/24 }  
    lookup[1]={ 'light': 0.0, x:1/24 }
    lookup[2]={ 'light': 0.0, x:2/24  }
    lookup[3]={ 'light': 0.0 , x:3/24 }
    lookup[4]={ 'light': 0.1, x:4/24  }
    lookup[5]={ 'light': 0.2, x:5/24  }
    lookup[6]={ 'light': 0.3 , x:6/24 }
    lookup[7]={ 'light': 0.4, x:7/24  }
    lookup[8]={ 'light': 0.6 , x:8/24 }
    lookup[9]={ 'light': 0.8, x:9/24  }
    lookup[10]={ 'light': 0.9 , x:10/24 }
    lookup[11]={ 'light': 1.0 , x:11/24 }
    lookup[12]={ 'light': 1.0 , x:12/24 }
    lookup[13]={ 'light': 1.0 , x:13/24 }
    lookup[14]={ 'light': 1.0 , x:14/24 }
    lookup[15]={ 'light': 1.0 , x:15/24 }
    lookup[16]={ 'light': 1.0 , x:16/24 }
    lookup[17]={ 'light': 0.9 , x:17/24 }
    lookup[18]={ 'light': 0.8 , x:18/24 }
    lookup[19]={ 'light': 0.6, x:19/24  }
    lookup[20]={ 'light': 0.4, x:20/24  }
    lookup[21]={ 'light': 0.2, x:21/24  }
    lookup[22]={ 'light': 0.0 , x:22/24 }
    lookup[23]={ 'light': 0.0 , x:23/24 }
    lookup[24]={ 'light': 0.0 , x:24/24 }
   
    let inthour=parseInt(hour.toString())%24
    let intnext=(parseInt(hour.toString())+1)%24
    let fraction=(hour-inthour)*100
    let antifraction=100-fraction
    let hrVal=lookup[inthour]
    let hrVal2=lookup[intnext]
    let light=hrVal.light
    let x=(( (fraction*hrVal2.x) + (antifraction*hrVal.x)) /100)
    

    return {'light':light,x:x}
    //return hrVal
}

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
            let greeniness=random(128,255)
            let newGrassprietje=new Grasspriet(random(x1,x2),random(1,this.height),new Color(0,greeniness,0,1.0),new Color(0,greeniness-100,0,0.1))
            this.sprietjes.push(newGrassprietje)
            //console.log(newGrassprietje)
        }
        
    }

    render(box,counter,hour, wind)
    {
        //console.log("grass render")
        let pl=new PixelList()
        let bottomY=this.bbox_lr.y
        for (let s=0;s<this.sprietjes.length;s++)
        {
            let timedata=hourToLightFactor(hour)
            let light=timedata.light
            let c1=this.sprietjes[s].colorTop.copy()
            let c2=this.sprietjes[s].colorGround.copy()
            c1.a=Math.max(0.0,light*c1.a)
            c2.a=Math.max(0.0,light*c2.a)
            this.wind=Math.abs(wind*Math.abs(Math.sin(s+(counter/10)))%(this.bbox_lr.x-this.bbox_ul.x))
            pl.add(new DrawLine(this.sprietjes[s].groundX+this.wind,bottomY-this.sprietjes[s].height,this.sprietjes[s].groundX,bottomY,c1,c2))
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
        //this.pixellist=this.pixellist.flatten()
       
    }

}


export class SunMoon {
    x:number
    y:number
    width:number
    height:number
    radius:number
    color:Color
    intensity:number
   

    constructor(x,y,width,height,radius,color,intensity)
    {
        this.x=x
        this.y=y
        this.width=width
        this.height=height
        this.radius=radius
        this.color=color
        this.intensity=intensity
    
    }

    render(box:PixelBox,hour:number)
    {
   
        let  pixellist=new PixelList()
        let hourdata=hourToLightFactor(hour)
        //console.log(hour)
        pixellist.add(new Pixel(random(0,box.width()), random(0,box.height()),new Color(32,32,64,1-hourdata.light)))
        this.x=((box.width())*(hourdata.x)*2)%box.width()
        this.y=(1-hourdata.light)*(box.height())+2
        //this.y=(1-sy)*(box.height())+2
        let moony=hourdata.light*(box.height())+2
        this.radius=Math.max(Math.min(this.height/4-(this.height/4-this.y/4),9),5)
        for (let r=1;r<this.radius;r++)
        {
            //sun
            for (let i=0;i<Math.pow(r+2,3);i++)
            {
                let color=this.color
                if ( (hour>6 && hour<8) || (hour>19 && hour<20))
                {
                    color=new Color(255,0,0,1)

                }
                let x=Math.sin((r+i)/15.0)*(r/2)
                let y=Math.cos((r+i)/15.0)*(r/2)
                pixellist.add(new Pixel(this.x+x,this.y+y,color))
            }

           //moon
                for (let j=0;j<Math.pow(r+2,3);j++)
                {
                    let x=Math.sin((r+j)/15.0)*((r-2)/2)
                    let y=Math.cos((r+j)/15.0)*((r-2)/2)
                   
                        pixellist.add(new Pixel(this.x+3+x,moony+y,new Color(64,64,64,0.7)))

                   
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
        let date=new Date()
        let moonX=8
        this.sunMoon=new SunMoon(moonX,4,6,width,height,new Color(255,255,0,1),1)
        let cloudCount=this.density*10
       
            let cloudiness=random(100,255)
            let xRnd=random(0,100)
            let bottomY=height

            for (let t=0;t<this.density;t++)
            {
                let newCloud=new Cloud(xRnd+(8+this.width*t),this.height,xRnd+(8+this.width*t),this.height,new Color(cloudiness,cloudiness,cloudiness,0.3),new Color(cloudiness,cloudiness,cloudiness,0.1))
                this.clouds.push(newCloud)
            }
            
        
        
    }

    render(box, counter,hour, wind)
    {
        let pl=new PixelList()
        let bgbuffer:PixelList=new PixelList()
        let time=new Date()
        let lightdata=hourToLightFactor(hour)
     
        for (let i=0;i<box.width();i++)
        {
           let light=Math.max(0.1,lightdata.light)
           let color1=new Color(0,0,64,light)
           let color2=new Color(0,0,255,light)
           if (  (hour>20 && hour<22))
           {
               color1=new Color(64,0,0,light)
               color2=new Color(255,0,0,light)

           }
           bgbuffer.add(new DrawLine(i,0,i,box.height(),color1,color2))
        }

        pl.add(bgbuffer)

        pl.add(this.sunMoon.render(box,hour))

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
        const cloudDensityControl = cloudControls.value("Cloud Density", 1, 0, 10, 1,true)

        const rainControls=controls.group("Rain/Snow")
        const rainDensityControl = cloudControls.value("Rain Density", 1, 0, 10, 0.1,true)

        let framebuffer:PixelList=new PixelList()
        
        box.add(framebuffer)
       

        let gras=new Grass(0,0,box.width(),box.height(),grassHeightControl.value,meteoWindSpeed.value,grassDensityControl.value)
        let sky=new Sky(0,0,box.width(),box.height(),cloudWidthControl.value,cloudHeightControl.value,0,cloudDensityControl.value,10,20,50)
        console.log("tma initalized")

        scheduler.intervalControlled(grassIntervalControl, (frameNr) => {
            let time=new Date()
            let hour=(time.getSeconds()+(time.getMilliseconds()/1000))/2.5
            if (hour>24) { hour=hour-24}
            framebuffer.clear()
            framebuffer.add(sky.render(box,frameNr,hour, meteoWindSpeed.value))
            framebuffer.add(gras.render(box,frameNr,hour, meteoWindSpeed.value))
        })


    }
}
