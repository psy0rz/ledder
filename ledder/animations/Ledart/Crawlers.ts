import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import {random} from "../../utils.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"
import { patternSelect } from "../../ColorPatterns.js"


class Xyc {
    x:number
    y:number
    color:Color
    ttl:number=100
    pixel:Pixel
    targetX:number=0
    targetY:number=0
   
     constructor(x:number,y:number,color:Color,ttl:number=100,targetX:number,targetY:number)
     {
        this.x=x; 
        this.y=y; 
      
        this.color=color
        this.ttl=ttl;
        this.pixel=new Pixel(x,y,color)
        this.targetX=targetX
        this.targetY=targetY
     }

     update()
     {
    
        if (this.ttl>0)
        {
            this.ttl--
            this.x=((this.x*30.0)+(this.targetX*1.0))/31.0
            this.y=((this.y*30.0)+(this.targetY*1.0))/31.0
            let mycolor=this.color.copy()
            mycolor.a=(this.ttl/100)
            this.color=mycolor
            this.pixel=new Pixel(this.x,this.y,this.color)
        }
     }
}



class CrawlerGeometry{
    x:number
    y:number
    colors=[]
    colorindex:number
    tail=[]
    pixellist:PixelList
    ttl=0
    index=0

    constructor(x:number, y:number, i:number, colors, colorindex:number,ttl:number) {
        this.x = x
        this.y = y
        this.index=i
        this.colors=colors
        this.colorindex=(colorindex+(i))%(colors.length-1)
        this.tail.push(new Xyc(x,y+i,colors[this.colorindex],ttl,x,y))
        this.pixellist = new PixelList();
        this.ttl=ttl
        //this.update()

    }



    update(box: PixelBox, targetX:number,targetY:number)
    {
      
       this.pixellist.clear();
       this.colorindex=(this.colorindex+1)%(this.colors.length-1)
     
       if (this.y<0) { this.y=box.height() }
       if (this.y>box.height()) { this.y=0}
       if (this.x<0) { this.x=box.width()}
       if (this.x>box.width()){ this.x=0}
       //this.x=box.width()/2 //random(0,box.width())
       //this.y=box.height()/2 //random(0,box.height())
       this.colorindex=(this.colorindex+1)%(this.colors.length-1)
       this.tail.push(new Xyc(this.x,this.y,this.colors[this.colorindex],this.ttl,targetX,targetY))
      
       for (let i=0;i<this.tail.length;i++)
       {
            if (this.tail[i]!=undefined && this.tail[i].ttl>0)
            {
              
                this.tail[i].update()
                this.pixellist.add(this.tail[i].pixel) 
            }
            else
            {
                delete this.tail[i]
            }
       }
    }
}

export default class Snow extends Animator {

    static category = "Basic"
    static title = "Crawlers"
    static description = "xmas"


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        const crawlerControl=controls.group("Crawlers",true)
        const intervalControl = crawlerControl.value("Animation interval", 1, 1, 10, 0.1)
        const crawlerPopulationControl    = crawlerControl.value("Number of crawlers", 1, 1, 100, 1, true)
        const crawlerTTLControl    = crawlerControl.value("Crawlers time to live", 10, 1, 100, 1, true)
        const crawlerFrequencyControl    = crawlerControl.value("Target Frequency", 10, 1, 1000, 1, true)
        const colors = patternSelect(controls, 'Color Palette', 'DimmedReinbow')
        const crawlerlist=new PixelList()
        box.add(crawlerlist)
        
        //create crawlers
        let crawlers=[]
        for (let i=0; i<crawlerPopulationControl.value; i++) {
            let colorindex=random(0,colors.length-1)
            const x = box.middleX()
            const y = box.middleY()
            crawlers.push(new CrawlerGeometry(x,y,i,colors,colorindex,crawlerTTLControl.value))
            
        }

       scheduler.intervalControlled(intervalControl, (frameNr) => {
            crawlerlist.clear()
            
            for (let i=0; i<crawlers.length;i++)
            {
                let targetY=(Math.sin((frameNr+(i*121.123))/box.width())*box.middleY()+box.middleY())%box.height()
                let targetX=(Math.cos((frameNr+(i*121.123))/box.width())*box.middleX()+box.middleX())%box.width()
                crawlers[i].x=box.width()/2
                crawlers[i].y=box.height()/2
                let crawler=crawlers[i]
                crawlerlist.add(crawler.pixellist)
                crawlerlist.add(new Pixel(targetX,targetY,new Color(0,0,0,0.6)))
                crawlers[i].update(box,targetX,targetY)
            }
        })


       
    }
}
