import {Animation} from "../Animation.js";
import {AnimationMove} from "../AnimationMove.js";
import {Pixel} from "../Pixel.js";
import {Color} from "../Color.js";

import {Matrix} from "../Matrix.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import DrawAsciiArt from "../draw/DrawAsciiArt.js";
import FxWobble from "../fx/FxWobble.js";
import FxRotate from "../fx/FxRotate.js";
import {FxFadeOut} from "../fx/FxFadeOut.js";
import {calculateFireColors} from "../util.js";
import MovingStars from "./MovingStars.js";
import {PixelContainer} from "../PixelContainer.js";

//Nyancat, based on https://github.com/bertrik/nyancat/blob/master/nyancat.c


const fireColors=calculateFireColors()

export default class Nyancat extends Animation {

    static category = "Memes"
    static title = "Nyancat"
    static description = "Based on <a href='https://github.com/bertrik/nyancat/blob/master/nyancat.c'>this</a>"
    static presetDir = "Nyancat";


    async run(matrix: Matrix, scheduler: Scheduler, controls: ControlGroup) {

        let fadeFx = new FxFadeOut(scheduler, controls, 30, 4)

        // let stars = new MovingStars(parent);
        // stars.run(parent, scheduler, controls.group("Stars"))

        //the body and its wobblyness
        const body = new DrawAsciiArt( 6, 7, `
          .00000000.
          0ffffpfff0
          0fpffffff0
          0fffpffpf0
          0ffffffff0
          0fpffpfff0
          .00000000.
        `)
        new FxWobble(scheduler, controls.group("Wobble body"), 0, -1, 15).run(body)
        matrix.add(body)


        //the head and its wobblyness
        const head = new DrawAsciiArt(12, 8, `
          .00...00.
          .0500050.
          05w05w050
          050050050
          0p55555p0
          .0555550.
          ..00000..
        `)
        new FxWobble(scheduler, controls.group("Wobble head x"), 1, 0, 15, 10).run(head)
        new FxWobble(scheduler, controls.group("Wobble head y"), 0, 1, 15, 5).run(head)
        matrix.add(head)


        new FxRotate(scheduler, controls.group('Move'), 1, 0, 2).run(body, matrix.bbox())
        new FxRotate(scheduler, controls.group('Move'), 1, 0, 2).run(head, matrix.bbox())


        //rainbow :)
        let x = 6;
        let y = 2;
        const black = new Color(0, 0, 0);

        // const controlFade = controls.value("Rainbow fade speed", 30, 1, 120, 1);
        // const controlFadeRnd = controls.value("Rainbow fade randomizer", 0.1, 0, 0.5, 0.01);

        //wobble rainbow creation position
        scheduler.intervalControlled(controls.group('Wobble body').value('Interval'), () => {
            y = (y + 1) % 2;
            return true
        })


        //draw rainbow
        const xStepControl = controls.group('Move').value('X step')
        const flameControl = controls.switch("Flames", false, false)
        scheduler.intervalControlled(controls.group('Move').value('Interval'), () => {
            x = (x + xStepControl.value) % matrix.width;

            let colors
            if (flameControl.enabled) {

                colors = [
                    fireColors[10].copy(),
                    fireColors[60].copy(),
                    fireColors[100].copy(),
                    fireColors[80].copy(),
                    fireColors[60].copy(),
                    fireColors[30].copy(),
                ]
            } else {
                colors = [

                    new Color(0x80, 0x00, 0xff),
                    new Color(0x00, 0x80, 0xff),
                    new Color(0x00, 0xff, 0x00),
                    new Color(0xff, 0xff, 0x00),
                    new Color(0xff, 0x80, 0x00),
                    new Color(0xff, 0x00, 0x00),

                ]

            }

            for (let c = 0; c < 6; c++) {

                fadeFx.run(colors[c])
                matrix.add(new Pixel( x, c + y + 1, colors[c]))
            }
            return true

        })

    }
}
