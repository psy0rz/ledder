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
            const randomX = (Math.random()-0.5) * 0.015625; // Precomputed 1/64
            const randomY = (Math.random()-0.5) * 0.0625; // Precomputed 1/16
            this.x += randomX + (0.01/this.mass);
            this.y += randomY;
        }
        const targetY = this.mass * 4;
        this.y += (this.y > targetY) ? -0.01 : 0.01;
        
        // Optimize wrapping with conditional checks
        if (this.x < 0) this.x += 64;
        else if (this.x > 64) this.x -= 64;
        
        // Clamp Y position
        if (this.y < this.mass) this.y = this.mass;
        else if (this.y > 16 - this.mass) this.y = 16 - this.mass;
    }

    render()
    {
        const pl = new PixelList();
        
        // Anti-aliasing: use subpixel positioning
        const floorX = Math.floor(this.x);
        const floorY = Math.floor(this.y);
        const fracX = this.x - floorX;
        const fracY = this.y - floorY;
        
        // Render with anti-aliasing on center pixel
        const centerColor = this.color.copy();
        pl.add(new Pixel(floorX, floorY, centerColor));
        
        // Add subpixel anti-aliasing to adjacent pixels
        if (fracX > 0.3) {
            const rightColor = this.color.copy();
            rightColor.a *= fracX;
            pl.add(new Pixel(floorX + 1, floorY, rightColor));
        }
        if (fracY > 0.3) {
            const downColor = this.color.copy();
            downColor.a *= fracY;
            pl.add(new Pixel(floorX, floorY + 1, downColor));
        }
        
        // Optimize circle rendering - only render every other radius for large particles
        const step = this.mass > 4 ? 2 : 1;
        for (let radius = step; radius < this.mass; radius += step) {
            const color = this.color.copy();
            color.a = (1 - (radius / this.mass)) * 0.8;
            pl.add(new DrawCircle(this.x, this.y, radius, color));
        }
        return pl;
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
    colorMix(c1, c2, weight1, weight2)
    {
        const totalWeight = weight1 + weight2;
        if (totalWeight === 0) return c1;
        
        const factor = weight1 / totalWeight;
        const invFactor = 1 - factor;
        
        // Optimized color blending
        return new Color(
            c1.r * factor + c2.r * invFactor,
            c1.g * factor + c2.g * invFactor,
            c1.b * factor + c2.b * invFactor,
            c1.a
        );
    }

    update(speed)
    {
        const len = this.matter.length;
        
        // Optimize: Update all particles first
        for (let p = 0; p < len; p++) {
            this.matter[p].update();
        }
        
        // Optimize: Reduce collision checks - only check 1-2 particles per frame per particle
        for (let p = 0; p < len; p++) {
            const currentParticle = this.matter[p];
            
            // Check only 1-2 random neighbors instead of all
            const checksPerFrame = Math.min(2, len - 1);
            for (let c = 0; c < checksPerFrame; c++) {
                const randomElIndex = Math.floor(Math.random() * len);
                if (randomElIndex === p || !this.matter[randomElIndex]) continue;
                
                const other = this.matter[randomElIndex];
                
                // Optimize distance calculation - avoid sqrt when possible
                const dx = currentParticle.x - other.x;
                const dy = currentParticle.y - other.y;
                const distSq = dx * dx + dy * dy;
                const massThreshold = currentParticle.mass * currentParticle.mass;
                
                // Only calculate actual distance if within rough threshold
                if (distSq < massThreshold * 4) {
                    const distance = Math.sqrt(distSq);
                    
                    if (distance < currentParticle.mass) {
                        if (currentParticle.type === other.type) {
                            // go away (same type)
                            currentParticle.attract(other, 1 + speed);
                        } else {
                            // move to (diff type)
                            currentParticle.attract(other, 1 - speed);
                        }
                        
                        // Merge particles if close enough
                        if (currentParticle.mass >= other.mass) {
                            currentParticle.energy += other.energy * 0.1;
                            currentParticle.mass += other.mass * 0.1;
                            other.energy *= 0.9;
                            other.mass *= 0.9;
                            currentParticle.color = this.colorMix(currentParticle.color, other.color, currentParticle.mass, other.mass);
                        }
                    }
                }
            }

            // Optimize splitting - limit splits and cache color lookup
            if (currentParticle.mass > currentParticle.maxmass) {
                // Limit to max 3 splits instead of energy-based for performance
                const splitCount = Math.min(3, Math.floor(currentParticle.energy));
                const typeColors = [new Color(255,0,0,0.5), new Color(0,255,0,0.5), new Color(0,0,255,0.5)];
                const typecolor = typeColors[currentParticle.type];
                
                for (let s = 0; s < splitCount; s++) {
                    const splitfactor = Math.random();
                    const antisplitfactor = 1 - splitfactor;
                    const energy = currentParticle.energy;
                    const mass = currentParticle.mass;
                    
                    currentParticle.energy *= splitfactor;
                    currentParticle.mass *= splitfactor;
                    
                    this.matter.push(new BeleepParticle(
                        currentParticle.x, currentParticle.y, 
                        energy * antisplitfactor, 
                        mass * antisplitfactor, 
                        currentParticle.type, typecolor
                    ));
                }
            }

            // Mark small particles for removal
            if (currentParticle.mass < 0.1) {
                this.matter[p] = undefined;
            }
        }
        
        // Filter out undefined particles
        this.filter();
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
