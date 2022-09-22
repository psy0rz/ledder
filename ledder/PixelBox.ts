import PixelContainer from "./PixelContainer.js"
import BoxInterface from "./BoxInterface.js"

//a pixel box is just a pixelcontainer with a size (like a display)
export default class PixelBox extends PixelContainer
{
    xMin: number
    xMax: number
    yMin: number
    yMax: number

    constructor(box:BoxInterface) {
        super()
        this.xMin=box.xMin
        this.yMin=box.yMin
        this.xMax=box.xMax
        this.yMax=box.yMax
    }
}
