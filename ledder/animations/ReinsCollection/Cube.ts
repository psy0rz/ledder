import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import ControlInput from "../../ControlInput.js"
import mqtt, { MqttClient } from "mqtt"
import { statusMessage } from "../../message.js"
import Animator from "../../Animator.js"
import Color from "../../Color.js"
import Pixel from "../../Pixel.js"
import DrawLine from "../../draw/DrawLine.js"
import DrawText from "../../draw/DrawText.js"
import { fontSelect } from "../../fonts.js"
import Font from "../../Font.js"
import { random } from "../../utils.js"
import { ShowGeometryInstanceAttribute } from "cesium"




export class Projection {
    x:number
    y:number
    z:number
    constructor (x:number,y:number,z:number)
    {
        this.x=x
        this.y=y
        this.z=z
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
export class CoordinateXYZ {
    x:number
    y:number
    z:number
    projection: Projection

    constructor (x:number,y:number,z:number)
    {
        this.x=x
        this.y=y
        this.z=z
        this.projection=new Projection(x,y,z)
    }
}


//3D cube model. xyz is in the center of the object
export class Object3d {
    x:number
    y:number
    z:number
    width:number
    height:number
    depth:number
    points
    lines
    color:Color

    constructor(x:number,y:number,z:number, width:number,height:number,depth:number,color:Color)
    {
        this.points=[]
        this.lines=[]
        this.x=x
        this.y=y
        this.z=z
        this.color=color
        this.width=width
        this.height=height
        this.depth=depth
        let halfWidth=width/2
        let halfHeight=height/2
        let halfDepth=depth/2
    }

    update()
    {
        //reset projection after render() to prevent rounding-error accumulations
        for (let p=0;p<this.points.length;p++)
        {
            this.points[p].projection=new Projection(this.points[p].x,this.points[p].y,this.points[p].z)
        }
    }

    rotateX(degrees:number)
    {
        //this.update()
        let degreesRad=degrees * (Math.PI / 180) //deg to rad
        let sinTheta=Math.sin(degreesRad)
        let cosTheta=Math.cos(degreesRad)
        for (let p=0;p<this.points.length;p++)
        {
            let point=this.points[p].projection
            this.points[p].projection.y=  ((point.y * cosTheta) - (point.z * sinTheta))
            this.points[p].projection.z=  ((point.z * cosTheta) + (point.y * sinTheta))
        }

    }

    rotateY(degrees:number)
    {
        //this.update()
        let degreesRad=degrees * (Math.PI / 180) //deg to rad
        let sinTheta=Math.sin(degreesRad)
        let cosTheta=Math.cos(degreesRad)
        for (let p=0;p<this.points.length;p++)
        {
            let point=this.points[p].projection
            this.points[p].projection.x=  ((point.x * cosTheta) + (point.z * sinTheta))
            this.points[p].projection.z=  ((point.z * cosTheta) + (point.x * sinTheta))
        }

    }

    rotateZ(degrees:number)
    {
        //this.update()
        let degreesRad=degrees * (Math.PI / 180) //deg to rad
        let sinTheta=Math.sin(degreesRad)
        let cosTheta=Math.cos(degreesRad)
        for (let p=0;p<this.points.length;p++)
        {
            let point=this.points[p].projection
            this.points[p].projection.x=  ((point.x * cosTheta) - (point.y * sinTheta))
            this.points[p].projection.y=  ((point.y * cosTheta) + (point.x * sinTheta))
        }

    }

    

    getCurrentZProjectionlimits()
    {
        let minDepth=1000
        let maxDepth=-1000
        for (let p=0;p<this.points.length;p++)
        {
            let z=this.points[p].projection.z
            if (z < minDepth) { minDepth=z}
            if (z > maxDepth) { maxDepth=z}
        }
        return {zMin:minDepth,zMax:maxDepth, zRange:maxDepth-minDepth, alphaPerZ:0.8/(maxDepth+10)}
    }

    createDepth()
    {
        let depthLimits=this.getCurrentZProjectionlimits()
        let perspectiveFactor=0.98
        let minDepth=depthLimits.zMin
        for (let p=0;p<this.points.length;p++)
        {
            this.points[p].projection.z=this.points[p].projection.z+10 //make sure z is positive
            let point=this.points[p].projection
            let px=(point.x)
            let py=(point.y)
            if (true)
            {
                let depthfactor= Math.pow(perspectiveFactor,point.z)
                this.points[p].projection.x=(px*depthfactor)
                this.points[p].projection.y=(py*depthfactor)
            }
          
        }
        return depthLimits;
    }

    render(showWireframe)
    {
        let pl=new PixelList()
        let depthLimits=this.createDepth();
        
        //draw points
        for (let p=0;p<this.points.length;p++)
        {
            let x=this.points[p].projection.x+this.x
            let y=this.points[p].projection.y+this.y
            let z=this.points[p].projection.z+this.z
            let c=this.color.copy()
            c.a=1-Math.max(0.2,(this.points[p].projection.z)*depthLimits.alphaPerZ)
            //console.log(depthLimits, depthLimits.alphaPerZ,c.a)
            pl.add(new Pixel(x,y,c))
        }

        if (showWireframe)
        {
            for (let p=0;p<this.points.length;p++)
            {
                let x=this.points[p].projection.x+this.x
                let y=this.points[p].projection.y+this.y
                let z=this.points[p].projection.z+this.z
                let c=this.color.copy()
                c.a=1-Math.max(0.2,(this.points[p].projection.z)*depthLimits.alphaPerZ)
                //pl.add(new DrawLine(this.x,this.y,x,y,c,c))
            }
            //drawlines
            for (let l=0;l<this.lines.length;l++)
            {
                let p1=this.lines[l].p1
                let p2=this.lines[l].p2
                let x1=this.points[p1].projection.x+this.x
                let y1=this.points[p1].projection.y+this.y
                let z1=this.points[p1].projection.z+this.z
                let c1=this.color.copy()
                c1.a=1-Math.max(0.2,(this.points[p1].projection.z)*depthLimits.alphaPerZ)

                let x2=this.points[p2].projection.x+this.x
                let y2=this.points[p2].projection.y+this.y
                let z2=this.points[p2].projection.z+this.z
                let c2=this.color.copy()
                c2.a=1-Math.max(0.2,(this.points[p2].projection.z)*depthLimits.alphaPerZ)

                //console.log(depthLimits, depthLimits.alphaPerZ,c.a)
                pl.add(new DrawLine(x1,y1,x2,y2,c1,c2))
            }
        }
        this.update()
        return pl
    }



}


class Cube3d extends Object3d {
    x:number
    y:number
    z:number
    width:number
    height:number
    depth:number
    points
    lines
    color:Color

    constructor(x:number,y:number,z:number, width:number,height:number,depth:number,color:Color)
    {
        super(x,y,z,width,height,depth,color)
        this.points=[]
        this.lines=[]
        this.x=x
        this.y=y
        this.z=z
        this.color=color
        this.width=width
        this.height=height
        this.depth=depth
        let halfWidth=width/2
        let halfHeight=height/2
        let halfDepth=depth/2

        this.points.push(new CoordinateXYZ(-1*halfWidth,-1*halfHeight,-1*halfDepth)) //top-left-far
        this.points.push(new CoordinateXYZ(1*halfWidth,-1*halfHeight,-1*halfDepth)) //top-right-far
        this.points.push(new CoordinateXYZ(-1*halfWidth,-1*halfHeight,1*halfDepth)) //top-left-close
        this.points.push(new CoordinateXYZ(1*halfWidth,-1*halfHeight,1*halfDepth)) //top-right-close

        this.points.push(new CoordinateXYZ(-1*halfWidth,1*halfHeight,-1*halfDepth)) //bot-left-far
        this.points.push(new CoordinateXYZ(1*halfWidth,1*halfHeight,-1*halfDepth)) //bot-right-far
        this.points.push(new CoordinateXYZ(-1*halfWidth,1*halfHeight,1*halfDepth)) //bot-left-close
        this.points.push(new CoordinateXYZ(1*halfWidth,1*halfHeight,1*halfDepth)) //bot-right-close

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

class Axis3d extends Object3d {
    x:number
    y:number
    z:number
    width:number
    height:number
    depth:number
    points
    lines
    color:Color

    constructor(x:number,y:number,z:number, width:number,height:number,depth:number,color:Color)
    {
        super(x,y,z,width,height,depth,color)
        this.points=[]
        this.lines=[]
        this.x=x
        this.y=y
        this.z=z
        this.color=color
        this.width=width
        this.height=height
        this.depth=depth
        let halfWidth=width/2
        let halfHeight=height/2
        let halfDepth=depth/2

        this.points.push(new CoordinateXYZ(-1*width,0,0))
        this.points.push(new CoordinateXYZ(1*width,0,0))
        this.lines.push(new CoordinateLine(0,1))

        this.points.push(new CoordinateXYZ(0,-1*height,0))
        this.points.push(new CoordinateXYZ(0,1*height,0))
        this.lines.push(new CoordinateLine(2,3))

        this.points.push(new CoordinateXYZ(0,0,-1*depth))
        this.points.push(new CoordinateXYZ(0,0,1*depth))
        this.lines.push(new CoordinateLine(4,5))


       
    }
}




export default class Cube extends Animator {
    static category = "3D"
    static title = "Cube"
    static description = "3d Cube (work in progress)"
    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        //do config shizzles
        const gameControls = controls.group("3D")
        const gameIntervalControl = gameControls.value("Clock interval", 1, 1, 10, 0.1, true)
        const gameRotateControl = gameControls.value("Rotation per clock interval", 1, -45, 45, 0.1, true)
        const gameWireframeControl=gameControls.switch("Draw wireframelines",true,false)
        const gameFont = fontSelect(gameControls, 'Font')
        let pl=new PixelList();
        box.add(pl)


        let cube1=new Cube3d(10,8,8, 10,10,10,new Color(255,0,0,1))
        let cube2=new Cube3d(box.width()/2,box.height()/2,10, 10,10,10,new Color(0,255,0,1))
        let cube3=new Cube3d(54,8,12, 10,10,10,new Color(255,0,0,1))
        let cube4=new Cube3d(box.width()/2,box.height()/2,10, 16,16,16,new Color(0,0,255,1))
        let axis=new Axis3d(box.width()/2,box.height()/2,10, 20,20,20,new Color(32,32,32,1))
       
        
     
        let rotate=0
        scheduler.intervalControlled(gameIntervalControl, (frameNr) => {
            pl.clear()

            rotate=rotate+gameRotateControl.value
         
            cube1.rotateX(rotate)
          //
            cube2.rotateZ(rotate)
            cube3.rotateY(rotate)
            cube3.rotateX(rotate)
           

            axis.rotateX(rotate)
            //globe1.rotateY(rotate)
            pl.add(axis.render(gameWireframeControl.enabled))
            pl.add(cube4.render(gameWireframeControl.enabled))
            pl.add(cube1.render(gameWireframeControl.enabled))
            pl.add(cube2.render(gameWireframeControl.enabled))
            pl.add(cube3.render(gameWireframeControl.enabled))

           

 
        })
    }
}
