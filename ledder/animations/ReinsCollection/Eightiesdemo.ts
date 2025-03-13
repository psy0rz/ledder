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
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"
import Font from "../../Font.js"
import { fonts } from "../../fonts.js"
import DrawText from "../../draw/DrawText.js"
import DrawLine from "../../draw/DrawLine.js"
import Pacman from "../Components/Pacman.js"
import DrawBox from "../../draw/DrawBox.js"
import DrawCircle from "../../draw/DrawCircle.js"
import { reinGalaxy } from "../../ColorPatterns.js"
import Matrix from "matrix_transformer"
import Marquee from "../Text/Marquee.js"

export class scene3D {
    points=[]
    objects=[]

    constructor()
    {
        this.points=[]
        this.objects=[]
    }

    render(box,controlSettings)
    {
        let pl=new PixelList()
        for (let o=0; o<this.objects.length;o++)
        {
            pl.add(this.objects[o].render(box,controlSettings))
        }
        return pl
    }

}

export class Vec3 extends Matrix {
   
    constructor(x:number,y:number,z:number)
    {
        super({x:x,y:y,z:z})
    }

   
}


export class Vec3Color extends Matrix {
   
    color:Color
    constructor(x:number,y:number,z:number,color:Color)
    {
        super({x:x,y:y,z:z})
        this.color=color
    }

   
}

export class CoordinateLine {
    p1:number
    p2:number

    constructor(p1:number,p2:number)
    {
        this.p1=p1
        this.p2=p2
    }

}

export class Transformation3D
{

    rotate
    translate
    scale

    constructor()
    {
        this.rotate={x:0,y:0,z:0}
        this.translate=new Matrix({x:0,y:0,z:0})
        this.scale={x:1.0,y:1.0,z:1.0}
    }

}


//3D cube model. xyz is in the center of the object
export class Object3d {
    transformation: Transformation3D
    width:number
    height:number
    depth:number
    scale:number

    points
    lines
    color:Color

    constructor(x:number,y:number,z:number, width:number,height:number,depth:number,color:Color)
    {
        this.points=[]
        this.lines=[]
       
        this.transformation=new Transformation3D()
        this.transformation.translate=new Matrix({x:x,y:y,z:z})
        this.color=color
        this.width=width
        this.height=height
        this.depth=depth
    }

    setRotation(x:number,y:number,z:number)
    {
        this.transformation.rotate={x:x,y:y,z:z}
    }

    getZProjectionlimits(pointsArr)
    {
        let minDepth=1000
        let maxDepth=-1000
        for (let p=0;p<pointsArr.length;p++)
        {
            let z=this.points[p].z
            if (z < minDepth) { minDepth=z}
            if (z > maxDepth) { maxDepth=z}
        }
        let alphaPerZ=1/(maxDepth-minDepth)
        return {zMin:minDepth,zMax:maxDepth, zRange:maxDepth-minDepth, alphaPerZ:alphaPerZ}
    }

    render(box: PixelBox,gameControls)
    {
        let pl=new PixelList()
        //pointbuffer is a copy of the basic points with aded transformation and stuff
        //it is calculated before every render to prevent rounding error accumulations 
        let pointBuffer=[]
        let perspectiveBuffer=[]

        //transform points and put all transformed points into an new array (dont mess with the originals)
        for (let p=0;p<this.points.length;p++)
        {
            let newpoint=this.points[p].rotateX(this.transformation.rotate.x).rotateY(this.transformation.rotate.y).rotateZ(this.transformation.rotate.z)
            newpoint.color=this.points[p].color
            pointBuffer.push(newpoint)
        }

        let depthLimits=this.getZProjectionlimits(pointBuffer)
        let centerX=box.width()/2
        let centerY=box.height()/2
        //draw points
        for (let p=0;p<pointBuffer.length;p++)
        {  
           
    
            let x=pointBuffer[p].x+this.transformation.translate.x
            let y=pointBuffer[p].y+this.transformation.translate.y
            let z=pointBuffer[p].z+this.transformation.translate.z
            let c=this.color
            if (this.points[p].color) { c=this.points[p].color } else {}

            //depth correction (perspective)
            let xDiff=x-centerX
            let yDiff=y-centerY
            let depthFactor=Math.pow(gameControls.perspective,z)
            x=centerX+(xDiff*depthFactor)
            y=centerY+(yDiff*depthFactor)
            

            //color (more distance is less alpha)
            let depthcolor=c.copy()
            depthcolor.a=1-Math.max(0.1,(pointBuffer[p].z)*depthLimits.alphaPerZ)
            perspectiveBuffer.push({x:x,y:y,z:z,a:depthcolor.a})
   
            //draw point
            pl.add(new Pixel(x,y,depthcolor))
        }

        
        if (gameControls.wireframe)
        {
            //drawlines
            for (let l=0;l<this.lines.length;l++)
            {
                let p1=this.lines[l].p1
                let p2=this.lines[l].p2
                let x1=perspectiveBuffer[p1].x
                let y1=perspectiveBuffer[p1].y
               
                let c1=pointBuffer[p1].color.copy()
                c1.a=perspectiveBuffer[p1].a

                let x2=perspectiveBuffer[p2].x
                let y2=perspectiveBuffer[p2].y
              
                let c2=pointBuffer[p2].color.copy()
                c2.a=perspectiveBuffer[p2].a

                pl.add(new DrawLine(x1,y1,x2,y2,c1,c2))
            }
        }
        
      
        return pl
    }



}

export class Axis3d extends Object3d {
   

    constructor(x:number,y:number,z:number, width:number,height:number,depth:number,color:Color)
    {
        super(x,y,z,width,height,depth,color)

        this.points.push(new Vec3Color(-1*width/2,0,0,new Color(62,0,0,1)))
        this.points.push(new Vec3Color(1*width/2,0,0,new Color(62,0,0,1)))
        this.lines.push(new CoordinateLine(0,1))

        this.points.push(new Vec3Color(0,-1*height/2,0,new Color(0,62,0,1)))
        this.points.push(new Vec3Color(0,1*height/2,0,new Color(0,62,0,1)))
        this.lines.push(new CoordinateLine(2,3))

        this.points.push(new Vec3Color(0,0,-1*depth/2,new Color(0,0,62,1)))
        this.points.push(new Vec3Color(0,0,1*depth/2,new Color(0,0,62,1)))
        this.lines.push(new CoordinateLine(4,5))

    }
}


export class Line3d extends Object3d {
    constructor(x1:number,y1:number,z1:number, x2:number,y2:number,z2:number,color:Color)
    {
        let width=Math.abs(x2-x1)
        let height=Math.abs(y2-y1)
        let depth=Math.abs(z2-z1)

        super(x1,y1,z1,width,height,depth,color)
        let halfWidth=width/2
        let halfHeight=height/2
        let halfDepth=depth/2

        this.points.push(new Vec3Color(x1,y1,z1,color)) //top-left-far
        this.points.push(new Vec3Color(x2,y2,z2,color)) //top-right-far
        this.lines.push(new CoordinateLine(0,1))
    }
}

export class Cube3d extends Object3d {
    constructor(x:number,y:number,z:number, width:number,height:number,depth:number,color:Color)
    {
        super(x,y,z,width,height,depth,color)
        let halfWidth=width/2
        let halfHeight=height/2
        let halfDepth=depth/2

        this.points.push(new Vec3Color(-1*halfWidth,1*halfHeight,-1*halfDepth,color)) //top-left-far
        this.points.push(new Vec3Color(1*halfWidth,1*halfHeight,-1*halfDepth,color)) //top-right-far
        this.points.push(new Vec3Color(-1*halfWidth,1*halfHeight,1*halfDepth,color)) //top-left-close
        this.points.push(new Vec3Color(1*halfWidth,1*halfHeight,1*halfDepth,color)) //top-right-close

        this.points.push(new Vec3Color(-1*halfWidth,-1*halfHeight,-1*halfDepth,color)) //bot-left-far
        this.points.push(new Vec3Color(1*halfWidth,-1*halfHeight,-1*halfDepth,color)) //bot-right-far
        this.points.push(new Vec3Color(-1*halfWidth,-1*halfHeight,1*halfDepth,color)) //bot-left-close
        this.points.push(new Vec3Color(1*halfWidth,-1*halfHeight,1*halfDepth,color)) //bot-right-close

        this.points.push(new Vec3Color(0,0,0,color)) //center


        this.lines.push(new CoordinateLine(0,1))
        this.lines.push(new CoordinateLine(1,3))
        this.lines.push(new CoordinateLine(3,2))
        this.lines.push(new CoordinateLine(2,0))

        this.lines.push(new CoordinateLine(4,5))
        this.lines.push(new CoordinateLine(5,7))
        this.lines.push(new CoordinateLine(7,6))
        this.lines.push(new CoordinateLine(6,4))

        this.lines.push(new CoordinateLine(0,4))
        this.lines.push(new CoordinateLine(1,5))
        this.lines.push(new CoordinateLine(3,7))
        this.lines.push(new CoordinateLine(2,6))
    }
}





export class Sphere3d extends Object3d {
    constructor(x:number,y:number,z:number, radius:number,color:Color)
    {
        
        let width=radius*2
        let height=radius*2
        let depth=radius*2
        super(x,y,z,width,height,depth,color)
        let halfRadius=radius/2
        let segments=8
        this.points.push(new Vec3(0,0,0)) //center
      
            for (let p=0;p<360+(360/segments);p=p+(360/segments))
            {
                let px=Math.sin(p * (Math.PI / 180) ) * halfRadius
                let py=Math.cos(p * (Math.PI / 180) ) * halfRadius
                this.points.push(new Vec3Color(px,py,0,color)) //top-left-far
                this.points.push(new Vec3Color(0,py,px,color)) //top-left-far
                this.points.push(new Vec3Color(px,0,py,color)) //top-left-far
               
                let ll=this.points.length
                if (ll>7)
                {
                    this.lines.push(new CoordinateLine(ll-1,ll-4))
                    this.lines.push(new CoordinateLine(ll-2,ll-5))
                    this.lines.push(new CoordinateLine(ll-3,ll-6))
                }
            }
    }
}




export class Random3d extends Object3d{
    constructor(x:number,y:number,z:number, width,height,depth,particlecount, color:Color)
    {
        
       
        super(x,y,z,width,height,depth,color)
        this.points.push(new Vec3Color(0,0,0,new Color(255,255,255,1))) //top-left-far
      
        for (let p=0;p<particlecount;p++)
        {
            
            let px=random(0,width)-(width/2)
            let py=random(0,height)-(height/2)
            let pz=random(0,depth)-(depth/2)
            this.points.push(new Vec3Color(px,py,pz,new Color(0,0,random(0,255),Math.random()))) //top-left-far
            //this.lines.push(new CoordinateLine(this.points.length-1,0))
                
           
        }
    }
}









export default class Eightiesdemo extends Animator {

    static category = "Demo"
    static title = "Eighties demo"
    static description = "retro style demo inspired by the 80s "
   static max_iteration=512
    
    mandelbrot(c,px:number,py:number,width:number,height:number,zoom:number,max_iterations) {

        let REAL_SET = { start:c.cx-zoom , end:c.cx+zoom }
        let IMAGINARY_SET = { start: c.cy-zoom, end: c.cy+zoom }

        let complex = {
            x: REAL_SET.start + (px / width) * (REAL_SET.end - REAL_SET.start),
            y: IMAGINARY_SET.start + (py /height) * (IMAGINARY_SET.end - IMAGINARY_SET.start)
        }

        let z = { x: 0, y: 0 }, n=0, p, d;
        do {
            p = {
                x: Math.pow(z.x, 2) - Math.pow(z.y, 2),
                y: 2 * z.x * z.y
            };
            z = {
                x: p.x + complex.x,
                y: p.y + complex.y
            };
            d = Math.sqrt(Math.pow(z.x, 2) + Math.pow(z.y, 2));
            n += 1;
        } while (d <= 2 && n < max_iterations);
        return n
    }

    julia(c,px:number,py:number,width:number,height:number,zoom:number,max_iterations)
    {
        //calculate the initial real and imaginary part of z, based on the pixel location and zoom and position values
         let newRe = 1.5 * (px - width / 2) / (0.5 * zoom * width) ;
         let newIm = (py - height / 2) / (0.5 * zoom * height);
         let oldRe=0;
         let oldIm=0
         //i will represent the number of iterations
         let n=0
         //start the iteration process
         do
         {
             //remember value of previous iteration
             oldRe = newRe;
             oldIm = newIm;
             //the actual iteration, the real and imaginary part are calculated
             newRe = oldRe * oldRe - oldIm * oldIm + c.cx
             newIm = 2 * oldRe * oldIm + c.cy
             //if the point is outside the circle with radius 2: stop
             if((newRe * newRe + newIm * newIm) > 4) break;
             n++
         } while (n<max_iterations)
         return n
    }


    initScene3D(box,)
    {
        
                
    }
    

    drawBackground(box:PixelBox, xOffset:number, yOffset:number,horizonHf:number,animationHeight,frameNr)
    { 
        let horizonColor=new Color(255,0,255,0.7);
        let skyTopColor=new Color(255,0,0,0);
        let skyBottomColor=new Color(97,0,255,1);
        let gridColorFar=new Color(255,255,0,0.4);
        let gridColorClose=new Color(255,0,76,0.2);
        let pl=new PixelList();
        let horizonH=(animationHeight/2)*horizonHf*2
       
      


          //stars
          //pl.add(this.getSkyGradient(box,xOffset,horizonH));

          pl.add(this.getFractalGalaxy(box,xOffset,yOffset,horizonH,frameNr))
          pl.add(this.getSkyGradient(box,xOffset,horizonH));


        //create sky
        for (let skyX=0; skyX<box.width(); skyX++)
        {
            pl.add(new DrawLine(skyX,0,skyX,horizonH,skyTopColor,skyBottomColor));
        }

        pl.add(this.getStars(box,yOffset,horizonH))
        if (horizonH>box.height())
        {
            pl.add(this.getSpaceShip(xOffset,Math.sin(horizonH/box.width())*box.width()/2,Math.cos(horizonH/box.height()/2)*box.width()/2))
        }

      
        //sun
        pl.add(this.getSun(box,xOffset,horizonH))

          //create clouds
          pl.add(this.getClouds(box,xOffset,horizonH))


        //create horizon
         pl.add(new DrawLine(0,horizonH,box.width(),horizonH,horizonColor,horizonColor));
       
        let earthVh=(box.height()-horizonH)/(box.height()/3);
        let nxOffset=xOffset%(box.width()/8);
        let nyOffset=yOffset%(earthVh);

      

      
        //create earth

         //draw buildings
         pl.add(this.getDrentheCastle(box,0,horizonH))
         pl.add(this.getPolder(box,xOffset,horizonH));
        
       
        for (let earthHline=0; earthHline<(box.height()-horizonH);earthHline+=earthVh)
        {
            let nGridCol=new Color(82,52,191,(earthHline/(box.height()-horizonH)));
            pl.add(new DrawLine(0,earthHline+horizonH+nyOffset,box.width(),earthHline+horizonH+nyOffset,nGridCol,nGridCol));
        }
        
        for (let earthVline=0; earthVline<box.width();earthVline+=(box.width()/12))
            {
                let perspectiveF=2;
                let transX=((earthVline-(box.width()/2))*perspectiveF)+(box.width()/2);
                pl.add(new DrawLine(earthVline-nxOffset,horizonH,transX-nxOffset,box.height(),gridColorFar,gridColorClose));
            }


            //add wandelaar
            if (horizonH<box.width() && horizonH>0)
                {
                    pl.add(this.getWandelaar(frameNr/5,xOffset,horizonH+6))
                } 


             
      
       
        return pl;

    } 

    getStars(box:PixelBox,yOffset,horizonY)
    {
        let pl=new PixelList();
        let stars=[]
        let cx=box.width()/2
        let cy=box.height()/2
        for (let s=0;s<100;s++)
        {
            let x=Math.sin(s+horizonY/10)*(cx-s)+cx
            let y=Math.cos(s+horizonY/10)*(cy-s)+(cy/2)

            stars.push([x,y])
            if (y<horizonY)
            {
                pl.add(new Pixel(x,y,new Color(255,255,255,y/horizonY)))
            }
        }
        return pl;        

    }

    getSun(box:PixelBox,x,horizonY)
    {
        let pl=new PixelList();
        let radius=(box.height()*0.8)
        let cx=box.width()/2;
        let cy=horizonY;
        
    
        for (let a=0;a<360;a++)
        {
            let px=(Math.sin(a)*radius)+cx
            let py=(Math.cos(a)*radius)+cy
            if (py-1<cy)
            {
            pl.add(new DrawLine(cx,cy,px,py,new Color(255,255,0,1),new Color(255,0,0,0.1)))
            }
        }
        return pl;
    }

    getSpaceShip(index, x,y)
    {
        const frames=[]

        frames.push(new DrawAsciiArtColor(x, y, `
            .......r.......
            ......rrr......
            ......www......
            ......wbw......
            .....wwwww.....
            ....wrrwrrw....
            ...wwrrwrrww...
            ..wwwyrwrywww..
            .....yyryy.....
            .....ryryr.....
            .....ryryr.....
            ......yry......
            `));
        frames.push(new DrawAsciiArtColor(x, y, `
            .......r.......
            ......rrr......
            ......www......
            ......wbw......
            .....wwwww.....
            ....wrrwrrw....
            ...wwrrwrrww...
            ..wwwrywyrwww..
            .....yrrry.....
            .....yrrry.....
            ......yry......
            .......y.......
            `));

            frames.push(new DrawAsciiArtColor(x, y, `
                .......r.......
                ......rrr......
                ......www......
                ......wbw......
                .....wwwww.....
                ....wrrwrrw....
                ...wwrrwrrww...
                ..wwwrywyrwww..
                .....yyryy.....
                .....yyryy.....
                ......yry......
                .......y.......
                `));

       
         
                  


      
                let framenum=Math.round(index)%frames.length;
                return frames[framenum];
    }

    getWandelaar(index,x,y)
    {
        const frames=[]
                frames.push(new DrawAsciiArtColor(x, y, `
                ..oooo..
                ..owbww.
                ..wwwr..
                ..yyyy..
                .y.yy.y.
                ...gg...
                ...gg...
                ...gg...
                `))
                frames.push(new DrawAsciiArtColor(x, y, `
                ..oooo..
                ..owbww.
                ..wwwr..
                .yyyyyyr
                ...yy...
                ...gg...
                ..g..g..
                ..g..g..
                `))
                frames.push(new DrawAsciiArtColor(x, y, `
                ..oooo..
                ..owbww.
                ..wwwr..
                ..yyyy..
                .y.yy.y.
                ...gg...
                ..g..g..
                .g....g.
                `))
                frames.push(new DrawAsciiArtColor(x, y, `
                ..oooo..
                ..owbww.
                ..wwwr..
                ...yy...
                ...yy...
                ...gg...
                ..g..g..
                ..g..g..
                `))
                frames.push(new DrawAsciiArtColor(x, y, `
                ..oooo..
                ..owbw
                ..wwwr..
                ..yyyy..
                .y.yy.y.
                ...gg...
                ...gg...
                ..g..g..
                `))

                let framenum=(index>>2)%frames.length;
                return frames[framenum];
    }

    getFractalGalaxy(box:PixelBox,x,y,horizonY,frameNr)
    {
      
        let pl=new PixelList();
        let radius=(box.width()*0.3)
        let hotspots=[
            { cx:-0.74999446951885, cy:0.0047777284160031,  maxz:9},
            { cx:-0.15554376019751, cy:-0.65010365004009,   maxz:8},
            { cx:-0.81812825180059, cy:-0.19884971553421,   maxz:9},
            { cx:0.35164493860728,  cy:-0.58133391051187,   maxz:9},
            { cx: 0.43792424135946, cy:0.34189208433812 ,   maxz:9},
            { cx:0.24679672392427,  cy:0.50342253979013,    maxz:9},
            { cx:-1.1785276064604,  cy:0.30096231141302,    maxz:8},
            { cx:0.13614939178535,  cy:-0.66905589958398,   maxz:9},
            { cx:0.081159563329829, cy:-0.62558306990165,   maxz:7},
            { cx:0.25347098330532,  cy:-0.00032872330789825,maxz:9},
            { cx:-1.0658884716107,  cy:-0.25431284056064,   maxz:9},
            { cx:-1.0657340413104,  cy:-0.25412076186408,   maxz:9},
            { cx:-1.1780691868827,  cy:0.30014031883977,    maxz:9}
        ] 
        let fIndex=Math.round(frameNr/100) %(hotspots.length)
        //pl.add(new DrawText(10,10,fonts.C64,fIndex.toString(),new Color(255,255,0,1)))
    
        let complex1=hotspots[fIndex]
        let colorPalette=reinGalaxy

        for (let px=0;px<box.width();px++){
            for (let py=0;py<horizonY; py++)
            {
               let distanceFromCenter=Math.round(Math.sqrt(Math.pow(box.width()/2-px,2)+Math.pow(box.height()/2-py,2)))
               let maxDistance=Math.round(Math.sqrt(Math.pow(box.width()/2,2)+Math.pow(box.height()/2,2)))              
               let colorindex1=this.julia(complex1,px,py,box.width(),box.height(),(Math.cos(frameNr/500))*(px+1),512)
               let color1=colorPalette[((Math.round(colorindex1+distanceFromCenter+frameNr/8)))%colorPalette.length].copy()
               color1.a=1-(distanceFromCenter/maxDistance)
                pl.add(new Pixel(px,py,color1))
            }
        }
      
        return pl;
    }

    



    getExplosion(box:PixelBox,x,horizonY)
    {
        let pl=new PixelList();
        let radius=Math.sin(horizonY)*(horizonY/2)+(horizonY/2);
        let cx=box.width()/2;
        let cy=horizonY;
    
        for (let a=0;a<360;a++)
        {
            let px=(Math.sin(a)*radius)+cx
            let py=(Math.cos(a)*radius)+cy
            if (py<cy)
            {
            pl.add(new DrawLine(cx,cy,px,py,new Color(255,255,0,0.6),new Color(255,0,0,0.1)))
            }
        }
        return pl;
    }

    getDrentheCastle(box,x,y)
    {
        let pl=new PixelList();
        pl.add(new DrawAsciiArtColor(x+(box.width()/2)-6, y-8, `
            ..rr.rr.rr..
            ..rr.rr.rr..
            ...rrrrrr...
            ...rrrrrr...
            ...rrrrrr...
            ...rr00rr...
            ...rr00rr...
            ..rrr00rrr..
            `));
           
            return pl
    }

    

    getTent(box,x,y)
    {
        let pl=new PixelList();
        pl.add(new DrawAsciiArtColor(x, y, `

           `));
           
            return pl
    }

    getSkyGradient(box:PixelBox,x,horizonY)
    {
        let pl=new PixelList();
        let starsOffset=(horizonY)-2;
        let xOffset=0 
        for (let c=0;c<starsOffset;c++)
            {

                    let intensity=Math.abs(Math.cos(x+c/10))/2;
                    let b=Math.abs(Math.cos(x+180)*127)+(127)
                    let color=new Color(0,0,0,intensity)

                    pl.add(new DrawLine(0,c,box.width(),c,color,color))
                   
                
        } 
        //pl.add(new DrawLine(0,starsOffset,box.width(),starsOffset,new Color(0,0,0,1),new Color(0,0,0,1)))
        return pl;
    }

    getClouds(box:PixelBox,x,horizonY)
    {
        
        let pl=new PixelList();
        let mountainHeight=8;
        let mountTopColor=new Color(255,255,255,0.4);
        let mountMidColor=new Color(100,100,100,0.2)
        let mountBotColor=new Color(100,100,200,0.1);
        for (let px=0;px<box.width();px++)
        {
            let height=(Math.sin((x*5)+px/4)+Math.cos(box.width()-(px/6)))*(mountainHeight/2)+(mountainHeight/2)
            height=Math.abs(height);

            let midHeight=mountainHeight/2;
            pl.add(new DrawLine(px,horizonY-2,px,horizonY-2-height,mountBotColor,mountTopColor));
            if (height<midHeight)
            {
                pl.add(new DrawLine(px,horizonY-2,px,horizonY-2-height,mountBotColor,mountMidColor));
               
            }
            else
            {
                pl.add(new DrawLine(px,horizonY-2,px,horizonY-2-midHeight,mountBotColor,mountMidColor));
                pl.add(new DrawLine(px,horizonY-2-midHeight,px,horizonY-2-height,mountMidColor,mountTopColor));  
            }

        }
        return pl;
    }
  

    getFire(box,xOffset,yOffset,width,height,frameNr)
    {
        let pl=new PixelList();
        let flameHeight=[];
     
         for(let x=0;x<width;x++)
        {
            let distanceF=Math.cos(x-width/2)+1
            let flameHeight=Math.abs(Math.sin(width/2*x+frameNr/10)+Math.cos(frameNr/5))*(distanceF*4)
            let yBot=Math.round(yOffset+height*2)+8
            let yTop=yBot-Math.round((flameHeight));

            let yMid=Math.round((yTop+yBot)/2)
            let colorTop=new Color(255,0,0,0.4)
            let colorMid=new Color(255,0,0,0.1)
            let colorBot=new Color(255,255,0,0.8)
            let newX=xOffset+x;
            pl.add(new Pixel(newX,yMid,new Color(255,255,0,0.8)))
            pl.add(new DrawLine(xOffset+width/2,yBot,newX,yTop,colorBot,colorTop))
            pl.add(new DrawLine(xOffset+width/2,yBot,newX,yMid,colorBot,colorMid))
            if (Math.round(Math.random()*100)%100<1)
            {
            pl.add(new Pixel(newX,yTop-2,new Color(255,255,0,1)))
            }
            pl.add(new Pixel(newX,yTop-Math.random()*10,new Color(Math.random()*255,Math.random()*255,Math.random()*255,0.2)))
            pl.add(new Pixel(newX,yBot-Math.random()*2,new Color(Math.random()*255,Math.random()*255,Math.random()*255,0.4)))
             } 
       
        pl.crop(box)
        return pl
    }

    getPolder(box:PixelBox,x,horizonY)
    {
        
        let pl=new PixelList();
        let mountainHeight=20;
        let mountTopColor=new Color(0,0,255,0.4);
        let mountMidColor=new Color(255,0,0,0.4)
        let mountBotColor=new Color(0,255,0,0.4);
        let mountBottestColor=new Color(0,233,0,0.5);

        for (let px=0;px<box.width();px++)
        {
            let height=(Math.cos((x+px)/12)+Math.sin(((x+px)/15)))*(mountainHeight/5)+(mountainHeight/2)*2
            
            let midHeight=(height-(mountainHeight/3)-(Math.sin(x+height)+Math.cos((x+height)))*(mountainHeight/6))+10
            let bheight=midHeight+(mountainHeight/3)+ (Math.cos((x+horizonY+height))*(mountainHeight/3))

            //pl.add(new DrawLine(px,horizonY,px,horizonY+height,mountBotColor,mountTopColor));
            if (height<midHeight)
            {
                pl.add(new DrawLine(px,horizonY,px,horizonY+height,mountBotColor,mountMidColor));
               
            }
            else
            {
                pl.add(new DrawLine(px,horizonY,px,horizonY+midHeight,mountBotColor,mountMidColor));
                pl.add(new DrawLine(px,horizonY+midHeight,px,horizonY+height,mountMidColor,mountTopColor));  
            }
            pl.add(new DrawLine(px,horizonY+height,px,box.height()+1,mountTopColor,mountBottestColor));

        }
        return pl;
    }
   


    getSpaceinvader(index,x,y)
    {
        const frames=[]
         frames.push(new DrawAsciiArtColor(x, y, `
        .r...r.
        .ry.yr.
        ...r...
        `));

        frames.push(new DrawAsciiArtColor(x, y, `
            .......
            rry.yrr
            ...r...
            `));

            
        frames.push(new DrawAsciiArtColor(x, y, `
            .......
            .ry.yr.
            r..r..r
            `));
    
        frames.push(new DrawAsciiArtColor(x, y, `
            .......
            rry.yrr
            ...r...
            `));
    


      
                let framenum=(index>>2)%frames.length;
                return frames[framenum];
    }
    getGhost(index,x,y)
    {
        const frames = []
        frames.push(new DrawAsciiArtColor(x, y, `
                ...ww...
                ..wwww..
                .wwwwww.
                w.bww.bw
                w..ww..w
                wwwwwwww
                wwwwwwww
                w..ww..w
                `))
                frames.push(new DrawAsciiArtColor(x, y, `
                ...ww...
                ..wwww..
                .wwwwww.
                w.bww.bw
                w..ww..w
                wwwwwwww
                wwwwwwww
                ww.www.w
                `))
                frames.push(new DrawAsciiArtColor(x, y, `
                ...ww...
                ..wwww..
                .wwwwww.
                w..ww..w
                w.bww.bw
                wwwwwwww
                wwwwwwww
                w..ww..w
                `))
                frames.push(new DrawAsciiArtColor(x, y, `
                ...ww...
                ..wwww..
                .wwwwww.
                w..ww..w
                w.bww.bw
                wwwwwwww
                wwwwwwww
                w.w..w.w
                `))
                frames.push(new DrawAsciiArtColor(x, y, `
                ...ww...
                ..wwww..
                .wwwwww.
                w..ww..w
                w.bww.bw
                wwwwwwww
                wwwwwwww
                w..ww..w
                `));
                let framenum=(index>>2)%frames.length;
                return frames[framenum];
    }

    

    getPacman(index,x,y)
    {
        const frames = []
        frames.push(new DrawAsciiArtColor(x, y, `
        ..yyyy..
        .yyyyyy.
        yyyyyyyy
        yyyyyyyy
        yyyyyyyy
        yyyyyyyy
        .yyyyyy.
        ..yyyy..
        `))
        frames.push(new DrawAsciiArtColor(x, y, `
        ..yyyy..
        .yyyyyy.
        yyyyyyyy
        yyyy....
        yyy.....
        yyyy....
        .yyyyyy.
        ..yyyy..
        `))
        frames.push(new DrawAsciiArtColor(x, y, `
        ..yyyy..
        .yyyyyy.
        yyyyy...
        yyyy....
        yyy.....
        yyyy....
        .yyyy...
        ..yyyy..
        `))
        frames.push(new DrawAsciiArtColor(x, y, `
        ..yyyy..
        .yyyyyy.
        yyyyy...
        yyyy....
        yyy.....
        yyyy....
        .yyyy...
        ..yyyy..
        `))
        frames.push(new DrawAsciiArtColor(x, y, `
        ..yyyy..
        .yyyyyy.
        yyyyyyyy
        yyyy....
        yyy.....
        yyyy....
        .yyyyyy.
        ..yyyy..
        `))
        let framenum=(index>>2)%frames.length;
        return frames[framenum];
    }

    

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const appControl=controls.group("80s theme",true)
        const secondsBetweenNumbers = appControl.value("Delay (seconds)",30, 1, 120, 1)
        const animationHeight=box.height()*2;
        let horizonFactor=0;
        let horizonIncrement=0.001
       
        const canvas=new PixelList();
        const sprites=new PixelList();
        const overlay=new PixelList();
        const canvas3d=new PixelList();
        box.add(canvas);
        box.add(canvas3d);
        box.add(sprites);
       
        box.add(overlay);
       let animationNum=0;
      let font=fonts["Pixel-Gosub"];
      font.load();
       let pacmanSeq=0;
      //scheduler.setFrameTimeuS(100000)
      let scene3d=new scene3D()
      let cube=new Cube3d(box.width()/2,box.height()*3,20, box.width()/2,box.width()/2,box.width()/2, new Color(255,255,0,1))
      let stars=new Random3d(box.width()/2,box.height()*3,20, box.width()/2,box.width()/2,box.width()/2,400,new Color(0,0,128,0.5))
      
      scene3d.objects.push(stars)
      scene3d.objects.push(cube)
      let rotation3d=0
      let  controlSettings={rotation:1,wireframe:true,perspective:0.98,stars:100}
       let textscroller=new Marquee()
       textscroller.run(box,scheduler,appControl);
       scheduler.interval(1, (frameNr) => {
       
            canvas.clear();
            
            let xOffset=Math.cos(90-frameNr/2000)*(box.width()/2)+(box.width()/2);
            let yOffset=(frameNr/animationHeight);
            horizonFactor=Math.sin(frameNr/(box.height()*30))
            let date=new Date()
           let datetext=date.toLocaleDateString("NL")
           let timetext=date.toLocaleTimeString("NL")
           let txtx=(frameNr/8)%(timetext.length*(font.width+8))
            canvas.add(this.drawBackground(box,xOffset,yOffset,horizonFactor,animationHeight,frameNr));
            //canvas.add(new DrawText(0,yOffset,font,datetext,new Color(0,0,0,0.3)))
            //canvas.add(new DrawText(box.width()-26,yOffset,font,timetext,new Color(255,255,255,0.3)))
            sprites.clear()
            let pacmanX=0;
            let pacmanY=0;
            if (horizonFactor<0.53){ 
                if (true)
                {
                    pacmanX=(pacmanSeq/8)%(box.width()*1.5);
                    pacmanY=animationHeight*(horizonFactor+1)+8;
                    sprites.add(this.getPacman(pacmanSeq,pacmanX,pacmanY-5))
                    let ghost:PixelList=this.getGhost(pacmanSeq,(pacmanX-12)%box.width(),pacmanY-5);
                    ghost.replaceColor(new Color(255,255,255,1),new Color(255,255,255,((Math.sin(frameNr/10)+1)/2)))
                    sprites.add(ghost);
                
                    for (let tx=box.width();tx>(pacmanX+4);tx=tx-4)
                    {
                        sprites.add(new Pixel(tx,pacmanY,new Color(255,255,255,0.8)))
                    }
                    pacmanSeq++;
                    if (pacmanX>box.width()-1)
                    {
                        animationNum++;
                    }
                }
            }
            if (horizonFactor>0)
            {
                pacmanX=(box.width()/2)+(Math.sin(frameNr/100)*(box.width()/3));
                pacmanY=Math.abs(box.width()/2)*horizonFactor;
                sprites.add(this.getSpaceinvader(frameNr/8,pacmanX,pacmanY));
                sprites.add(new Pixel(pacmanX+4,pacmanY+4+((frameNr/10)%animationHeight),new Color(255,255,255,1)))
            }
            if (horizonFactor<0.53)
                {
                            let fireY=box.height()*horizonFactor;
                            sprites.add(this.getFire(box,box.width()-15,fireY,8,horizonFactor*box.height(),frameNr))
                            sprites.add(this.getTent(box,pacmanX,box.height()*0.6+horizonFactor*box.height()))
                            sprites.add(this.getTent(box,pacmanX-134,box.height()*0.6+horizonFactor*box.height()))

                            sprites.add(this.getTent(box,pacmanX+134,box.height()*0.6+horizonFactor*box.height()))
                }


                //3d scene
               
                canvas3d.clear()

           
            scene3d.objects[0].transformation.translate.y=(1.8+horizonFactor)*box.height()+5
            scene3d.objects[1].transformation.translate.y=(1.8+horizonFactor)*box.height()+5
            scene3d.objects[0].transformation.translate.z=(xOffset)/2
            scene3d.objects[1].transformation.translate.z=(xOffset)/2
            rotation3d=frameNr
            //scene3d.objects[1].setRotation(0,0,rotate*4)
            scene3d.objects[0].setRotation(rotation3d,rotation3d,0)
            scene3d.objects[1].setRotation(rotation3d,rotation3d,0)
            //scene3d.objects[2].setRotation(rotate,rotate,0)
            //scene3d.objects[3].setRotation(rotate,rotate,0)
         
           
            canvas3d.add(scene3d.render(box, controlSettings))


            

            canvas.crop(box)
            
            //
        })


       
    }
}
