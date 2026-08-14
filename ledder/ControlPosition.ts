import type ControlGroup from "./ControlGroup.js";
import type BoxInterface from "./BoxInterface.js";

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


    }




}