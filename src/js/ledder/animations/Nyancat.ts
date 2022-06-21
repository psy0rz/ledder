import {Animation} from "../Animation.js";
import AnimationMovingStarsL from "./AnimationMovingStarsL.js";
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

//Nyancat, based on https://github.com/bertrik/nyancat/blob/master/nyancat.c


const fireColors=calculateFireColors()

export default class Nyancat extends Animation {

    static category = "Memes"
    static title = "Nyancat"
    static description = "Based on <a href='https://github.com/bertrik/nyancat/blob/master/nyancat.c'>this</a>"
    static presetDir = "Nyancat";


    async run(matrix: Matrix, scheduler: Scheduler, controls: ControlGroup) {

        let fadeFx = new FxFadeOut(matrix, controls, 30, 4)

        let stars = new AnimationMovingStarsL(matrix);
        stars.run(matrix, scheduler, controls.group("Stars"))


        //the body and its wobblyness
        const body = new DrawAsciiArt(matrix, 6, 7, `
          .00000000.
          0ffffpfff0
          0fpffffff0
          0fffpffpf0
          0ffffffff0
          0fpffpfff0
          .00000000.
        `)
        new FxWobble(matrix, controls.group("Wobble body"), 0, -1, 15).run(body)


        //the head and its wobblyness
        const head = new DrawAsciiArt(matrix, 12, 8, `
          .00...00.
          .0500050.
          05w05w050
          050050050
          0p55555p0
          .0555550.
          ..00000..
        `)
        new FxWobble(matrix, controls.group("Wobble head x"), 1, 0, 15, 10).run(head)
        new FxWobble(matrix, controls.group("Wobble head y"), 0, 1, 15, 5).run(head)


        new FxRotate(matrix, controls.group('Move'), 1, 0, 2).run(body, matrix.bbox())
        new FxRotate(matrix, controls.group('Move'), 1, 0, 2).run(head, matrix.bbox())


        //rainbow :)
        let x = 6;
        let y = 2;
        const black = new Color(0, 0, 0);

        // const controlFade = controls.value("Rainbow fade speed", 30, 1, 120, 1);
        // const controlFadeRnd = controls.value("Rainbow fade randomizer", 0.1, 0, 0.5, 0.01);

        //wobble rainbow creation position
        matrix.scheduler.intervalControlled(controls.group('Wobble body').value('Interval'), () => {
            y = (y + 1) % 2;
            return true
        })


        //draw rainbow
        const xStepControl = controls.group('Move').value('X step')
        const flameControl = controls.switch("Flames", false, false)
        matrix.scheduler.intervalControlled(controls.group('Move').value('Interval'), () => {
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
                new Pixel(matrix, x, c + y + 1, colors[c])
            }
            return true

        })

    }
}
