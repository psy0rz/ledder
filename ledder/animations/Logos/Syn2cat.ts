import Animation from "Animation.js";
import Scheduler from "Scheduler.js";
import ControlGroup from "ControlGroup.js";
import DrawAsciiArtColor from "draw/DrawAsciiArtColor.js"
import PixelBox from "PixelBox.js"

export default class Syn2Cat extends  Animation
{
    static category = "Logos"
    static title = "Syn2cat"
    static description = "syn2cat.lu"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const t=new DrawAsciiArtColor(1,box.height()-1, `
        .www.w..w.www........www.www..w..........
        w....w..a.w..w......w.......w.www........
        .ww...www.w..w.aww..w.....aww.w............
        ...w....w.a..w....w.w....w..w.w..a..............
        wwa...ww..w..w..ww...aww..www..ww................
        ...............w....................................
        ...............wwww.................................

        `)

        t.center(box)
        box.add(t)

    }
}
