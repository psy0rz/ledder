import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import PixelList from "../../PixelList.js"
import Color from "../../Color.js"

/**
 * Shared drawing canvas: GUI clients draw pixels in realtime via animationEvents.
 * All clients monitoring the same display draw on the same canvas.
 *
 * Events (send via the "animationEvent" RPC notification):
 *  "draw"  {cells: [{x,y}, ...], color: {r,g,b}}
 *  "erase" {cells: [{x,y}, ...]}
 *  "clear"
 */
export default class DrawPad extends Animator {
    static category = "Games"
    static title = "Draw pad"
    static description = "Draw on the display in realtime via the web GUI"

    private drawing: PixelList
    private cells: Map<string, Pixel>

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        this.cells = new Map()
        this.drawing = new PixelList()
        box.add(this.drawing)
    }

    private setCell(box: PixelBox, x: number, y: number, color: Color) {
        x = ~~x
        y = ~~y
        if (x < box.xMin || x > box.xMax || y < box.yMin || y > box.yMax)
            return

        const key = x + "," + y
        const existing = this.cells.get(key)
        if (existing !== undefined) {
            existing.color = color
        } else {
            const pixel = new Pixel(x, y, color)
            this.cells.set(key, pixel)
            this.drawing.add(pixel)
        }
    }

    private eraseCell(x: number, y: number) {
        const key = ~~x + "," + ~~y
        const pixel = this.cells.get(key)
        if (pixel !== undefined) {
            this.cells.delete(key)
            this.drawing.delete(pixel)
        }
    }

    animationEvent(name: string, data: any, box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        switch (name) {
            case "draw":
                for (const cell of data.cells)
                    //each cell gets its own Color copy, so effects can later animate pixels individually
                    this.setCell(box, cell.x, cell.y, new Color(data.color.r, data.color.g, data.color.b,data.color.a))
                break
            case "erase":
                for (const cell of data.cells)
                    this.eraseCell(cell.x, cell.y)
                break
            case "clear":
                this.cells.clear()
                this.drawing.clear()
                break
            default:
                super.animationEvent(name, data, box, scheduler, controls)
        }
    }
}
