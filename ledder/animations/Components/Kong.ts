import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import DrawAsciiArt from "../../draw/DrawAsciiArt.js"
import FxMovie from "../../fx/FxMovie.js"
import FxRotate from "../../fx/FxRotate.js"
import Animator from "../../Animator.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"


export default class Kong extends Animator {
    static category = "Misc"
    static title = "Kong"
    static description = "The ugly friend of Donkey Kong"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, x = 0, y = 0) {


        const frames = new PixelList()
        frames.add(new DrawAsciiArtColor(x, y, `
        ........oooooooo........
        .....ooo..oooo..ooo.....
        .oooooo.y.0oo0.y.oooooo.
        oooo.oooooottoooooo.oooo
        oooo.oowrwrwrwrwroo.oooo
        oooo.ooo........ooo.oooo
        oooo.oowrwrwrwrwroo.oooo
        oooo..ooooooooooooo.oooo
        .ooto.oooooooooooo.otoo.
        ..t0t.oooooooooooo.t0t..
        ......oooooooooooo......
        ......oooo....oooo......
        ......oooooo..oooooo....
        `)),
      


        frames.add(new DrawAsciiArtColor(x, y, `
        ........oooooooo........
        .....ooo..oooo..ooo.....
        .oooooo.y.0oo0.y.oooooo.
        oooo.oooooottoooooo.oooo
        oooo.oowrwrwrwrwroo.oooo
        oooo.ooo........ooo.oooo
        oooo.oowrwrwrwrwroo.oooo
        oooo..ooooooooooooo.oooo
        .ooto.oooooooooooo.otoo.
        ..t0t.oooooooooooo.t0t..
        ......oooooooooooo......
        ........oooo....oooo....
        ........oooooo..oooooo..
        `)),

        frames.add(new DrawAsciiArtColor(x, y, `
        ........oooooooo........
        .....ooo..oooo..ooo.....
        .oooooo..y0oo0y..oooooo.
        oooo.oooooottoooooo.oooo
        oooo.oowrwrwrwrwroo.oooo
        oooo.ooo........ooo.oooo
        oooo.ooo........ooo.oooo
        oooo..owrwrwrwrwwoo.oooo
        .ooto.oooooooooooo.otoo.
        ..t0t.oooooooooooo.t0t..
        ......oooooooooooo......
        ......oooo....oooo......
        ......ooooo...oooooo....
        `)),
      


        frames.add(new DrawAsciiArtColor(x, y, `
        ........oooooooo........
        .....ooo..oooo..ooo.....
        .oooooo..y0oo0y..oooooo.
        oooo.oooooottoooooo.oooo
        oooo.oowrwrwrwrwroo.oooo
        oooo.ooo........ooo.oooo
        oooo.ooo........ooo.oooo
        oooo..owrwrwrwrwroo.oooo
        .ooto.oooooooooooo.otoo.
        ..t0t.oooooooooooo.t0t..
        ......oooooooooooo......
        .......ooo.....ooo.....
        .......oooooo..oooooo..
        `)),
     
        
        frames.centerV(box)

        let spriteBox=new PixelBox(box)
        box.add( spriteBox)

        new FxMovie(scheduler, controls, 4, 0).run(frames,  spriteBox)

        new FxRotate(scheduler, controls, 1).run(frames, spriteBox)


    }
}
