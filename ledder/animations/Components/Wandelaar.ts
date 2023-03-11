import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import DrawAsciiArt from "../../draw/DrawAsciiArt.js"
import FxMovie from "../../fx/FxMovie.js"
import FxRotate from "../../fx/FxRotate.js"
import Animator from "../../Animator.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"


export default class Wandelaar extends Animator {
    static category = "Misc"
    static title = "Wandelaar"
    static description = "waarschijnlijk een Ado supporter. Hij loopt zijn neus achterna."

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, x = 0, y = 0) {


        const frames = new PixelList()
        frames.add(new DrawAsciiArtColor(x, y, `
        ..oooo..
        ..owbww.
        ..wwwr..
        ..yyyy..
        .y.yy.y.
        ...gg...
        ...gg...
        ...gg...
        `))
        frames.add(new DrawAsciiArtColor(x, y, `
        ..oooo..
        ..owbww.
        ..wwwr..
        .yyyyyyr
        ...yy...
        ...gg...
        ..g..g..
        ..g..g..
        `))
        frames.add(new DrawAsciiArtColor(x, y, `
        ..oooo..
        ..owbww.
        ..wwwr..
        ..yyyy..
        .y.yy.y.
        ...gg...
        ..g..g..
        .g....g.
        `))
        frames.add(new DrawAsciiArtColor(x, y, `
        ..oooo..
        ..owbww.
        ..wwwr..
        ...yy...
        ...yy...
        ...gg...
        ..g..g..
        ..g..g..
        `))
        frames.add(new DrawAsciiArtColor(x, y, `
        ..oooo..
        ..owbw
        ..wwwr..
        ..yyyy..
        .y.yy.y.
        ...gg...
        ...gg...
        ..g..g..
        `))
        
        frames.centerV(box)

        let wandelaarBox=new PixelBox(box)
        box.add( wandelaarBox)

        new FxMovie(scheduler, controls, 4, 0).run(frames,  wandelaarBox)

        new FxRotate(scheduler, controls, 1).run(frames,  wandelaarBox)


    }
}
