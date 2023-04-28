import PixelBox from "../../PixelBox.js"
import Pacman from "../Components/Pacman.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import {animationRun} from "../../server/utils.js"
import Animator from "../../Animator.js"
import DrawAsciiArt from "../../draw/DrawAsciiArt.js"
import TheMatrix from "../MovieFx/TheMatrix.js"
import Starfield from "../Components/Starfield.js"



const logo = `
.#.#.
#####
.#.#.
#####.#..##.
.#.#.##.#..#
....#.#...#.
....####.#..
......#.####
`

export default class HSD extends Animator {


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const colorControl=controls.color("Logo color", 0x16,0x16,0x50)

        // new Starfield().run(box,scheduler,controls)

        new TheMatrix().run(box,scheduler, controls)

        const logoBox=new DrawAsciiArt(0,0, colorControl, logo).center(box)

        box.add(logoBox)






    }
}
