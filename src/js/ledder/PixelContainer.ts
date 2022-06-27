import {Pixel} from "./Pixel.js";
import BboxInterface from "./BboxInterface.js";
import {monitorEventLoopDelay} from "perf_hooks";

/**
 * A pixeltree. A container is just a simple Set() of Pixels, but can also contain sub PixelContainers.
 * So it cann actually be a tree.
 * This allows us to quickly add or remove a bunch of pixels to a display for example.
 * A single Pixel object can be referenced by multiple pixel containers.
 */
export class PixelContainer extends Set<Pixel | PixelContainer> {

    //dump pixeltree in string format, for debugging
    dump(indent = "") {
        let str = ""
        str = str + indent + `pixeltree:\n`
        indent = indent + " "
        if (this.size == 0) {
            str = str + indent + "(empty)"
        } else {
            for (const p of this) {
                if (p instanceof Pixel)
                    str = str + indent + `(${p.x}, ${p.y}) (r${p.color.r}, g${p.color.g}, b${p.color.b}, a${p.color.a})\n`
                else if (p instanceof PixelContainer) {
                    str = str + p.dump(indent)
                } else {
                    str = str + indent + `Illegal object type: ${typeof (p)}`
                }
            }
        }
        return str
    }


    //calls  callbackfn for each pixel in the pixeltree
    forEachPixel(callbackfn: (pixel: Pixel) => void) {
        // this.recurseForEachPixel(callbackfn, this)
        for (const p of this) {
            if (p instanceof Pixel)
                callbackfn(p)
            else
                p.forEachPixel(callbackfn)
        }
    }

    //Returns a deep copy of the pixeltree.
    //Use copyColor=true to also create copies of the color objects in each pixel
    //NOTE: you should only use copy() if needed, in all other cases just use references
    copy(copyColor = false) {
        let c = new PixelContainer()
        for (const p of this) {
            //NOTE: both Pixel and PixelContainer have the .copy() function, so no if-statement needed here
            c.add(p.copy(copyColor))
        }

        return (c)
    }

    //relatively move all pixels in this tree by this amount
    move(x: number, y: number) {
        for (const p of this)
            p.move(x, y)
    }

    // //get bounding box (override if needed)
    bbox(): BboxInterface {

        let ret = undefined

        this.forEachPixel((p) => {

                if (ret === undefined) {
                    ret = {
                        xMin: p.x,
                        yMin: p.y,
                        xMax: p.x,
                        yMax: p.y
                    }

                } else {

                    if (p.x < ret.xMin)
                        ret.xMin = p.x
                    else if (p.x > ret.xMax)
                        ret.xMax = p.x

                    if (p.y < ret.yMin)
                        ret.yMin = p.y
                    else if (p.y > ret.yMax)
                        ret.yMax = p.y
                }
            }
        )
        return (ret)
    }

    //get centerpoint our pixels [x,y]
    getCenter() {
        const bbox = this.bbox()
        return [(bbox.xMax + bbox.xMin) / 2, (bbox.yMax + bbox.yMin) / 2]

    }

    //center our pixels inside specified bbox
    center(bbox: BboxInterface) {
        //our center
        const ourBbox = this.bbox()
        const ourX = (ourBbox.xMax + ourBbox.xMin) / 2
        const ourY = (ourBbox.yMax + ourBbox.yMin) / 2

        //other center
        const x = (bbox.xMax + bbox.xMin) / 2
        const y = (bbox.yMax + bbox.yMin) / 2

        this.move(Math.round(x - ourX), Math.round(y - ourY))
        return(this)

    }
}
