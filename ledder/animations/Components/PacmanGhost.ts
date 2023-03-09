import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import DrawAsciiArt from "../../draw/DrawAsciiArt.js"
import FxMovie from "../../fx/FxMovie.js"
import FxRotate from "../../fx/FxRotate.js"
import Animator from "../../Animator.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"


export default class PacmanGhost extends Animator {
    static category = "Misc"
    static title = "PacmanGhost"
    static description = "blabla"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, x = 0, y = 0) {


        const frames = new PixelList()
        frames.add(new DrawAsciiArtColor(x, y, `
        ...ww...
        ..wwww..
        .wwwwww.
        w.bww.bw
        w..ww..w
        wwwwwwww
        wwwwwwww
        w..ww..w
        `))
        frames.add(new DrawAsciiArtColor(x, y, `
        ...ww...
        ..wwww..
        .wwwwww.
        w.bww.bw
        w..ww..w
        wwwwwwww
        wwwwwwww
        ww.www.w
        `))
        frames.add(new DrawAsciiArtColor(x, y, `
        ...ww...
        ..wwww..
        .wwwwww.
        w..ww..w
        w.bww.bw
        wwwwwwww
        wwwwwwww
        w..ww..w
        `))
        frames.add(new DrawAsciiArtColor(x, y, `
        ...ww...
        ..wwww..
        .wwwwww.
        w..ww..w
        w.bww.bw
        wwwwwwww
        wwwwwwww
        w.w..w.w
        `))
        frames.add(new DrawAsciiArtColor(x, y, `
        ...ww...
        ..wwww..
        .wwwwww.
        w..ww..w
        w.bww.bw
        wwwwwwww
        wwwwwwww
        w..ww..w
        `))
        // frames.add(new DrawAsciiArt(3,display.height, colorGreen,`
        // ...yy...
        // .yyyyyy.
        // .yyyyyy.
        // yyyy....
        // yyyyy...
        // .yyyyyy.
        // .yyyyyy.
        // ...yy...
        // `))
        //
        // frames.add(new DrawAsciiArt(3,display.height-1, colorGreen,`
        // ..y.yyy..
        // .yy.yyyy
        // `))
        frames.centerV(box)

        let pacmanghostBox=new PixelBox(box)
        box.add(pacmanghostBox)

        new FxMovie(scheduler, controls, 4, 0).run(frames, pacmanghostBox)

        new FxRotate(scheduler, controls, 1).run(frames, pacmanghostBox)


    }
}
