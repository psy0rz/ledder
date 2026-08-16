import type ControlGroup from "./ControlGroup.js";
import type BoxInterface from "./BoxInterface.js";
import type ControlSwitch from "./ControlSwitch.js";
import type Scheduler from "./Scheduler.js";
import Pixel from "./Pixel.js";
import PixelList from "./PixelList.js";
import {colorRed, colorWhite} from "./Colors.js";

//NOTE: this is a compound control that uses actual controls and does some calculations for the user. therefore its not a subclass from Control

/** Horizontal anchor the X offset is measured from */
export type XOrigin = "left" | "center" | "right"

/** Vertical anchor the Y offset is measured from */
export type YOrigin = "top" | "middle" | "bottom"

// ControlPosition allows user to select a position within a box with offsets.
export default class ControlPosition  {

    //the actual calculated x,y position
    x: number
    y: number

    private showAnchorControl: ControlSwitch

    constructor(name: string = 'Position', parent: ControlGroup, box: BoxInterface, restartOnChange: boolean, xOrigin: XOrigin = "left", xOffset = 0, yOrigin: YOrigin = "top", yOffset = 0) {

        let group = parent.group(name, restartOnChange, false, false, true)

        ///////////// X
        const xOriginChoices: Array<{ id: XOrigin, name: string }> = [
            {
                "id": "left",
                "name": "Left",
            },
            {
                "id": "center",
                "name": "Center",
            },
            {
                "id": "right",
                "name": "Right",
            },
        ]
        let xOriginControl=group.select("X origin", xOrigin, xOriginChoices, true)

        let xMax=box.xMax-box.xMin
        let xOffsetControl=group.value("X offset", xOffset, -xMax, +xMax,1,true)

        //////////// Y
        const yOriginChoices: Array<{ id: YOrigin, name: string }> = [
            {
                "id": "top",
                "name": "Top",
            },
            {
                "id": "middle",
                "name": "Middle",
            },
            {
                "id": "bottom",
                "name": "Bottom",
            },
        ]
        let yOriginControl=group.select("Y origin", yOrigin, yOriginChoices, true)

        let yMax=box.yMax-box.yMin
        let yOffsetControl=group.value("Y offset", yOffset, -yMax, +yMax, 1, true)

        group.onChange( ()=>
        {
            const selectedXOrigin = xOriginControl.selected as XOrigin
            const selectedYOrigin = yOriginControl.selected as YOrigin

            if (selectedXOrigin=="center")
                this.x=box.xMin+(Math.floor(xMax/2))+xOffsetControl.value

            if (selectedXOrigin=="left")
                this.x=box.xMin+xOffsetControl.value

            if (selectedXOrigin=="right")
                this.x=box.xMax+xOffsetControl.value


            if (selectedYOrigin=="middle")
                this.y=box.yMin+(Math.floor(yMax/2))+yOffsetControl.value

            if (selectedYOrigin=="top")
                this.y=box.yMin+yOffsetControl.value

            if (selectedYOrigin=="bottom")
                this.y=box.yMax+yOffsetControl.value


        })

        this.showAnchorControl = group.switch("Show anchor", false, true)

    }

    /** Whether the user has enabled the "Show anchor" switch for this position */
    get showsAnchor(): boolean {
        return this.showAnchorControl.enabled
    }

    /**
     * Add a cross-shaped marker at the current position to `target`, blinking between red and
     * white, if the user has enabled "Show anchor" for this position. A no-op otherwise, so
     * callers can call this unconditionally.
     */
    runAnchorMarker(scheduler: Scheduler, target: PixelList) {
        if (!this.showsAnchor)
            return

        //shared mutable color: recoloring it in place updates all 5 pixels of the cross at once
        const markerColor = colorRed.copy()

        const cross = new PixelList()
        cross.add(new Pixel(this.x, this.y, markerColor))
        cross.add(new Pixel(this.x - 1, this.y, markerColor))
        cross.add(new Pixel(this.x + 1, this.y, markerColor))
        cross.add(new Pixel(this.x, this.y - 1, markerColor))
        cross.add(new Pixel(this.x, this.y + 1, markerColor))
        target.add(cross)

        let showingWhite = false
        scheduler.interval(15, () => {
            target.delete(cross)
            target.add(cross) //keep on top
            showingWhite = !showingWhite
            const source = showingWhite ? colorWhite : colorRed
            markerColor.r = source.r
            markerColor.g = source.g
            markerColor.b = source.b
        })
    }

}