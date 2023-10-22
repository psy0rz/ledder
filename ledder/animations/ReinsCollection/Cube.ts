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

function degrees_to_radians(degrees: number) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}

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
export class Cube3d {
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

    update()
    {
        //reset projection after render() to prevent rounding-error accumulations
        for (let p=0;p<this.points.length;p++)
        {
            this.points[p].projection=new Projection(this.points[p].x,this.points[p].y,this.points[p].z)
        }
    }

    rotateX(theta:number)
    {
        let degreesRad=degrees_to_radians(theta)
        let sinTheta=Math.sin(degreesRad)
        let cosTheta=Math.cos(degreesRad)
        for (let p=0;p<this.points.length;p++)
        {
            let point=this.points[p].projection
            this.points[p].projection.y=  ((point.y * cosTheta) - (point.z * sinTheta))
            this.points[p].projection.z=  ((point.z * cosTheta) + (point.y * sinTheta))
        }

    }

    rotateY(theta:number)
    {
        let degreesRad=degrees_to_radians(theta)
        let sinTheta=Math.sin(degreesRad)
        let cosTheta=Math.cos(degreesRad)
        for (let p=0;p<this.points.length;p++)
        {
            let point=this.points[p].projection
            this.points[p].projection.x=  ((point.x * cosTheta) + (point.z * sinTheta))
            this.points[p].projection.z=  ((point.z * cosTheta) + (point.x * sinTheta))
        }

    }

    rotateZ(theta:number)
    {
        let degreesRad=degrees_to_radians(theta)
        let sinTheta=Math.sin(degreesRad)
        let cosTheta=Math.cos(degreesRad)
        for (let p=0;p<this.points.length;p++)
        {
            let point=this.points[p].projection
            this.points[p].projection.x= ((point.x * cosTheta) - (point.y * sinTheta))
            this.points[p].projection.y= ((point.y * cosTheta) + (point.x * sinTheta))
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
        return {zMin:minDepth,zMax:maxDepth, zRange:maxDepth-minDepth, alphaPerZ:0.8/(maxDepth-minDepth)}
    }

    createDepth()
    {
        let depthLimits=this.getCurrentZProjectionlimits()
        let perspectiveFactor=0.95
        let minDepth=depthLimits.zMin
        for (let p=0;p<this.points.length;p++)
        {
            let point=this.points[p].projection
            let dx=(point.x)
            let dy=(point.y)
            let relativeDepth=minDepth+point.z
            let scale=0.8
            this.points[p].projection.x=(scale*dx)
            this.points[p].projection.y=(scale*dy)


        }
        return depthLimits;
    }

    render()
    {
        let pl=new PixelList()
        let depthLimits=this.createDepth();
        
        for (let p=0;p<this.points.length;p++)
        {
            let x=this.points[p].projection.x+this.x
            let y=this.points[p].projection.y+this.y
            let z=this.points[p].projection.z+this.z
            let c=this.color.copy()
            c.a=1-Math.max(0.2,(this.points[p].projection.z-depthLimits.zMin)*depthLimits.alphaPerZ)
            //console.log(depthLimits, depthLimits.alphaPerZ,c.a)
            pl.add(new Pixel(x,y,c))
        }

        for (let l=0;l<this.lines.length;l++)
        {
            let p1=this.lines[l].p1
            let p2=this.lines[l].p2
            let x1=this.points[p1].projection.x+this.x
            let y1=this.points[p1].projection.y+this.y
            let z1=this.points[p1].projection.z+this.z
            let c1=this.color.copy()
            c1.a=1-Math.max(0.2,(this.points[p1].projection.z-depthLimits.zMin)*depthLimits.alphaPerZ)

            let x2=this.points[p2].projection.x+this.x
            let y2=this.points[p2].projection.y+this.y
            let z2=this.points[p2].projection.z+this.z
            let c2=this.color.copy()
            c2.a=1-Math.max(0.2,(this.points[p2].projection.z-depthLimits.zMin)*depthLimits.alphaPerZ)

            //console.log(depthLimits, depthLimits.alphaPerZ,c.a)
            pl.add(new DrawLine(x1,y1,x2,y2,c1,c2))
        }
        this.update()
        return pl
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
        const gameFont = fontSelect(gameControls, 'Font')
        let pl=new PixelList();
        box.add(pl)


        let cube1=new Cube3d(32,8,8, 16,16,16,new Color(255,0,0,1))
        let cube2=new Cube3d(9,8,8, 16,16,16,new Color(0,255,0,1))
        let cube3=new Cube3d(40,8,8, 8,8,8,new Color(0,0,255,1))
       
        
     
        let rotate=0
        scheduler.intervalControlled(gameIntervalControl, (frameNr) => {
            pl.clear()

            rotate=rotate+gameRotateControl.value
            cube1.rotateZ(rotate)
            pl.add(cube1.render())

            cube2.rotateY(rotate)
            pl.add(cube2.render())

            cube3.rotateX(rotate)
            pl.add(cube3.render())

           

 
        })
    }
}
