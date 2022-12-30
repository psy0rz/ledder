import PixelList from "./PixelList.js"
import BoxInterface from "./BoxInterface.js"

//a pixel box is just a pixelcontainer with a size (like a display)
export default class PixelBox extends PixelList {
    xMin: number
    xMax: number
    yMin: number
    yMax: number

    constructor(box: BoxInterface) {
        super()
        this.xMin = box.xMin
        this.yMin = box.yMin
        this.xMax = box.xMax
        this.yMax = box.yMax
    }

    //determine  x percentage
    percentageX(x) {
        return (x - this.xMin) / (this.xMax - this.xMin) * 100
    }

    //determine current y percentage
    percentageY(y) {
        return (y - this.yMin) / (this.yMax - this.yMin) * 100
    }

    width() {
        return this.xMax - this.xMin + 1
    }

    height() {
        return this.yMax - this.yMin + 1
    }

    middleX()
    {
        return (this.xMax+this.xMin)/2
    }

    middleY()
    {
        return (this.yMax+this.yMin)/2

    }

}
