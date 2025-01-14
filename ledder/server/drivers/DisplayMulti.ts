import Display from "../../Display.js"
import type ColorInterface from "../../ColorInterface.js"
import {stat} from "fs/promises";

//driver for an array of displays that have the same width/height
export class DisplayMulti extends Display {
    private displays: Array<Array<Display>>
    private unitHeight: number
    private unitWidth: number



    constructor(displays: Array<Array<Display>>, totalWidth, totalHeight) {
        super(totalWidth, totalHeight)

        this.displays = displays
        this.unitWidth=displays[0][0].width
        this.unitHeight=displays[0][0].height



    }



    frame(displayTime: number) {
        // this.displays[0][0].frame(displayTime)
        let statsBytes=0
        for (const displays of this.displays)
            for (const display of displays) {
                statsBytes=statsBytes+display.frame(displayTime)
            }
        return statsBytes
    }

    setPixel(x: number, y: number, color: ColorInterface) {
        // const floor_y = ~~y
        // const floor_x = ~~x

        if (x<0 || y<0 || x>=this.width || y>=this.height)
            return

            this.displays[~~(x/this.unitWidth)][~~(y/this.unitHeight)].setPixel(x%this.unitWidth, y%this.unitHeight, color)
    }


}
