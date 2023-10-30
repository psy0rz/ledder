// with help from https://github.com/Azleur/mat3/blob/master/src/index.ts
import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import Animator from "../../Animator.js"
import Color from "../../Color.js"
import Pixel from "../../Pixel.js"
import DrawLine from "../../draw/DrawLine.js"
import Matrix from "matrix_transformer"

import { random } from "../../utils.js"

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

class Axis3d extends Object3d {
   

    constructor(x:number,y:number,z:number, width:number,height:number,depth:number,color:Color)
    {
        super(x,y,z,width,height,depth,color)

        this.points.push(new Vec3(-1*width/2,0,0))
        this.points.push(new Vec3(1*width/2,0,0))
        this.lines.push(new CoordinateLine(0,1))

        this.points.push(new Vec3(0,-1*height/2,0))
        this.points.push(new Vec3(0,1*height/2,0))
        this.lines.push(new CoordinateLine(2,3))

        this.points.push(new Vec3(0,0,-1*depth/2))
        this.points.push(new Vec3(0,0,1*depth/2))
        this.lines.push(new CoordinateLine(4,5))

    }
}


class Line3d extends Object3d {
    constructor(x1:number,y1:number,z1:number, x2:number,y2:number,z2:number,color:Color)
    {
        let width=Math.abs(x2-x1)
        let height=Math.abs(y2-y1)
        let depth=Math.abs(z2-z1)

        super(x1,y1,z1,width,height,depth,color)
        let halfWidth=width/2
        let halfHeight=height/2
        let halfDepth=depth/2

        this.points.push(new Vec3(x1,y1,z1)) //top-left-far
        this.points.push(new Vec3(x2,y2,z2)) //top-right-far
        this.lines.push(new CoordinateLine(0,1))
    }
}

class Cube3d extends Object3d {
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




class Pyramid3d extends Object3d {
    constructor(x:number,y:number,z:number, width:number,height:number,depth:number,color:Color)
    {
        super(x,y,z,width,height,depth,color)
        let halfWidth=width/2
        let halfHeight=height/2
        let halfDepth=depth/2

        this.points.push(new Vec3(-1*halfWidth,1*halfHeight,-1*halfDepth)) //top-left-far
        this.points.push(new Vec3(1*halfWidth,1*halfHeight,-1*halfDepth)) //top-right-far
        this.points.push(new Vec3(-1*halfWidth,1*halfHeight,1*halfDepth)) //top-left-close
        this.points.push(new Vec3(1*halfWidth,1*halfHeight,1*halfDepth)) //top-right-close

        this.points.push(new Vec3(0,-1*halfHeight,0)) //bot-left-far
       

        this.points.push(new Vec3(0,0,0)) //center


        this.lines.push(new CoordinateLine(0,1))
        this.lines.push(new CoordinateLine(1,3))
        this.lines.push(new CoordinateLine(3,2))
        this.lines.push(new CoordinateLine(2,0))

        this.lines.push(new CoordinateLine(0,4))
        this.lines.push(new CoordinateLine(1,4))
        this.lines.push(new CoordinateLine(2,4))
        this.lines.push(new CoordinateLine(3,4))

    }
}

class Sphere3d extends Object3d {
    constructor(x:number,y:number,z:number, radius:number,color:Color)
    {
        
        let width=radius*2
        let height=radius*2
        let depth=radius*2
        super(x,y,z,width,height,depth,color)
        let halfRadius=radius/2
        let segments=4
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

class Spiral3d extends Object3d {
    constructor(x:number,y:number,z:number, radius:number,length:number, color:Color)
    {
        
        let width=radius*2
        let height=radius*2
        let depth=length
        super(x,y,z,width,height,depth,color)
        let halfRadius=radius/2
        let segments=6
        this.points.push(new Vec3(0,0,0)) //center
      
            for (let l=0;l<length;l=l+(1/segments))
            {
               
                let px=Math.round(Math.sin((l*segments) * (Math.PI / 180) ) * halfRadius)
                let py=Math.round(Math.cos((l*segments) * (Math.PI / 180) ) * halfRadius)
                this.points.push(new Vec3(px,py,l)) //top-left-far
                
                if (l>0)
                {
                    this.lines.push(new CoordinateLine(this.points.length-1,this.points.length-2))
                   
                }
            }
    }
}

class Random3d extends Object3d{
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






export default class Project3 extends Animator {
    static category = "3D"
    static title = "Cubevec3"
    static description = "3d Cube (work in progress) with vec3 lib"
    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        //do config shizzles
        const gameControls = controls.group("3D")
        const gameIntervalControl = gameControls.value("Clock interval", 1, 1, 10, 0.1, true)
        const gameRotateControl = gameControls.value("Rotation per clock interval", 1, -45, 45, 0.1, true)
        const gamePerspectiveControl = gameControls.value("Perspective factor", 0.97, 0.9, 1.0, 0.01, true)
        const gameBoxsizeControl = gameControls.value("Boxsize", box.height(), 1, 255, 1, true)
        const gameStarsControl = gameControls.value("Stars", 10, 0, 1000, 1, true)
        const gameWireframeControl=gameControls.switch("Draw wireframelines",true,true)

        let  controlSettings={rotation:gameRotateControl.value,wireframe:gameWireframeControl.enabled,perspective:gamePerspectiveControl.value,stars:gameStarsControl.value}
        let pl=new PixelList();
        box.add(pl)

        let scene3d=new scene3D()
        let cubeC=new Cube3d(box.width()/2,box.height()/2,20, gameBoxsizeControl.value,gameBoxsizeControl.value,gameBoxsizeControl.value,new Color(128,128,0,1.0))
        //let cubeL=new Pyramid3d(0,box.height()/2,20, box.height(),box.height(),box.height(),new Color(128,0,0,0.6))
        //let sphere=new Sphere3d(box.width(),box.height()/2,20, box.height(),new Color(0,128,0,0.6))
        //let spiral=new Spiral3d(box.width()/2,box.height()/2,20, box.height(),box.height(),new Color(0,128,0,0.6))
        let stars=new Random3d(box.width()/2,box.height()/2,20, gameBoxsizeControl.value,gameBoxsizeControl.value,gameBoxsizeControl.value,gameStarsControl.value,new Color(0,0,128,0.5))
        scene3d.objects.push(stars)
        
        scene3d.objects.push(cubeC)
        //scene3d.objects.push(spiral)
        //scene3d.objects.push(cubeL)
        //scene3d.objects.push(cubeR)
      

        
        let rotate=0
    
        scheduler.intervalControlled(gameIntervalControl, (frameNr) => {
            pl.clear()
            rotate=rotate+gameRotateControl.value
            //scene3d.objects[1].setRotation(0,0,rotate*4)
            scene3d.objects[1].setRotation(rotate,rotate,0)
            scene3d.objects[0].setRotation(rotate,rotate,0)
           
  
            pl.add(scene3d.render(box, controlSettings))
           
       
           
        })
    }
}
