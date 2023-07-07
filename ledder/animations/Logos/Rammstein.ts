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



const hack = `
#...#..###...###.#...#..........
#...#.#...#.#....#...#..........
#...#.#...#.#....#..#...........
#####.#####.#....###............
#...#.#...#.#....#..#...........
#...#.#...#.#....#...#..........
#...#.#...#..###.#...#..........
`


const _42 = `
................................
................................
.........................#...##.
........................##..#..#
.......................#.#....#.
.......................####..#..
.........................#..####

`


export default class HSD extends Animator {


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const colorHack=controls.color("Hack color", 0x16,0x16,0x50)
        const color42=controls.color("42 color",  0x82,0x82,0xa1)

        // new Starfield().run(box,scheduler,controls)

        new TheMatrix().run(box,scheduler, controls)

        box.add(new DrawAsciiArt(0,0, colorHack, hack))
        box.add(new DrawAsciiArt(0,0, color42, _42))


    }
}
