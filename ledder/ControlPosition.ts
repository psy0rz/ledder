import type ControlGroup from "./ControlGroup.js";
import type BoxInterface from "./BoxInterface.js";

//NOTE: this is a compound control that uses actual controls and does some calculations for the user. therefore its not a subclass from Control

// ControlPosition allows user to select a position within a box with offsets.
export default class ControlPosition  {

    x: number
    y: number

    constructor(name: string = 'root', parent: ControlGroup,box:BoxInterface, restartOnChange) {

        let group = parent.group(name, restartOnChange, false, false, true)

        ///////////// X
        let xOrigin=group.select("X origin", "left", [
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
        let xOffset=group.value("X offset", 0, -xMax, +xMax)

        //////////// Y
        let yOrigin=group.select("Y origin", "top", [
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
        let yOffset=group.value("Y offset", 0, -yMax, +yMax)

        group.onChange( ()=>
        {
            if (xOrigin.selected=="center")
                this.x=box.xMin+(Math.floor(xMax/2))+xOffset.value

            if (xOrigin.selected=="left")
                this.x=box.xMin+xOffset.value

            if (xOrigin.selected=="right")
                this.x=box.xMax+xOffset.value


            if (yOrigin.selected=="middle")
                this.y=box.yMin+(Math.floor(yMax/2))+yOffset.value

            if (yOrigin.selected=="top")
                this.y=box.yMin+yOffset.value

            if (yOrigin.selected=="bottom")
                this.y=box.yMax+yOffset.value


        })


    }




}