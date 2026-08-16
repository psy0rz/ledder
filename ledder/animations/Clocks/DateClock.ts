import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import DrawText, {type HorizontalAlign, type VerticalAlign} from "../../draw/DrawText.js"
import Pixel from "../../Pixel.js"
import {fontSelect} from "../../fonts.js"
import {colorRed, colorWhite} from "../../Colors.js"

const weekdayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const weekdayNamesLong = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const monthNamesLong = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

function pad(num: number): string {
    return num.toString().padStart(2, "0")
}

//longest tokens first, so e.g. "dddd" isn't partially matched as "ddd" + "d"
const formatTokens = /YYYY|YY|MMMM|MMM|MM|M|dddd|ddd|DD|D/g

function formatDate(date: Date, format: string): string {
    return format.replace(formatTokens, (token) => {
        switch (token) {
            case "YYYY":
                return date.getFullYear().toString()
            case "YY":
                return pad(date.getFullYear() % 100)
            case "MMMM":
                return monthNamesLong[date.getMonth()]
            case "MMM":
                return monthNamesShort[date.getMonth()]
            case "MM":
                return pad(date.getMonth() + 1)
            case "M":
                return (date.getMonth() + 1).toString()
            case "dddd":
                return weekdayNamesLong[date.getDay()]
            case "ddd":
                return weekdayNamesShort[date.getDay()]
            case "DD":
                return pad(date.getDate())
            case "D":
                return date.getDate().toString()
            default:
                return token
        }
    })
}

export default class DateClock extends Animator {

    static description = "Simple digital date display, meant to be used as a small text layer: one line of text at a chosen position, font and color, with a configurable date format."

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const dateColor = controls.color("Date color", 255, 255, 255)

        const font = fontSelect(controls, "Font")

        const formatControl = controls.input("Format", "ddd DD-MM-YYYY", true)

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

        if (controls.group("Position").switch("Show anchor", false, true).enabled) {
            const anchorColor = colorWhite.copy()
            box.add(new Pixel(positionControl.x, positionControl.y, colorRed))
            box.add(new Pixel(positionControl.x, positionControl.y, anchorColor))
            scheduler.interval(15, () => {
                anchorColor.a = anchorColor.a ? 0 : 1
            })
        }

        const textBox = new PixelBox(box)
        box.add(textBox)

        const draw = () => {
            const text = formatDate(new Date(), formatControl.text)

            textBox.clear()
            textBox.add(new DrawText(positionControl.x, positionControl.y, font, text, dateColor, 1, box.width()-positionControl.x, hAlign, vAlign))
        }

        //draw immediately so the date is visible on the very first frame, then keep it in sync with
        //the wall clock: interval() only fires after its first full interval has elapsed
        draw()
        scheduler.interval(scheduler.timeToFrames(60), draw)
    }
}
