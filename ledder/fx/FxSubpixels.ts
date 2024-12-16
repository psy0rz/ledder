import Fx from "../Fx.js"
import ControlGroup from "../ControlGroup.js"
import PixelList from "../PixelList.js"
import Scheduler from "../Scheduler.js"
import PixelBox from "../PixelBox.js"
import {colorBlack} from "../Colors.js"

/**
 * This is an additive filter that combines floating point x,y coordinates to exact coordinates.
 * Neighbouring pixels are combined to one by adding the colors together by ratio.
 * This is used for Marquees, to blur the steps by slow scrolling, making it smoother.
 */
export default class FxSubpixels extends Fx {


    constructor(scheduler: Scheduler, controls: ControlGroup) {
        super(scheduler, controls)


    }

    run(sourceList: PixelList, targetBox: PixelBox) {
        this.running = true

        const targetXY = targetBox.raster(targetBox, colorBlack)


        this.scheduler.interval(1, () => {

            //reset all colors to 0,0,0,0
            targetBox.forEachPixel((p) => {
                p.color.r = 0
                p.color.g = 0
                p.color.b = 0

            })


            //traverse all the source pixels and update target
            sourceList.forEachPixel((p) => {
                let x = ~~p.x
                let y = ~~p.y

                const factorX=p.x-x
                const factorY=p.y-y

                const sourceColor = p.color


                //left top:
                if (x<=targetBox.xMax && y<=targetBox.yMax) {
                    const targetColor = targetXY[x][y].color
                    const factor = (1 - factorX) * (1 - factorY)

                    targetColor.r = targetColor.r + (sourceColor.r * factor)
                    targetColor.g = targetColor.g + (sourceColor.g * factor)
                    targetColor.b = targetColor.b + (sourceColor.b * factor)
                }

                //right top:
                x=x+1
                if (x<=targetBox.xMax && y<=targetBox.yMax) {
                    const targetColor = targetXY[x][y].color
                    const factor = (factorX) * (1 - factorY)

                    targetColor.r = targetColor.r + (sourceColor.r * factor)
                    targetColor.g = targetColor.g + (sourceColor.g * factor)
                    targetColor.b = targetColor.b + (sourceColor.b * factor)
                }

                //right bottom:
                y=y+1
                if (x<=targetBox.xMax && y<=targetBox.yMax) {
                    const targetColor = targetXY[x][y].color
                    const factor = (factorX) * (factorY)

                    targetColor.r = targetColor.r + (sourceColor.r * factor)
                    targetColor.g = targetColor.g + (sourceColor.g * factor)
                    targetColor.b = targetColor.b + (sourceColor.b * factor)
                }

                //left bottom:
                x=x-1
                if (x<=targetBox.xMax && y<=targetBox.yMax) {
                    const targetColor = targetXY[x][y].color
                    const factor = (1-factorX) * (factorY)

                    targetColor.r = targetColor.r + (sourceColor.r * factor)
                    targetColor.g = targetColor.g + (sourceColor.g * factor)
                    targetColor.b = targetColor.b + (sourceColor.b * factor)
                }

            })


        })

        return (this.promise)
    }
}

