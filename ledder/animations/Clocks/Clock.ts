import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import DrawText, {type HorizontalAlign, type VerticalAlign} from "../../draw/DrawText.js"
import {fontSelect} from "../../fonts.js"

function pad(num: number): string {
    return num.toString().padStart(2, "0")
}

export default class Clock extends Animator {

    static description = "Simple digital clock showing the current time, meant to be used as a small text layer: one line of text at a chosen position, font and color."

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const timeColor = controls.color("Time color", 255, 255, 255)

        const font = fontSelect(controls, "Font")

        const positionControl = controls.position("Position", box, true, "center", 0, "middle", 0)

        const hAlignControl = controls.select("Horizontal align", "centered", [
            {id: "left", name: "Left"},
            {id: "centered", name: "Centered"},
            {id: "right", name: "Right"},
        ], true)

        const vAlignControl = controls.select("Vertical align", "middle", [
            {id: "top", name: "Top"},
            {id: "middle", name: "Middle"},
            {id: "bottom", name: "Bottom"},
        ], true)

        const hAlign = hAlignControl.selected as HorizontalAlign
        const vAlign = vAlignControl.selected as VerticalAlign

        positionControl.runAnchorMarker(scheduler, box)

        const use24Hour = controls.switch("24 hour", true, true).enabled
        const showLeadingZeroHour = controls.switch("Leading zero on hour", true, true).enabled
        const showSeconds = controls.switch("Show seconds", false, true).enabled
        const blinkColon = controls.switch("Blink colon", false, true).enabled
        const showAmPm = controls.switch("Show AM/PM", !use24Hour, true).enabled

        const textBox = new PixelBox(box)
        box.add(textBox)

        const draw = () => {
            const now = new Date()

            let hours = now.getHours()
            let amPm = ""
            if (!use24Hour) {
                amPm = hours >= 12 ? "PM" : "AM"
                hours = hours % 12
                if (hours === 0)
                    hours = 12
            }

            const colon = (!blinkColon || now.getSeconds() % 2 === 0) ? ":" : " "

            let text = showLeadingZeroHour ? pad(hours) : hours.toString()
            text += colon + pad(now.getMinutes())
            if (showSeconds)
                text += colon + pad(now.getSeconds())
            if (showAmPm)
                text += " " + amPm

            textBox.clear()
            textBox.add(new DrawText(positionControl.x, positionControl.y, font, text, timeColor, 1, undefined, hAlign, vAlign))
        }

        //draw immediately so the clock is visible on the very first frame, then keep it in sync with
        //the wall clock: interval() only fires after its first full interval has elapsed
        draw()
        scheduler.interval(scheduler.timeToFrames(1), draw)
    }
}
