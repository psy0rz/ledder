import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import PixelList from "../../PixelList.js"
import Color from "../../Color.js"
import DrawCircle from "../../draw/DrawCircle.js"
import { patternSelect } from "../../ColorPatterns.js"

export class BeleepParticle
{
    x:number
    y:number
    dx:number
    dy:number
    speed:number
    energy:number //speed
    mass:number
    type:number
    color:Color
    currentColor:number
    maxmass:number


    constructor(x,y,energy,mass,type,color,dx,dy,speed)
    {
        this.x=x
        this.y=y
        this.energy=energy
        this.mass=mass
        this.type=type
        this.color=color
        this.currentColor=0
        this.maxmass=Math.random()*20
        this.dx=dx
        this.dy=dy
        this.speed=speed
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
        let xdiff=(master.x-slave.x)*status*2
        let ydiff=(master.y-slave.y)*status*2

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

    update(i,childs,palette)
    {

        this.dx=Math.min(1.0,this.dx)
        this.dy=Math.min(1.0,this.dy)
        //if (this.energy>0) { this.mass=this.mass+0.001;   this.energy=this.energy-0.001;}
        if (this.mass<1) { 
            this.x=32+(Math.sin((i/100+this.x/100))*this.mass*8.0)
            this.y=8+(Math.cos((i/100+this.y/100))*this.mass*4.0)
            this.speed=this.speed*0.98
            this.mass=this.mass+0.001
        }
        else
        {
            if (this.speed>0.01)
            {
                this.x=this.x+(this.speed*this.dx)/this.mass
                this.y=this.y+(this.speed*this.dy)/this.mass
                this.speed=this.speed*0.999
            }
            else
            {
                this.x=this.x+(this.dx)/this.mass
                this.y=this.y+(this.dy)/this.mass
                this.speed=1/this.mass
            }
        }
            //let targetY=this.mass
            //this.x=this.x+(0.01/this.mass)
            //if (this.y>targetY){ this.y=this.y-0.01} else {this.y=this.y+0.01 }
        
        this.x=this.x%64
        this.y=this.y%16

        //wrapping
       // if (this.x<0){ this.x=this.x+64}
       // if (this.x>64){ this.x=this.x-64}
       // if (this.y<0){ this.y=this.y+16}
       // if (this.y>16){ this.y=this.y-16}

        //bouncing
        
        if (Math.round(this.x)<=0)
        {
            this.dx=Math.abs(this.x)
            this.dy=this.dy*-1
        }

        if (Math.round(this.x)>=63)
        {
            this.dx=-1*Math.abs(this.x)
            this.dy=this.dy*-1
        }

        if (this.y<=0)
        {
            this.dy=Math.abs(this.y)
            this.dx=this.dx*-1
        }

        if (this.y>=15)
        {
            this.dy=-1*Math.abs(this.y)
            this.dx=this.dx*-1
        }

        if (isNaN(this.x) || isNaN(this.y) || this.mass<0.5) 
        { 
            //this.currentColor=(this.currentColor+1)%(palette.length()-1)
            this.x=32 +Math.sin(i/100)*5
            this.y=8 + Math.cos(i/100)*5
            this.mass=1 //Math.random()*5
            this.energy=1
            this.speed=1 
            this.dx=Math.random()-0.5
            this.dy=Math.random()-0.5
            this.type=Math.round(Math.random()*2)
            //this.color=palette[this.currentColor]
            if (childs)
            {
                this.update(i,false,palette)
            }
        }
        
    }

    render()
    {
        let pl=new PixelList()
        //let c=this.color.copy()
        //c.a=Math.min(0.3,this.mass/5)
        let typecolor
        switch (this.type)
        {
            case 0: typecolor=new Color(255,0,0,0.3); break;
            case 1: typecolor=new Color(0,255,0,0.3); break;
            case 2: typecolor=new Color(0,0,255,0.3); break;
        }
        let px1=new Pixel(this.x,this.y,typecolor)
         if (this.mass<1) { px1=new Pixel(this.x,this.y,new Color(0,0,255,0.1)) }
        pl.add(px1)
        if (this.mass>1)
        {
            for (let radius=0;radius<this.mass;radius=radius+1)
            {   
                let color=this.color.copy()
                color.a=1-(((radius)/(this.mass)))
                pl.add(new DrawCircle(this.x,this.y,radius,color))
            }
        }
        return pl
    }
}

export class Beleepuniverse
{
    width:number
    height:number
    matter
    colorPalette: Color[]
    currentColorIndex:number


    constructor(width,height,particleCount,palette)
    {
        this.width=width
        this.height=height
        this.matter=[]
        this.currentColorIndex=0
        this.colorPalette=palette
        for (let p=0;p<particleCount;p++)
        {
            this.currentColorIndex=(  this.currentColorIndex+1)%(this.colorPalette.length-1)
            let x=width/2
            let y=height/2
            let energy=1
            let mass=1
            let type=p%3
            let typecolor=this.colorPalette[this.currentColorIndex]
            switch (type)
            {
                case 0: typecolor=new Color(255,0,0,0.2); break;
                case 1: typecolor=new Color(0,255,0,0.2); break;
                case 2: typecolor=new Color(0,0,255,0.2); break;
            }
            let dx=(Math.random()-0.5)
            let dy=(Math.random()-0.5)
            let speed=1
            this.matter.push(new BeleepParticle(x,y,energy,mass,type,typecolor,dx,dy,speed))
        }
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


    bounce(p)
    {
        
            if (this.matter[p])
            {
                for (let p2=0;p2<this.matter.length;p2++)
                {
                    if (p!=p2)
                    {
                        if (this.matter[p2])
                        {
                            let distance=Math.sqrt(Math.pow(this.matter[p].x-this.matter[p2].x,2)+Math.pow(this.matter[p].y-this.matter[p2].y,2))-(this.matter[p].mass+this.matter[p2].mass)
                            if (distance<1 && this.matter[p].mass<this.matter[p2].mass)
                            {
                                this.matter[p].dx=this.matter[p].dx*-1
                                this.matter[p].dy=Math.sign(this.matter[p].dy)*-1*Math.random()-0.5
                                this.matter[p].speed=this.matter[p].speed*0.9
                                this.matter[p].energy=this.matter[p].energy+0.1
                            }
                        }
                    }        
                }
            }
            
        
    }

  

    update(speed,i)
    {
       
        let distance=100
        for (let p=0;p<this.matter.length;p++)
        {
           
           if (this.matter[p])
           {
                this.bounce(p)
                let d=new Date()
                this.matter[p].update(i,true)
                let randomElIndex=Math.round(Math.random()*this.matter.length-1)
                if ( this.matter[randomElIndex]  && randomElIndex!=p)
                {
                distance=Math.sqrt(Math.pow(this.matter[p].x-this.matter[randomElIndex].x,2)+Math.pow(this.matter[p].y-this.matter[randomElIndex].y,2))
                if (distance<this.matter[p].mass)
                    {
                            this.matter[p].attract(this.matter[randomElIndex],0.90)
                    }
                    //console.log(distance);
                }
                if (distance<this.matter[p].mass*2 && this.matter[randomElIndex] && this.matter[p].mass>=this.matter[randomElIndex].mass )
                {
                    if (this.matter[p].type!=this.matter[randomElIndex].type)
                    {
                        this.matter[p].energy+=(this.matter[randomElIndex].energy/10)
                        this.matter[p].mass+=(this.matter[randomElIndex].mass/10)
                        this.matter[randomElIndex].energy= this.matter[randomElIndex].energy*0.9
                        this.matter[randomElIndex].mass= this.matter[randomElIndex].mass*0.9
                        this.matter[p].color=this.colorMix(this.matter[p].color,this.matter[randomElIndex].color,this.matter[p].mass,this.matter[randomElIndex].mass)
                    }
                }

            

                if (this.matter[p].mass>this.matter[p].maxmass )
                {
                    for (let rr=1;rr<this.matter[p].mass;rr++)
                    {
                    
                        while (this.matter[p].mass>0.1)
                        {
                            let oldmass=this.matter[p].mass
                            let splitfactor=Math.random()
                            let antisplitfactor=1-splitfactor
                            let energy=Number(this.matter[p].energy)
                            let mass=Number(this.matter[p].mass)
                            this.matter[p].energy=(energy*splitfactor)
                            this.matter[p].mass=(mass*splitfactor)
                            let o=this.matter[p]
                            o.type=Math.round(Math.random()*2)
                            let typecolor
                            switch (o.type)
                            {
                                case 0: typecolor=new Color(255,0,0,0.3); break;
                                case 1: typecolor=new Color(0,255,0,0.3); break;
                                case 2: typecolor=new Color(0,0,255,0.3); break;
                            }
                            let dx=(Math.random()-0.5)*2
                            let dy=(Math.random()-0.5)*2
                            let dxa=-1.0*dx
                            let dya=-1.0*dy
                            let speed=this.matter[p].speed*0.99
                        // this.matter[p].dx=dx
                            //this.matter[p].dy=dy
                            this.matter[p].speed=speed*splitfactor
                            this.matter.push(new BeleepParticle(o.x,o.y,energy*antisplitfactor,mass*antisplitfactor,o.type,typecolor,dxa,dya,speed))
                        }
                    }
                }

            
                if (this.matter[p].mass<0.01)
                {
                    this.matter[p]=undefined
                    this.matter.splice(p,0)
                }
           }
        
          
        }
        //this.filter()
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

    clean(maxlimit)
    {
        let summass=0
        for (let p=0;p<this.matter.length;p++)
        {
            let currentsize=this.matter.length
            
            if (currentsize>maxlimit)
            {
                if (this.matter[p])
                {
                    if (this.matter[p].mass<1 || this.matter[p].energy<0) 
                    { 
                        summass=summass+this.matter[p].mass
                        this.matter.splice(p,1)
                    }
                }
            }
            
        }
        let restMass=new BeleepParticle(32,8,1,summass,0,new Color(0,0,0,0.5),1,0,1)
        let currentsize=this.matter.length
        let trimcount=currentsize-maxlimit
        if (trimcount>0)
        {
            this.matter.splice(maxlimit,trimcount)
        }
        this.matter.push(restMass)
    }
   

    setColorPalette(pal:Color[])
    {
        this.colorPalette=pal
    }
}

export default class Beleep2 extends Animator {
    static category = "Ledart"
    static title = "Beleep"
    static description = "life thingy variant 2"
    
   

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) 
    {
        const colorPaletteControl   = patternSelect(controls, 'Color Palette', 'DimmedReinbow')
        const countControl = controls.value("particle count", 100, 1, 255, 1,true)
        const speedControl = controls.value("speed", 0.01, 0, 1, 0.01,true)
        const intervalControl = controls.value("Delay", 1, 1, 10, 0.1)
        let pixelList=new PixelList()
        box.add(pixelList)
       let universe=new Beleepuniverse(box.width(),box.height(),countControl.value,colorPaletteControl)
      

        scheduler.intervalControlled(intervalControl, (frameNr) => {
         
           pixelList.clear()
           universe.update(speedControl.value,frameNr);
           pixelList.add(universe.render())
           pixelList.wrapX(box)
           //console.log(universe.matter.length)
           pixelList.wrapY(box)

           if (universe.matter.length>countControl.value*2)
           {
        
                universe.clean(countControl.value*2)
           }
           
    
        });
       
    }

    
}
