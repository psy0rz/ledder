

//Nyancat, based on https://github.com/bertrik/nyancat/blob/master/nyancat.c




import PixelBox from "../../PixelBox.js"
import MovingStars from "../Components/MovingStars.js"
import PixelList from "../../PixelList.js"
import FxRotate from "../../fx/FxRotate.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"
import FxWobble from "../../fx/FxWobble.js"
import {FxFadeOut} from "../../fx/FxFadeOut.js"
import FxColorCycle from "../../fx/FxColorCycle.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"


export default class Nyancat extends Animator {

    static category = "Memes"
    static title = "Nyancat"
    static description = "Based on <a href='https://github.com/bertrik/nyancat/blob/master/nyancat.c'>this</a>"


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        controls.group("Rainbow")
        let fireGroup=controls.group("Fire", true,true,true)

        //start with the stars in the background
        let stars = new MovingStars();
        stars.run(box, scheduler, controls.group("Stars"))

        //move the whole cat (will add pixels later)
        let cat = new PixelList()
        new FxRotate(scheduler, controls.group('Move',true), 1, 0, 2).run(cat, box)
        box.add(cat)

        const rainbowContainer=new PixelList()
        box.add(rainbowContainer)

        //the body and its wobblyness
        const body = new DrawAsciiArtColor(6, 1, `
          .00000000.
          0ffffpfff0
          0fpffffff0
          0fffpffpf0
          0ffffffff0
          0fpffpfff0
          .00000000.
        `)
        let wobbleBoxyFx=new FxWobble(scheduler, controls.group("Wobble body", false, true), 0,0,2,1)
        wobbleBoxyFx.run(body)
        cat.add(body)


        //the head and its wobblyness
        const head = new DrawAsciiArtColor(12, 1, `
          .00...00.
          .0500050.
          05w05w050
          050050050
          0p55555p0
          .0555550.
          ..00000..
        `)
        new FxWobble(scheduler, controls.group("Wobble head", false, true), 2, 1, 2, 1, -90).run(head)
        cat.add(head)


        //rainbow :)
        let x = 6;
        let y = 2;



        //draw rainbow or fire
        let fadeFx = new FxFadeOut(scheduler, controls.group("Rainbow"), 40, 4)
        let cycleFx = new FxColorCycle(scheduler, controls.group("Fire"), "reverse", 50, 4, 1)

        const xStepControl = controls.group('Move').value('Rotate X step')
        scheduler.intervalControlled(controls.group('Move').value('Rotate interval'), () => {
            x = (x + xStepControl.value) % box.width();

            if (fireGroup.enabled) {

                let intensity=[
                    50,
                    25,
                    0,
                    10,
                    25,
                    50
                ]

                for (let c = 0; c < 6; c++) {

                    const p = new Pixel(x+wobbleBoxyFx.xOffset, c + y - 1+wobbleBoxyFx.yOffset,  new Color())
                    rainbowContainer.add(p)
                    cycleFx.run( p.color, intensity[c])
                        .then(() => {
                            rainbowContainer.delete(p)
                        })
                }

            } else {
                let colors = [
                    new Color(0x80, 0x00, 0xff),
                    new Color(0x00, 0x80, 0xff),
                    new Color(0x00, 0xff, 0x00),
                    new Color(0xff, 0xff, 0x00),
                    new Color(0xff, 0x80, 0x00),
                    new Color(0xff, 0x00, 0x00),
                ]

                //adjust times to get a nice pointy tail
                let fadeTimes=[
                    -20,
                    -10,
                    -5,
                    0,
                    -10,
                    -20
                ]

                for (let c = 0; c < 6; c++) {

                    const p = new Pixel(x+wobbleBoxyFx.xOffset, c + y -1+wobbleBoxyFx.yOffset, colors[c])
                    rainbowContainer.add(p)
                    fadeFx.run(colors[c], fadeTimes[c])
                        .then(() => {
                            rainbowContainer.delete(p)
                        })
                }
            }
            return true

        })
    }
}
