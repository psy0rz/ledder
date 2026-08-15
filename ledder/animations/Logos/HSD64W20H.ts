import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import PixelList from "../../PixelList.js"
import Clock from "../Clocks/Clock.js"
import MQTTClimate from "../Remote/MQTTclimate.js"
import FxMovie from "../../fx/FxMovie.js"
import Color from "../../Color.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"
import DrawText from "../../draw/DrawText.js"
import FxRotate from "../../fx/FxRotate.js"







const hsdLogo64W32H=`
........................rrrr..rrrr..rrrr.........................
........................rrrr..rrrr..rrrr.........................
..........................rrrrrrrrrrrr...........................
..........................rrrrrrrrrrrr...........................
..........................rrrrrrrrrrrr...........................
..........................rrrrrrrrrrrr...........................
..........................rrrrrrrrrrrr...........................
..........................rrrrrrrrrrrr...........................
..........................rrrr....rrrr...........................
..........................rrrr....rrrr...........................
..........................rrrr....rrrr...........................
..........................rrrr....rrrr...........................
........................rrrrrr....rrrrrr.........................
........................rrrrrr....rrrrrr.........................
.................................................................
w...w.wwwww.wwwww.w..w..wwwww.wwwww.wwwww.wwwww.wwwww.wwwww.wwwww
w...w.w...w.w.....w.w...w.....w...w.w.....w...w.w...w.w.....w....
wwwww.wwwww.w.....ww....wwww..wwwww.wwwww.wwwww.wwwww.w.....wwww.
w...w.w...w.w.....w.w...w.....w.w.......w.w.....w...w.w.....w....
w...w.w...w.w.....w..w..w.....w..w......w.w.....w...w.w.....w....
w...w.w...w.wwwww.w...w.wwwww.w...w.wwwww.w.....w...w.wwwww.wwwww
.................................................................
...................rr..rrr.rrr.rrr.rrr.r.r.rrr...................
...................r.r.r...r...r.r..r..r.r.r.....................
.rrrrrrrrrrrrrrrr..r.r.r...rr..r.r..r..rrr.rr...rrrrrrrrrrrrrrrr.
...................r.r.r...r...r.r..r..r.r.r.....................
...................rrr.r...rrr.r.r..r..r.r.rrr...................
`


 



export default class HSD64W20H extends Animator {
    static title = "hackerspace drenthe"
    static description = "Large vertical logo scroller for big screens (64 pixels width)"
    

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup)
    {
        let x = (box.width() - 64) / 2
        if (x < 0) { x = 0 }

        //logo enters from just below the box and scrolls up; the wrap bbox is tall enough
        //(box height + gap on both ends) that it's fully off-screen before it teleports back
        const startY = box.yMin + box.height()
        const wrapBbox = {
            xMin: box.xMin,
            xMax: box.xMax,
            yMin: box.yMin - box.height() - 10,
            yMax: startY,
        }

        const logo = new DrawAsciiArtColor(x, startY, hsdLogo64W32H)
        box.add(logo)

        new FxRotate(scheduler, controls, 0, -1, 2, 0).run(logo, wrapBbox)
    }

    
}
