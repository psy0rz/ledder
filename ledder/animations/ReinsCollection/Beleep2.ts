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
    prevX:number  // For motion blur
    prevY:number  // For motion blur
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
        this.prevX=x  // Initialize motion blur
        this.prevY=y  // Initialize motion blur
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
        // Store previous position for motion blur
        this.prevX = this.x;
        this.prevY = this.y;

        // Optimize: clamp dx/dy in one operation
        this.dx = Math.max(-1.0, Math.min(1.0, this.dx));
        this.dy = Math.max(-1.0, Math.min(1.0, this.dy));
        
        if (this.mass<1) { 
            // Optimize: cache repeated calculations
            const iDiv100 = i * 0.01; // Precompute i/100
            const mass8 = this.mass * 8.0;
            const mass4 = this.mass * 4.0;
            
            this.x = 32 + Math.sin(iDiv100 + this.x * 0.01) * mass8;
            this.y = 8 + Math.cos(iDiv100 + this.y * 0.01) * mass4;
            this.speed *= 0.98;
            this.mass += 0.001;
        }
        else
        {
            const invMass = 1.0 / this.mass; // Cache inverse mass
            if (this.speed > 0.01)
            {
                this.x += this.speed * this.dx * invMass;
                this.y += this.speed * this.dy * invMass;
                this.speed *= 0.999;
            }
            else
            {
                this.x += this.dx * invMass;
                this.y += this.dy * invMass;
                this.speed = invMass;
            }
        }
        
        // Optimize wrapping with modulo
        this.x = ((this.x % 64) + 64) % 64;
        this.y = ((this.y % 16) + 16) % 16;

        // Optimize bouncing with fewer checks
        const roundX = Math.round(this.x);
        if (roundX <= 0) {
            this.dx = Math.abs(this.x);
            this.dy *= -1;
        } else if (roundX >= 63) {
            this.dx = -Math.abs(this.x);
            this.dy *= -1;
        }

        if (this.y <= 0) {
            this.dy = Math.abs(this.y);
            this.dx *= -1;
        } else if (this.y >= 15) {
            this.dy = -Math.abs(this.y);
            this.dx *= -1;
        }

        if (isNaN(this.x) || isNaN(this.y) || this.mass < 0.5) 
        { 
            const iDiv100 = i * 0.01;
            this.x = 32 + Math.sin(iDiv100) * 5;
            this.y = 8 + Math.cos(iDiv100) * 5;
            this.prevX = this.x;
            this.prevY = this.y;
            this.mass = 1;
            this.energy = 1;
            this.speed = 1;
            this.dx = Math.random() - 0.5;
            this.dy = Math.random() - 0.5;
            this.type = Math.round(Math.random() * 2);
            
            if (childs) {
                this.update(i, false, palette);
            }
        }
    }

    render()
    {
        const pl = new PixelList();
        
        // Cache type color
        const typeColors = [
            new Color(255, 0, 0, 0.3),
            new Color(0, 255, 0, 0.3),
            new Color(0, 0, 255, 0.3)
        ];
        const typecolor = typeColors[this.type];
        
        // Anti-aliasing: use subpixel positioning
        const floorX = Math.floor(this.x);
        const floorY = Math.floor(this.y);
        const fracX = this.x - floorX;
        const fracY = this.y - floorY;
        
        // Motion blur: calculate movement vector
        const motionX = this.x - this.prevX;
        const motionY = this.y - this.prevY;
        const motionMag = Math.sqrt(motionX * motionX + motionY * motionY);
        
        // Render motion blur trail if moving significantly
        if (motionMag > 0.5 && this.mass >= 1) {
            const blurSteps = Math.min(5, Math.floor(motionMag * 2));
            for (let b = 0; b < blurSteps; b++) {
                const t = b / blurSteps;
                const blurX = this.prevX + motionX * t;
                const blurY = this.prevY + motionY * t;
                const blurColor = typecolor.copy();
                blurColor.a *= (1 - t) * 0.3; // Fade trail
                pl.add(new Pixel(Math.floor(blurX), Math.floor(blurY), blurColor));
            }
        }
        
        // Main particle with anti-aliasing
        if (this.mass < 1) {
            pl.add(new Pixel(floorX, floorY, new Color(0, 0, 255, 0.1)));
        } else {
            // Center pixel
            pl.add(new Pixel(floorX, floorY, typecolor));
            
            // Subpixel anti-aliasing
            if (fracX > 0.3) {
                const rightColor = typecolor.copy();
                rightColor.a *= fracX * 0.7;
                pl.add(new Pixel(floorX + 1, floorY, rightColor));
            }
            if (fracY > 0.3) {
                const downColor = typecolor.copy();
                downColor.a *= fracY * 0.7;
                pl.add(new Pixel(floorX, floorY + 1, downColor));
            }
        }
        
        // Optimize circle rendering - skip every other radius for large particles
        if (this.mass > 1) {
            const step = this.mass > 4 ? 2 : 1;
            for (let radius = step; radius < this.mass; radius += step) {
                const color = this.color.copy();
                color.a = (1 - (radius / this.mass)) * 0.8;
                pl.add(new DrawCircle(this.x, this.y, radius, color));
            }
        }
        
        return pl;
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


    

    colorMix(c1, c2, weight1, weight2)
    {
        const totalWeight = weight1 + weight2;
        if (totalWeight === 0) return c1;
        
        const factor = weight1 / totalWeight;
        const invFactor = 1 - factor;
        
        return new Color(
            c1.r * factor + c2.r * invFactor,
            c1.g * factor + c2.g * invFactor,
            c1.b * factor + c2.b * invFactor,
            c1.a
        );
    }


    bounce(p)
    {
        if (!this.matter[p]) return;
        
        const particle = this.matter[p];
        const len = this.matter.length;
        
        // Optimize: only check a few random particles instead of all
        const checksPerFrame = Math.min(5, len - 1);
        
        for (let c = 0; c < checksPerFrame; c++) {
            const p2 = Math.floor(Math.random() * len);
            if (p === p2 || !this.matter[p2]) continue;
            
            const other = this.matter[p2];
            
            // Optimize: use distance squared to avoid sqrt when possible
            const dx = particle.x - other.x;
            const dy = particle.y - other.y;
            const distSq = dx * dx + dy * dy;
            const radiusSum = particle.mass + other.mass;
            const radiusSumSq = radiusSum * radiusSum;
            
            // Only calculate actual distance if roughly in range
            if (distSq < radiusSumSq * 4) {
                const distance = Math.sqrt(distSq) - radiusSum;
                
                if (distance < 1 && particle.mass < other.mass) {
                    particle.dx *= -1;
                    particle.dy = Math.sign(particle.dy) * -1 * Math.random() - 0.5;
                    particle.speed *= 0.9;
                    particle.energy += 0.1;
                    break; // Found collision, stop checking
                }
            }
        }
    }

  

    update(speed, i)
    {
        const len = this.matter.length;
        
        // Optimize: Update all particles first
        for (let p = 0; p < len; p++) {
            if (this.matter[p]) {
                this.bounce(p);
                this.matter[p].update(i, true, this.colorPalette);
            }
        }
        
        // Optimize: Reduce collision checks - only 1-2 per particle
        for (let p = 0; p < len; p++) {
            if (!this.matter[p]) continue;
            
            const particle = this.matter[p];
            const randomElIndex = Math.floor(Math.random() * len);
            
            if (!this.matter[randomElIndex] || randomElIndex === p) continue;
            
            const other = this.matter[randomElIndex];
            
            // Optimize distance calculation
            const dx = particle.x - other.x;
            const dy = particle.y - other.y;
            const distSq = dx * dx + dy * dy;
            const massSq = particle.mass * particle.mass;
            
            // Only calculate sqrt if potentially in range
            if (distSq < massSq * 9) {
                const distance = Math.sqrt(distSq);
                
                if (distance < particle.mass) {
                    particle.attract(other, 0.90);
                }
                
                if (distance < particle.mass * 2 && particle.mass >= other.mass) {
                    if (particle.type !== other.type) {
                        particle.energy += other.energy * 0.1;
                        particle.mass += other.mass * 0.1;
                        other.energy *= 0.9;
                        other.mass *= 0.9;
                        particle.color = this.colorMix(particle.color, other.color, particle.mass, other.mass);
                    }
                }
            }

            // Optimize splitting - limit to prevent lag
            if (particle.mass > particle.maxmass) {
                // Limit splits to max 3 per frame for performance
                const splitCount = Math.min(3, Math.floor(particle.mass));
                const typeColors = [
                    new Color(255, 0, 0, 0.3),
                    new Color(0, 255, 0, 0.3),
                    new Color(0, 0, 255, 0.3)
                ];
                
                for (let s = 0; s < splitCount && particle.mass > 0.1; s++) {
                    const splitfactor = Math.random();
                    const antisplitfactor = 1 - splitfactor;
                    const energy = particle.energy;
                    const mass = particle.mass;
                    
                    particle.energy *= splitfactor;
                    particle.mass *= splitfactor;
                    
                    const newType = Math.round(Math.random() * 2);
                    const typecolor = typeColors[newType];
                    const dx = (Math.random() - 0.5) * 2;
                    const dy = (Math.random() - 0.5) * 2;
                    const speed = particle.speed * 0.99;
                    
                    particle.speed = speed * splitfactor;
                    
                    this.matter.push(new BeleepParticle(
                        particle.x, particle.y,
                        energy * antisplitfactor,
                        mass * antisplitfactor,
                        newType, typecolor,
                        -dx, -dy, speed
                    ));
                }
            }

            // Clean up dead particles
            if (particle.mass < 0.01) {
                this.matter[p] = undefined;
                this.matter.splice(p, 1);
            }
        }
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
