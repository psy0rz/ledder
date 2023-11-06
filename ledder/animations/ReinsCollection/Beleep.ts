import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import PixelList from "../../PixelList.js"
import Color from "../../Color.js"
import DrawCircle from "../../draw/DrawCircle.js"

export class BeleepParticle
{
    x:number
    y:number
    x2:number
    y2:number
    energy:number //speed
    mass:number
    type:number
    color:Color
    maxmass:number


    constructor(x,y,energy,mass,type,color)
    {
        this.x=x
        this.y=y
        this.x2=0
        this.y2=0
        this.energy=energy
        this.mass=mass
        this.type=type
        this.color=color
        this.maxmass=Math.min(8,Math.PI*energy)
    }

    attract(otherElem,status)
    {
        let master={x:this.x,y:this.y,energy:this.energy,mass:this.mass,type:this.type,color:this.color}
        let slave=otherElem
        if (this.mass<otherElem.mass)
        {
            slave={x:this.x,y:this.y,energy:this.energy,mass:this.mass,type:this.type,color:this.color}
            master=otherElem
        }
        let xdiff=(master.x-slave.x)*status
        let ydiff=(master.y-slave.y)*status

        if (this.mass<otherElem.mass)
        {
            this.x=master.x+xdiff
            this.y=master.y+ydiff
        }
        else
        {
            otherElem.x=master.x+xdiff
            otherElem.y=master.y+ydiff
        }


    
    }

    update()
    {
        if (this.mass<2) { 
            this.x=this.x+((Math.random()-0.5)/64)
            this.y=this.y+((Math.random()-0.5)/16)
            this.x=this.x+(0.01/this.mass)
        }
        let targetY=this.mass*4
        if (this.y>targetY){ this.y=this.y-0.01} else {this.y=this.y+0.01 }
        if (this.x<0){ this.x=this.x+64}
        if (this.x>64){ this.x=this.x-64}
        if (this.y<this.mass){ this.y=this.mass}
        if (this.y>16-this.mass){ this.y=16-this.mass}
    }

    render()
    {
        let pl=new PixelList()
        let px1=new Pixel(this.x,this.y,this.color)
        pl.add(px1)
        for (let radius=0;radius<this.mass;radius++)
        {   
            let color=this.color.copy()
            color.a=1-(radius/this.mass)
            pl.add(new DrawCircle(this.x,this.y,radius,color))
        }
        return pl
    }
}

export class Beleepuniverse
{
    width:number
    height:number
    matter


    constructor(width,height,particleCount)
    {
        this.width=width
        this.height=height
        this.matter=[]
        for (let p=0;p<particleCount;p++)
        {
            let x=Math.random()*width
            let y=Math.random()*height
            let energy=1
            let mass=1
            let type=p%3
            let typecolor=new Color(0,0,0,0)
            switch (type)
            {
                case 0: typecolor=new Color(255,0,0,0.5); break;
                case 1: typecolor=new Color(0,255,0,0.5); break;
                case 2: typecolor=new Color(0,0,255,0.5); break;
            }
            this.matter.push(new BeleepParticle(x,y,energy,mass,type,typecolor))
        }
    }


    filter()
    {
        let len=this.matter.length
        for (let o=0;o<len;o++)
        {
            let obj=this.matter[o]
            if (obj)
            {
                this.matter.push(new BeleepParticle(obj.x,obj.y,obj.energy,obj.mass,obj.type,obj.color))
            }
        }
        this.matter.splice(0,len)

    }
    colorMix(c1,c2,weight1,weight2)
    {
        let factor=0.5
        let f=Math.min(weight1,weight2)/Math.max(weight1,weight2)
        if (weight1>weight2) { factor=1-f } else { factor=f}
        //factor is weight for c1. c2 uses 1-factor
        let r=(c1.r*factor)+(c2.r*(1-factor))
        let g=(c1.g*factor)+(c2.g*(1-factor))
        let b=(c1.b*factor)+(c2.b*(1-factor))
        return new Color(r,g,b,c1.a)
    }

    update(speed)
    {
       
        let distance=100
        for (let p=0;p<this.matter.length;p++)
        {
           
            this.matter[p].update()
            let randomElIndex=Math.round(Math.random()*this.matter.length-1)
            if ( this.matter[randomElIndex]  && randomElIndex!=p)
            {
               distance=Math.sqrt(Math.pow(this.matter[p].x-this.matter[randomElIndex].x,2)+Math.pow(this.matter[p].y-this.matter[randomElIndex].y,2))
               if (distance<this.matter[p].mass)
                {
                    if (this.matter[p].type==this.matter[randomElIndex].type)
                    {
                        //go away (same type)
                        this.matter[p].attract(this.matter[randomElIndex],1+speed)

                    }
                    else
                    {
                        //move to (diff type)
                        this.matter[p].attract(this.matter[randomElIndex],1-speed)
                    }

                
                }

        
               
                //console.log(distance);

                
            }
            if (distance<this.matter[p].mass && this.matter[randomElIndex] && this.matter[p].mass>=this.matter[randomElIndex].mass)
            {
                this.matter[p].energy+=(this.matter[randomElIndex].energy/10)
                this.matter[p].mass+=(this.matter[randomElIndex].mass/10)
                this.matter[randomElIndex].energy= this.matter[randomElIndex].energy*0.9
                this.matter[randomElIndex].mass= this.matter[randomElIndex].mass*0.9
               this.matter[p].color=this.colorMix(this.matter[p].color,this.matter[randomElIndex].color,this.matter[p].mass,this.matter[randomElIndex].mass)
            }

          

            if (this.matter[p].mass>this.matter[p].maxmass)
            {
                let r=Math.random()*10
                for (let s=0; s<this.matter[p].energy;s++)
                {
                    let splitfactor=Math.random()
                    let antisplitfactor=1-splitfactor
                    let energy=Number(this.matter[p].energy)
                    let mass=Number(this.matter[p].mass)
                    this.matter[p].energy=(energy*splitfactor)
                    this.matter[p].mass=(mass*splitfactor)
                    let o=this.matter[p]
                    let typecolor
                    switch (o.type)
                    {
                        case 0: typecolor=new Color(255,0,0,0.5); break;
                        case 1: typecolor=new Color(0,255,0,0.5); break;
                        case 2: typecolor=new Color(0,0,255,0.5); break;
                    }
                    this.matter.push(new BeleepParticle(o.x,o.y,energy*antisplitfactor,mass*antisplitfactor,o.type,typecolor))
                }
            }

            if (this.matter[p].mass<0.1)
            {
                this.matter[p]=undefined
            }
        
          
        }
        this.filter()
    }

    render()
    {
        let pl=new PixelList()
        for (let p=0;p<this.matter.length;p++)
        {
            if (this.matter[p])
            {
                pl.add(this.matter[p].render())
            }
        }
        return pl
    }
}

export default class Beleep extends Animator {
    static category = "Ledart"
    static title = "Beleep"
    static description = "led ventlator thingy"
    
   

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) 
    {
        const countControl = controls.value("particle count", 100, 1, 3000, 1,true)
        const radiusControl = controls.value("radius modifier", 1, 1, 100, 1,true)
        const speedControl = controls.value("speed", 0.01, 0, 1, 0.01,true)
        const intervalControl = controls.value("Fractal interval", 1, 1, 10, 0.1)
        let pixelList=new PixelList()
        box.add(pixelList)
       let universe=new Beleepuniverse(box.width(),box.height(),countControl.value)

       

        scheduler.intervalControlled(intervalControl, (frameNr) => {
         
           pixelList.clear()
           universe.update(speedControl.value);
           pixelList.add(universe.render())
           pixelList.wrapX(box)
           pixelList.wrapY(box)
           
    
        });
       
    }

    
}
