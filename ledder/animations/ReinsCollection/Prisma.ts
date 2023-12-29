import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import {random} from "../../utils.js"
import Animator from "../../Animator.js"
import DrawLine from "../../draw/DrawLine.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"
import DrawText from "../../draw/DrawText.js"

class XY 
{
    x:number
    y:number

    constructor(x:number,y:number)
    {
        this.x=x
        this.y=y
    }
}

class PrismaObj
{
    width:number
    height:number
    center:XY
    prismaPoints: XY[]
    prismaEntrance: XY
    prismaExit:XY
    pixellist:PixelList
    lightbeamStart:XY
    lightbeamEnd:XY

    constructor(width:number,height:number)
    {
        this.width=width
        this.height=height
        this.center=new XY(width/2,height/2)
        let xoffet=this.width/4
        this.prismaPoints=[]
        this.prismaPoints.push(new XY(this.center.x- xoffet,0))
        this.prismaPoints.push(new XY(this.center.x-this.height/2- xoffet,this.height-1))
        this.prismaPoints.push(new XY(this.center.x+this.height/2- xoffet,this.height-1))
        this.prismaEntrance=new XY(this.center.x-this.height/4- xoffet,this.height/2)
        this.prismaExit=new XY(this.center.x+this.height/4 -xoffet,this.height/2)
        this.lightbeamStart=new XY(0,this.height/2)
        this.lightbeamEnd=new XY(this.width,this.height/2)
        this.pixellist=new PixelList()
        this.renderPrisma()
    }

    renderPrisma()
    {
        let prismaColor=new Color(255,255,255,1)
        this.pixellist.add(new DrawLine(this.prismaPoints[0].x,this.prismaPoints[0].y,this.prismaPoints[1].x,this.prismaPoints[1].y,prismaColor,prismaColor ))
        this.pixellist.add(new DrawLine(this.prismaPoints[1].x,this.prismaPoints[1].y,this.prismaPoints[2].x,this.prismaPoints[2].y,prismaColor,prismaColor ))
        this.pixellist.add(new DrawLine(this.prismaPoints[2].x,this.prismaPoints[2].y,this.prismaPoints[0].x,this.prismaPoints[0].y,prismaColor,prismaColor ))

        this.pixellist.add(new DrawLine(this.prismaPoints[1].x,this.prismaPoints[1].y,this.prismaPoints[0].x,this.prismaPoints[0].y,prismaColor,prismaColor ))
        this.pixellist.add(new DrawLine(this.prismaPoints[2].x,this.prismaPoints[2].y,this.prismaPoints[1].x,this.prismaPoints[1].y,prismaColor,prismaColor ))
        this.pixellist.add(new DrawLine(this.prismaPoints[0].x,this.prismaPoints[0].y,this.prismaPoints[2].x,this.prismaPoints[2].y,prismaColor,prismaColor ))
    }

    getPrismaColors()
    {
        let colorData=[ 
            {name:'red',    r:255,  g:0,    b:0 },
            {name:'orange', r:255,  g:165,  b:0 },
            {name:'yellow', r:255,  g:255,  b:0 },
            {name:'green',  r:0,    g:25,   b:0 },
            {name:'blue',   r:0,    g:0,    b:255 },
            {name:'indigo', r:75,   g:0,    b:130 },
            {name:'violet', r:155,  g:38,   b:182 }
        ]

        let colors=[]
        for (let c=0;c<colorData.length;c++)
        {
            colors.push(new Color(colorData[c].r,colorData[c].g,colorData[c].b,0.4))
        }
        return colors
    }

    update(i)
    {
        this.lightbeamStart.y=Math.sin(i)*(this.height/2)+(this.height/2)
        this.lightbeamEnd.y=this.height-this.lightbeamStart.y
    }

    render(yDiffraction)
    {
        let colorAll=new Color(255,255,255,0.8)
        let colorFract=new Color(255,255,255,0.5)
        let colors=this.getPrismaColors()
        let pl=new PixelList()
        pl.add(this.pixellist)
        let beamsHeight=yDiffraction
        let beamHeight=beamsHeight/colors.length

        for (let c=0;c<colors.length;c++)
        {
            pl.add(new DrawLine(this.lightbeamStart.x,  this.lightbeamStart.y,    this.prismaEntrance.x,  this.prismaEntrance.y,    colorAll,   colorAll))
            pl.add(new DrawLine(this.prismaEntrance.x,  this.prismaEntrance.y,    this.prismaExit.x,      this.prismaExit.y,   colorAll,   colors[c]))
            pl.add(new DrawLine(this.prismaEntrance.x,  this.prismaEntrance.y,    this.prismaExit.x,      this.prismaExit.y+0.5,   colorAll,  colors[c]))
            pl.add(new DrawLine(this.prismaEntrance.x,  this.prismaEntrance.y,    this.prismaExit.x,      this.prismaExit.y-0.5,   colorAll,   colors[c]))
            pl.add(new DrawLine(this.prismaExit.x,      this.prismaExit.y,        this.lightbeamEnd.x,    this.lightbeamEnd.y+(c*beamHeight)-(beamsHeight/2),  colors[c],  colors[c]))
            pl.add(new DrawLine(this.prismaExit.x,      this.prismaExit.y,        this.lightbeamEnd.x,    this.lightbeamEnd.y+(c*beamHeight)-(beamsHeight/2)-0.5,  colors[c],  colors[c]))
            pl.add(new DrawLine(this.prismaExit.x,      this.prismaExit.y,        this.lightbeamEnd.x,    this.lightbeamEnd.y+(c*beamHeight)-(beamsHeight/2)+0.5,  colors[c],  colors[c]))
        }
        return pl
    }

   
}

export default class Prisma extends Animator {

    static category = "Basic"
    static title = "Prisma"
    static description = "Pink Floyd prisma"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        const animatorControl             = controls.group("Prisma",true)
        const intervalControl             = animatorControl.value("Animation interval", 1, 1, 10, 1)
        const yspeedControl             = animatorControl.value("Y delay", 100, 1, 100, 1,false)
        const yprismaControl             = animatorControl.value("Diffraction", 1, 1, box.height()*4, 1,false)
        const pl=new PixelList()
        box.add(pl)

        let prisma=new PrismaObj(box.width(),box.height())
        pl.add(prisma.pixellist) 
      
        scheduler.intervalControlled(intervalControl, (frameNr) => {
            pl.clear()
            prisma.update(frameNr/yspeedControl.value)
            pl.add(prisma.render(yprismaControl.value))
        })



       
    }
}
