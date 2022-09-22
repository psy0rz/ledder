import Animation from "../Animation.js";
import Pixel from "../Pixel.js";
import Color from "../Color.js";

import Display from "../Display.js";
import Scheduler from "../Scheduler.js";
import ControlGroup from "../ControlGroup.js";
import FxWobble from "../fx/FxWobble.js";
import FxRotate from "../fx/FxRotate.js";
import {FxFadeOut} from "../fx/FxFadeOut.js";
import DrawAsciiArtColor from "../draw/DrawAsciiArtColor.js";
import PixelContainer from "../PixelContainer.js";
import MovingStars from "./MovingStars.js";
import FxColorCycle from "../fx/FxColorCycle.js";

//Nyancat, based on https://github.com/bertrik/nyancat/blob/master/nyancat.c




export default class Nyancat extends Animation {

    static category = "Memes"
    static title = "Nyancat"
    static description = "Based on <a href='https://github.com/bertrik/nyancat/blob/master/nyancat.c'>this</a>"


    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {

        controls.group("Rainbow")
        controls.group("Fire")

        //start with the stars in the background
        let stars = new MovingStars();
        stars.run(display, scheduler, controls.group("Stars"))

        //move the whole cat (will add pixels later)
        let cat = new PixelContainer()
        new FxRotate(scheduler, controls.group('Move',true), 1, 0, 2).run(cat, display.bbox())
        display.add(cat)

        const rainbowContainer=new PixelContainer()
        display.add(rainbowContainer)

        //the body and its wobblyness
        const body = new DrawAsciiArtColor(6, 7, `
          .00000000.
          0ffffpfff0
          0fpffffff0
          0fffpffpf0
          0ffffffff0
          0fpffpfff0
          .00000000.
        `)
        new FxWobble(scheduler, controls.group("Wobble body", false, true), 0, -1, 15).run(body)
        cat.add(body)


        //the head and its wobblyness
        const head = new DrawAsciiArtColor(12, 8, `
          .00...00.
          .0500050.
          05w05w050
          050050050
          0p55555p0
          .0555550.
          ..00000..
        `)
        new FxWobble(scheduler, controls.group("Wobble head x", false, true), 1, 0, 15, 10).run(head)
        new FxWobble(scheduler, controls.group("Wobble head y", false, true), 0, 1, 15, 5).run(head)
        cat.add(head)


        //rainbow :)
        let x = 6;
        let y = 2;


        //wobble rainbow creation position (get value from wobble body)
        scheduler.intervalControlled(controls.group('Wobble body').value('Wobble interval'), () => {
            y = (y + 1) % 2;
            return true
        })

        //draw rainbow or fire
        let fadeFx = new FxFadeOut(scheduler, controls.group("Rainbow"), 40, 4)
        const fireControl = controls.group("Fire").switch("Use fire", false, false)
        let cycleFx = new FxColorCycle(scheduler, controls.group("Fire"), "reverse", 50, 4, 1)

        const xStepControl = controls.group('Move').value('Rotate X step')
        scheduler.intervalControlled(controls.group('Move').value('Rotate interval'), () => {
            x = (x + xStepControl.value) % display.width;

            if (fireControl.enabled) {

                let skips=[
                    50,
                    25,
                    0,
                    10,
                    25,
                    50
                ]

                for (let c = 0; c < 6; c++) {

                    const p = new Pixel(x, c + y + 1,  new Color())
                    rainbowContainer.add(p)
                    cycleFx.run( p.color, skips[c])
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

                    const p = new Pixel(x, c + y + 1, colors[c])
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
