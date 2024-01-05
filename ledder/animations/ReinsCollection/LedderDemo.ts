import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import DrawText from "../../draw/DrawText.js"
import DrawLine from "../../draw/DrawLine.js"
import Animator from "../../Animator.js"
import DrawRectangle from "../../draw/DrawRectangle.js"
import Color from "../../Color.js"
import Font from "../../Font.js"
import { fontSelect } from "../../fonts.js"
import { fonts } from "../../fonts.js"
import Pixel from "../../Pixel.js"
import { random } from "../../utils.js"
import { patternSelect } from "../../ColorPatterns.js"
import Matrix from "matrix_transformer"



export class scene3D {
    points = []
    objects = []

    constructor() {
        this.points = []
        this.objects = []
    }

    render(box, controlSettings) {
        let pl = new PixelList()
        for (let o = 0; o < this.objects.length; o++) {
            pl.add(this.objects[o].render(box, controlSettings))
        }
        return pl
    }

}

const scene3d = new scene3D()

export class Vec3 extends Matrix {

    constructor(x: number, y: number, z: number) {
        super({ x: x, y: y, z: z })
    }


}


export class Vec3Color extends Matrix {

    color: Color
    constructor(x: number, y: number, z: number, color: Color) {
        super({ x: x, y: y, z: z })
        this.color = color
    }


}

export class CoordinateLine {
    p1: number
    p2: number

    constructor(p1: number, p2: number) {
        this.p1 = p1
        this.p2 = p2
    }

}

export class Transformation3D {

    rotate
    translate
    scale

    constructor() {
        this.rotate = { x: 0, y: 0, z: 0 }
        this.translate = new Matrix({ x: 0, y: 0, z: 0 })
        this.scale = { x: 1.0, y: 1.0, z: 1.0 }
    }

}


//3D cube model. xyz is in the center of the object
export class Object3d {
    transformation: Transformation3D
    width: number
    height: number
    depth: number
    scale: number

    points
    lines
    color: Color

    constructor(x: number, y: number, z: number, width: number, height: number, depth: number, color: Color) {
        this.points = []
        this.lines = []

        this.transformation = new Transformation3D()
        this.transformation.translate = new Matrix({ x: x, y: y, z: z })
        this.color = color
        this.width = width
        this.height = height
        this.depth = depth
    }

    setRotation(x: number, y: number, z: number) {
        this.transformation.rotate = { x: x, y: y, z: z }
    }

    setTranslation(x: number, y: number, z: number) {
        this.transformation.translate = { x: x, y: y, z: z }
    }

    setScale(x: number, y: number, z: number) {
        this.transformation.scale = { x: x, y: y, z: z }
    }

    getZProjectionlimits(pointsArr) {
        let minDepth = 1000
        let maxDepth = -1000
        for (let p = 0; p < pointsArr.length; p++) {
            let z = this.points[p].z
            if (z < minDepth) { minDepth = z }
            if (z > maxDepth) { maxDepth = z }
        }
        let alphaPerZ = 1 / (maxDepth - minDepth)
        return { zMin: minDepth, zMax: maxDepth, zRange: maxDepth - minDepth, alphaPerZ: alphaPerZ }
    }

    render(box: PixelBox, gameControls) {
        let pl = new PixelList()
        //pointbuffer is a copy of the basic points with aded transformation and stuff
        //it is calculated before every render to prevent rounding error accumulations 
        let pointBuffer = []
        let perspectiveBuffer = []

        //transform points and put all transformed points into an new array (dont mess with the originals)
        for (let p = 0; p < this.points.length; p++) {
            let newpoint = this.points[p].rotateX(this.transformation.rotate.x).rotateY(this.transformation.rotate.y).rotateZ(this.transformation.rotate.z)
            newpoint.color = this.points[p].color
            pointBuffer.push(newpoint)
        }

        let depthLimits = this.getZProjectionlimits(pointBuffer)
        let centerX = box.width() / 2
        let centerY = box.height() / 2
        //draw points
        for (let p = 0; p < pointBuffer.length; p++) {


            let x = pointBuffer[p].x + this.transformation.translate.x
            let y = pointBuffer[p].y + this.transformation.translate.y
            let z = pointBuffer[p].z + this.transformation.translate.z
            let c = this.color

            if (this.points[p].color) { c = this.points[p].color } else { }

            //depth correction (perspective)
            let xDiff = x - centerX
            let yDiff = y - centerY
            let depthFactor = Math.pow(gameControls.perspective, z)
            x = centerX + (xDiff * depthFactor)
            y = centerY + (yDiff * depthFactor)


            //color (more distance is less alpha)
            let depthcolor = c.copy()
            depthcolor.a = 1 - Math.max(0.1, (pointBuffer[p].z) * depthLimits.alphaPerZ)
            perspectiveBuffer.push({ x: x, y: y, z: z, a: depthcolor.a })


            //draw point
            pl.add(new Pixel(x, y, depthcolor))

        }


        if (gameControls.wireframe && this.lines.length > 0) {
            //drawlines
            for (let l = 0; l < this.lines.length; l++) {
                let p1 = this.lines[l].p1
                let p2 = this.lines[l].p2
                let x1 = perspectiveBuffer[p1].x
                let y1 = perspectiveBuffer[p1].y

                let c1 = pointBuffer[p1].color.copy()
                c1.a = perspectiveBuffer[p1].a

                let x2 = perspectiveBuffer[p2].x
                let y2 = perspectiveBuffer[p2].y

                let c2 = pointBuffer[p2].color.copy()
                c2.a = perspectiveBuffer[p2].a

                pl.add(new DrawLine(x1, y1, x2, y2, c1, c2))
            }
        }


        return pl
    }



}

class Axis3d extends Object3d {


    constructor(x: number, y: number, z: number, width: number, height: number, depth: number, color: Color) {
        super(x, y, z, width, height, depth, color)

        this.points.push(new Vec3Color(-1 * width / 2, 0, 0, new Color(62, 0, 0, 1)))
        this.points.push(new Vec3Color(1 * width / 2, 0, 0, new Color(62, 0, 0, 1)))
        this.lines.push(new CoordinateLine(0, 1))

        this.points.push(new Vec3Color(0, -1 * height / 2, 0, new Color(0, 62, 0, 1)))
        this.points.push(new Vec3Color(0, 1 * height / 2, 0, new Color(0, 62, 0, 1)))
        this.lines.push(new CoordinateLine(2, 3))

        this.points.push(new Vec3Color(0, 0, -1 * depth / 2, new Color(0, 0, 62, 1)))
        this.points.push(new Vec3Color(0, 0, 1 * depth / 2, new Color(0, 0, 62, 1)))
        this.lines.push(new CoordinateLine(4, 5))

    }
}


class Line3d extends Object3d {
    constructor(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, color: Color) {
        let width = Math.abs(x2 - x1)
        let height = Math.abs(y2 - y1)
        let depth = Math.abs(z2 - z1)

        super(x1, y1, z1, width, height, depth, color)
        let halfWidth = width / 2
        let halfHeight = height / 2
        let halfDepth = depth / 2

        this.points.push(new Vec3Color(x1, y1, z1, color)) //top-left-far
        this.points.push(new Vec3Color(x2, y2, z2, color)) //top-right-far
        this.lines.push(new CoordinateLine(0, 1))
    }
}

class Cube3d extends Object3d {
    constructor(x: number, y: number, z: number, width: number, height: number, depth: number, color: Color) {
        super(x, y, z, width, height, depth, color)
        let halfWidth = width / 2
        let halfHeight = height / 2
        let halfDepth = depth / 2

        this.points.push(new Vec3Color(-1 * halfWidth, 1 * halfHeight, -1 * halfDepth, color)) //top-left-far
        this.points.push(new Vec3Color(1 * halfWidth, 1 * halfHeight, -1 * halfDepth, color)) //top-right-far
        this.points.push(new Vec3Color(-1 * halfWidth, 1 * halfHeight, 1 * halfDepth, color)) //top-left-close
        this.points.push(new Vec3Color(1 * halfWidth, 1 * halfHeight, 1 * halfDepth, color)) //top-right-close

        this.points.push(new Vec3Color(-1 * halfWidth, -1 * halfHeight, -1 * halfDepth, color)) //bot-left-far
        this.points.push(new Vec3Color(1 * halfWidth, -1 * halfHeight, -1 * halfDepth, color)) //bot-right-far
        this.points.push(new Vec3Color(-1 * halfWidth, -1 * halfHeight, 1 * halfDepth, color)) //bot-left-close
        this.points.push(new Vec3Color(1 * halfWidth, -1 * halfHeight, 1 * halfDepth, color)) //bot-right-close

        this.points.push(new Vec3Color(0, 0, 0, color)) //center


        this.lines.push(new CoordinateLine(0, 1))
        this.lines.push(new CoordinateLine(1, 3))
        this.lines.push(new CoordinateLine(3, 2))
        this.lines.push(new CoordinateLine(2, 0))

        this.lines.push(new CoordinateLine(4, 5))
        this.lines.push(new CoordinateLine(5, 7))
        this.lines.push(new CoordinateLine(7, 6))
        this.lines.push(new CoordinateLine(6, 4))

        this.lines.push(new CoordinateLine(0, 4))
        this.lines.push(new CoordinateLine(1, 5))
        this.lines.push(new CoordinateLine(3, 7))
        this.lines.push(new CoordinateLine(2, 6))
    }
}


class DrawText3d extends Object3d {
    font: Font

    //color:Color
    constructor(x: number, y: number, z: number, width: number, height: number, depth: number, text: string, font: Font, color: Color) {
        super(x, y, z, width, height, depth, color)
        this.font = font
        let textWidth: number = font.width * text.length
        let textHeight: number = font.height - font.baseOffset
        let xOffset = (width) / 2
        let yOffset = (height) / 2
        let textPixels: DrawText = new DrawText(xOffset, yOffset, font, text, color)
        let pl = new PixelList()
        pl.add(textPixels)



        //pl.move(-1*textWidth/2,-1*textHeight/2,true)


        pl.forEachPixel((pixel: Pixel) => {
            let px = (pixel.x - (textWidth / 2))
            let py = (pixel.y - (textHeight / 2))
            this.points.push(new Vec3Color(px, py, z, color))
            this.points.push(new Vec3Color(px, py, z + depth, color))
            //this.lines.push(new CoordinateLine(this.points.length - 2, this.points.length - 1))

        })
        this.points.push(new Vec3Color(xOffset, yOffset, 0, new Color(255, 255, 0, 1))) //center


    }



}


class Sphere3d extends Object3d {
    constructor(x: number, y: number, z: number, radius: number, color: Color) {

        let width = radius * 2
        let height = radius * 2
        let depth = radius * 2
        super(x, y, z, width, height, depth, color)
        let halfRadius = radius / 2
        let segments = 8
        this.points.push(new Vec3(0, 0, 0)) //center

        for (let p = 0; p < 360 + (360 / segments); p = p + (360 / segments)) {
            let px = Math.sin(p * (Math.PI / 180)) * halfRadius
            let py = Math.cos(p * (Math.PI / 180)) * halfRadius
            this.points.push(new Vec3Color(px, py, 0, color)) //top-left-far
            this.points.push(new Vec3Color(0, py, px, color)) //top-left-far
            this.points.push(new Vec3Color(px, 0, py, color)) //top-left-far

            let ll = this.points.length
            if (ll > 7) {
                this.lines.push(new CoordinateLine(ll - 1, ll - 4))
                this.lines.push(new CoordinateLine(ll - 2, ll - 5))
                this.lines.push(new CoordinateLine(ll - 3, ll - 6))
            }
        }
    }
}

class Random3d extends Object3d {
    constructor(x: number, y: number, z: number, width, height, depth, particlecount, color: Color) {


        super(x, y, z, width, height, depth, color)
        this.points.push(new Vec3Color(0, 0, 0, new Color(255, 255, 255, 1))) //top-left-far

        for (let p = 0; p < particlecount; p++) {

            let px = random(0, width) - (width / 2)
            let py = random(0, height) - (height / 2)
            let pz = random(0, depth) - (depth / 2)
            this.points.push(new Vec3Color(px, py, pz, new Color(random(0, color.r), random(0, color.g), random(0, color.b), Math.random()))) //top-left-far
            //this.lines.push(new CoordinateLine(this.points.length-1,0))


        }
    }
}

class Plane3d extends Object3d {
    constructor(x: number, y: number, z: number, width, height, depth, color: Color) {


        super(x, y, z, width, height, depth, color)
        this.points.push(new Vec3Color(0, 0, 0, new Color(255, 255, 255, 1))) //top-left-far

        for (let p = 0; p < 100; p++) {

            let px = random(-1 * (width / 2), (width / 2))
            let py = 1 * (height / 2)
            let pz = random(-1 * (depth / 2), (depth / 2))
            this.points.push(new Vec3Color(px, py, pz, new Color(0, random(0, 255), 0, Math.random()))) //top-left-far
            //this.lines.push(new CoordinateLine(this.points.length-1,0))


        }
    }
}





export default class LedderDemo extends Animator {
    static category = "Misc"
    static title = "LedderDemo"
    static description = "blabla"
    counter: number = 0
    c = 255
    moviepart = 0


    init3d(box, controls) {

        let myfont = controls.font

        let textDepth = 1
        myfont.load()
        let size = 32
        let stars3d1 = new Random3d(box.width() / 2, box.height() / 2, 0, box.width(), box.width(), box.width(), 255, new Color(128, 128, 128, 0.7))
        let stars3d2 = new Random3d(box.width() / 2, box.height() / 2, 0, box.width(), box.width(), box.width(), 255, new Color(128, 128, 128, 0.7))

        let text3d = new DrawText3d(0, 0, 0, box.width(), box.height(), textDepth, "LEDDER", myfont, new Color(128, 128, 255, 1))
        scene3d.objects.push(stars3d1)
        scene3d.objects.push(stars3d2)
        scene3d.objects.push(text3d);


    }
    renderIntro0(box, controls) {
        
        let pl = new PixelList()
        let z = Math.sin((this.counter - 150) / 300) * box.height()
        scene3d.objects[0].setRotation(0, 0, (this.counter))
        scene3d.objects[1].setRotation(0, 0, (this.counter / 2))
        scene3d.objects[2].setTranslation(0, 0, z)
        pl.add(scene3d.render(box, controls))
        if (this.counter > 100 && z >=0) { scene3d.objects[2].setTranslation(0, 0, 0); scene3d.objects[2].setRotation(0, 0, 0); this.gotoNextPart() }
        return pl
    }

    renderIntro1(box, controls) {
       
        let pl = new PixelList()
        scene3d.objects[0].setRotation(0, 0, (this.counter))
        scene3d.objects[1].setRotation(0, 0, (this.counter / 2))
        pl.add(scene3d.render(box, controls))
        if (this.counter > 1000) { scene3d.objects[2].setTranslation(0, 0, 0); scene3d.objects[2].setRotation(0, 0, 0); this.gotoNextPart() }
        return pl
    }

    renderIntro2(box, controls) {
        
        let pl = new PixelList()
        let z = Math.sin((this.counter) / 100) * box.height()
        scene3d.objects[0].setRotation(0, 0, (this.counter))
        scene3d.objects[1].setRotation(0, 0, (this.counter / 2))
        scene3d.objects[2].setTranslation(0, 0, z)
        pl.add(scene3d.render(box, controls))
        if (z>box.height()*0.8) { scene3d.objects[2].setTranslation(0, 0, 0); scene3d.objects[2].setRotation(0, 0, 0); this.gotoNextPart() }
        return pl
    }

   


    gotoNextPart() {
        this.counter = 0
        this.moviepart++
    }





    renderTimeline(box, controls) {
        //return this.renderIntro(box, frameNr, controls)
        this.counter++
        switch (this.moviepart) {
            case 0: return this.renderIntro0(box, controls); break;
            case 1: return this.renderIntro1(box, controls); break;
            case 2: return this.renderIntro2(box, controls); break;
            default: this.moviepart = -1; this.gotoNextPart(); return new PixelList(); break;
        }



    }


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, x = 0, y = 0) {

        box.clear()
        let pl = new PixelList();

        box.add(pl)
        const intervalControl = controls.value("Clock interval", 1, 1, 10, 0.1, true)
        let font = fontSelect(controls, "Font", fonts.C64.name, 0)

        let controlsArr = { interval: intervalControl.value, wireframe: true, perspective: 0.8, font: font }
        this.init3d(box, controlsArr)
        this.counter = 0

        scheduler.intervalControlled(intervalControl, (frameNr) => {
            pl.clear()
            //box.add(this.renderTimeline(box, frameNr, controlsArr))
            pl.add(this.renderTimeline(box, controlsArr))

        })



    }
}
