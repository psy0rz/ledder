import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import {random} from "../../utils.js"
import FxMovie from "../../fx/FxMovie.js"
import FxRotate from "../../fx/FxRotate.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"

class SnowflakeGeometry{
    x:number
    y:number
    z:number //1=foreground (closest)  10=between   100=background(furthest)
    wind:number
    color:Color
    pixel:Pixel

    constructor(x:number, y:number, z:number, wind:number, color:Color) {
        this.x = x
        this.y = y
        this.z = z
        this.wind=wind+(random(0.0,2.0)-1)
        this.color = color
        this.pixel = new Pixel(x, y, color)
        //this.update()

    }



    update(box: PixelBox, wind:number,floorY=0)
    {
       this.x=this.x+(this.wind/this.z)/10
       this.y=this.y+(0.1/this.z)
       if (this.y>box.height()) { this.y=0; this.x=random(0,box.width()); this.z=random(1,10); this.wind=wind+(random(0.0,2.0)-1)}
       if (this.x<0) { this.x=box.width()}
       if (this.x>box.width()){ this.x=0}
       if (this.z==0) { this.z=1;}
       let tmpColor=this.color.copy()
       tmpColor.a=Math.max(0,tmpColor.a/(this.z))
       this.pixel=new Pixel(this.x,this.y,tmpColor)
     
    }
}

export default class Snow extends Animator {

    static category = "Basic"
    static title = "snow"
    static description = "xmas"


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const snowControl=controls.group("Snow",true)
        const intervalControl = snowControl.value("Animation interval", 1, 1, 10, 0.1)
        const snowFlakeControl        = snowControl.group("Snowflakes",true)
        const snowflakeColorControl   = snowFlakeControl.color("Snowflake color", 255, 255, 255, 0.7);
       
        const snowflakes=new PixelList()
        box.add(snowflakes)
        const snowGround=new PixelList()
        box.add(snowGround)

        const snowWeatherControl        = snowControl.group("Weather",true)
        const snowWeatherWindControl    = snowWeatherControl.value("Wind speed",0,-100,100,0.1)
        
        const snowflakeControl          = snowFlakeControl.value("Number of snowflakes", 10, 1, 1000, 1, true)
        const snowGroundControl         = snowControl.group("Snow ground layer",true)
        const snowGroundEnabled         = snowGroundControl.switch("Snow ground layer enabled",true,true)
        const snowGroundHeightControl   = snowGroundControl.value("Snow ground layer height", 3, 1, 64, 1);
       
        //SNOW GROUND LAYER
        if (snowGroundEnabled.enabled)
        {
            for (let i=0; i<box.xMax+1; i++)
            {   let mycolor=snowflakeColorControl.copy()
                let my2color=snowflakeColorControl.copy()
                let myalpha=my2color.a
                let myalpha2=my2color.a
                let snowHeight=Math.max(((Math.sin(i/4)+Math.cos(i/3)+1)*(snowGroundHeightControl.value))/3,0.1)
                for (let j=0;j<snowHeight;j++)
                {
                    myalpha=myalpha*(1-(j/(snowHeight+0.00001)))
                    snowGround.add(new Pixel(i,box.yMax-j,new Color(mycolor.r,mycolor.g,mycolor.b,myalpha/2)))
                }
            }
            //snowGround.move(-1,)
        }
       


        //SNOW FALLING
        let flakes=[]
        for (let i=0; i<snowflakeControl.value; i++) {
            const x = random(0, box.xMax)
            const y = random(0, box.yMax)
            const z = random(1, 10)
            const c= new Color(snowflakeColorControl.r,snowflakeColorControl.g,snowflakeColorControl.b,snowflakeColorControl.a)
            flakes.push(new SnowflakeGeometry(x,y,z,snowWeatherWindControl.value,c))
            
        }


       scheduler.intervalControlled(intervalControl, (frameNr) => {
       
            snowflakes.clear();
            for (let i=0; i<flakes.length;i++)
            {
                let snowflake=flakes[i]
                snowflakes.add(snowflake.pixel)
                flakes[i].update(box,snowWeatherWindControl.value,box.height()-snowGroundHeightControl.value)
            }
        })


       
    }
}
