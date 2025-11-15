import type ControlGroup from "./ControlGroup.js";
import type BoxInterface from "./BoxInterface.js";

//NOTE: this is a compound control that uses actual controls and does some calculations for the user. therefore its not a subclass from Control

// ControlPosition allows user to select a position within a box with offsets.
export default class ControlPosition  {

    //the actual calculated x,y position
    x: number
    y: number

    constructor(name: string = 'root', parent: ControlGroup,box:BoxInterface, restartOnChange:boolean, xOrigin="left", xOffset=0, yOrigin="top", yOffset=0) {

        let group = parent.group(name, restartOnChange, false, false, true)

        ///////////// X
        let xOriginControl=group.select("X origin", xOrigin, [
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
        ])

        let xMax=box.xMax-box.xMin
        let xOffsetControl=group.value("X offset", xOffset, -xMax, +xMax)

        //////////// Y
        let yOriginControl=group.select("Y origin", yOrigin, [
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
        ])

        let yMax=box.yMax-box.yMin
        let yOffsetControl=group.value("Y offset", yOffset, -yMax, +yMax)

        group.onChange( ()=>
        {
            if (xOriginControl.selected=="center")
                this.x=box.xMin+(Math.floor(xMax/2))+xOffsetControl.value

            if (xOriginControl.selected=="left")
                this.x=box.xMin+xOffsetControl.value

            if (xOriginControl.selected=="right")
                this.x=box.xMax+xOffsetControl.value


            if (yOriginControl.selected=="middle")
                this.y=box.yMin+(Math.floor(yMax/2))+yOffsetControl.value

            if (yOriginControl.selected=="top")
                this.y=box.yMin+yOffsetControl.value

            if (yOriginControl.selected=="bottom")
                this.y=box.yMax+yOffsetControl.value


        })


    }




}