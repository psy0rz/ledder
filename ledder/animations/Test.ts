import Animation from "../Animation.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import Pixel from "../Pixel.js"
import Color from "../Color.js"
import FxRotate from "../fx/FxRotate.js"
import {random} from "../utils.js"
import PixelBox from "../PixelBox.js"

export default class Test extends Animation {
    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        // const c=controls.color("color")
        // display.add(new DrawBox(0,0,10, 5, c))
        // new FxRotate(scheduler, controls, 1, 1).run(display)
        // display.add(new Pixel(display.width-1,display.height-1,new Color(255,255,255)))
        //  display.add(new Pixel(display.width-1,display.height-1,new Color(55,12,80)))

        // display.add(new Pixel(30,display.height-1,new Color(55,12,80)))
        // display.add(new Pixel(display.width-2,display.height-2,new Color(255,255,255)))
        let y=random(box.xMin, box.yMax)
        let x=0
        setInterval( ()=>{
            box.add(new Pixel(x, y, new Color(255, 255, 0)))
            x++

        }, 1000)
        // display.add(new Pixel(0,0,new Color(55,12,80)))
        // display.add(new Pixel(1,0,new Color(0,0,0)))

//         let starAscii = [`
//         ...
//         .w.
//         ...
//     `, `
//         .w.
//         w.w
//         .w.
//     `, `
//         .w.
//         ...
//         .w.
// `]
//
//         display.add(new DrawAsciiArt(30, 4, colorRed,starAscii[1]))
//         new FxRotate(scheduler, controls, -1, 0).run(display)

        // for (let i=0; i<11;i++)
        // {
        //     box.add(new Pixel(random(0,75),random(0,7), new Color(random(0,255),random(0,255),random(0,255))))
        // }
        //
        // new FxRotate(scheduler, controls).run(box)

    }
}
