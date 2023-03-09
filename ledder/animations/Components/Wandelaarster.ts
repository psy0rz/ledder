import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import DrawAsciiArt from "../../draw/DrawAsciiArt.js"
import FxMovie from "../../fx/FxMovie.js"
import FxRotate from "../../fx/FxRotate.js"
import Animator from "../../Animator.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"


export default class Wandelaarster extends Animator {
    static category = "Misc"
    static title = "Wandelaar female"
    static description = "Walking female"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, x = 0, y = 0) {


        const frames = new PixelList()
        frames.add(new DrawAsciiArtColor(x, y, `
        ...yyy..
        ..yywbw.
        ..ywww..
        ..yff...
        ...ffff.
        ...ff...
        ..ffff..
        ...gg...
        `))
        frames.add(new DrawAsciiArtColor(x, y, `
        ...yyy..
        ..yywbw.
        ..ywww..
        ..yff...
        ...ffff.
        ...ff...
        ..ffff..
        ..g..g..
        `))
        frames.add(new DrawAsciiArtColor(x, y, `
        ...yyy..
        ..yywbw.
        ..ywww..
        ..yff...
        ...ffff.
        ...ff...
        ..ffff..
        ...gg...
        `))
        frames.add(new DrawAsciiArtColor(x, y, `
        ...yyy..
        ..yywbw.
        ..ywww..
        ..yff...
        ...ffff.
        ...ff...
        ..ffff..
        ..g..g..
        `))
        frames.add(new DrawAsciiArtColor(x, y, `
        ...yyy..
        ..yywbw.
        ..ywww..
        ..yff...
        ...ffff.
        ...ff...
        ...ff...
        ...g.g..
        `))
        
        frames.centerV(box)

        let wandelaarBox=new PixelBox(box)
        box.add( wandelaarBox)

        new FxMovie(scheduler, controls, 4, 0).run(frames,  wandelaarBox)

        new FxRotate(scheduler, controls, 1).run(frames,  wandelaarBox)


    }
}
