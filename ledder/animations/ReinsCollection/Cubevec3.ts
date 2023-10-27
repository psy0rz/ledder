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



export class Vec3 extends Matrix {
    constructor(x:number,y:number,z:number)
    {
        super({x:x,y:y,z:z})
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
        return {zMin:minDepth,zMax:maxDepth, zRange:maxDepth-minDepth, alphaPerZ:0.8/(maxDepth-minDepth)}
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
            pointBuffer.push(this.points[p].rotateX(this.transformation.rotate.x).rotateY(this.transformation.rotate.y).rotateZ(this.transformation.rotate.z))
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

            //depth correction (perspective)
            let xDiff=x-centerX
            let yDiff=y-centerY
            let depthFactor=Math.pow(gameControls.perspective,z)
            x=centerX+(xDiff*depthFactor)
            y=centerY+(yDiff*depthFactor)
            

            //color (more distance is less alpha)
            let c=this.color.copy()
            c.a=1-Math.max(0.1,(pointBuffer[p].z)*depthLimits.alphaPerZ)
            perspectiveBuffer.push({x:x,y:y,z:z,a:c.a})
   
            //draw point
            pl.add(new Pixel(x,y,c))
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
               
                let c1=this.color.copy()
                c1.a=perspectiveBuffer[p1].a

                let x2=perspectiveBuffer[p2].x
                let y2=perspectiveBuffer[p2].y
              
                let c2=this.color.copy()
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


class Cube3d extends Object3d {
    constructor(x:number,y:number,z:number, width:number,height:number,depth:number,color:Color)
    {
        super(x,y,z,width,height,depth,color)
        let halfWidth=width/2
        let halfHeight=height/2
        let halfDepth=depth/2

        this.points.push(new Vec3(-1*halfWidth,-1*halfHeight,-1*halfDepth)) //top-left-far
        this.points.push(new Vec3(1*halfWidth,-1*halfHeight,-1*halfDepth)) //top-right-far
        this.points.push(new Vec3(-1*halfWidth,-1*halfHeight,1*halfDepth)) //top-left-close
        this.points.push(new Vec3(1*halfWidth,-1*halfHeight,1*halfDepth)) //top-right-close

        this.points.push(new Vec3(-1*halfWidth,1*halfHeight,-1*halfDepth)) //bot-left-far
        this.points.push(new Vec3(1*halfWidth,1*halfHeight,-1*halfDepth)) //bot-right-far
        this.points.push(new Vec3(-1*halfWidth,1*halfHeight,1*halfDepth)) //bot-left-close
        this.points.push(new Vec3(1*halfWidth,1*halfHeight,1*halfDepth)) //bot-right-close

        this.points.push(new Vec3(0,0,0)) //center


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





export default class Cubevec3 extends Animator {
    static category = "3D"
    static title = "Cubevec3"
    static description = "3d Cube (work in progress) with vec3 lib"
    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        //do config shizzles
        const gameControls = controls.group("3D")
        const gameIntervalControl = gameControls.value("Clock interval", 1, 1, 10, 0.1, true)
        const gameRotateControl = gameControls.value("Rotation per clock interval", 1, -45, 45, 0.1, true)
        const gamePerspectiveControl = gameControls.value("Perspective factor", 0.97, 0.9, 1.0, 0.01, false)
        const gameWireframeControl=gameControls.switch("Draw wireframelines",true,false)

        let  controlSettings={rotation:gameRotateControl.value,wireframe:gameWireframeControl.enabled,perspective:gamePerspectiveControl.value}
        let pl=new PixelList();
        box.add(pl)


        let axis=new Axis3d(box.width()/2,box.height()/2,32,128,128,128,new Color(0,64,0,0.5))
        let cubes=new Cube3d(box.width()/2,box.height()/2,32, 16,16,16,new Color(255,0,0,1))
        let cubel=new Cube3d(box.width()/2,box.height()/2,32, 32,32,32,new Color(0,0,255,0.8))
        
        
        let rotate=0
        scheduler.intervalControlled(gameIntervalControl, (frameNr) => {
            pl.clear()
            rotate=rotate+gameRotateControl.value
            cubel.setRotation(rotate,rotate,rotate)
            cubes.setRotation(rotate,rotate,rotate)
            pl.add(axis.render(box, controlSettings))
            pl.add(cubel.render(box, controlSettings))
            pl.add(cubes.render(box, controlSettings))
           
        })
    }
}
