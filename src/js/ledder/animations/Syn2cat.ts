import {Animation} from "../Animation.js";
import {Display} from "../Display.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import DrawAsciiArtColor from "../draw/DrawAsciiArtColor.js"

export default class Template extends  Animation
{
    static category = "Misc"
    static title = "Syn2cat"
    static description = "blabla"
    static presetDir = "Syn2cat";

    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {

        const t=new DrawAsciiArtColor(1,display.height-1, `
        .www.w..w.www........www.www..w..........
        w....w..a.w..w......w.......w.www........
        .ww...www.w..w.aww..w.....aww.w............
        ...w....w.a..w....w.w....w..w.w..a..............
        wwa...ww..w..w..ww...aww..www..ww................
        ...............w....................................
        ...............wwww.................................

        `)

        t.center(display)
        display.add(t)

    }
}
