import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import DrawAsciiArt from "../../draw/DrawAsciiArt.js"
import {random} from "../../utils.js"
import FxMovie from "../../fx/FxMovie.js"
import FxRotate from "../../fx/FxRotate.js"
import Animator from "../../Animator.js"

let starAscii=[`
        ...
        .w.
        ...
    `,`
        .w.
        w.w
        .w.
    `,`
        .w.
        ...
        .w.
`]

export default class MovingStars extends Animator {

    static category = "Basic"
    static title = "Moving stars left"
    static description = "Used in nyancat :)"

    createStar(x,y, c)
    {
        let star = new PixelList()
        for (const ascii of starAscii)
            star.add(new DrawAsciiArt(x, y, c,ascii))
        return (star)
    }

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const starColorControl = controls.color("Star color", 255, 255, 255, 0.2);

        const stars=new PixelList()
        box.add(stars)

        const starsControl = controls.value("Number of stars", 10, 1, 100, 1, true)
        for (let i=0; i<starsControl.value; i++) {

            const x = random(0, box.xMax)
            const y = random(0, box.yMax)

            const star=this.createStar(x,y, starColorControl)

            new FxMovie(scheduler, controls, 5).run(star, stars, random(0,2))
            new FxRotate(scheduler, controls, -1,0, 4,2).run(star, box)

        }
    }
}
