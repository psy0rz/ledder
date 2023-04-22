import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import DrawAsciiArt from "../../draw/DrawAsciiArt.js"
import FxMovie from "../../fx/FxMovie.js"
import FxRotate from "../../fx/FxRotate.js"
import Animator from "../../Animator.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"
import {fonts, fontSelect} from "../../fonts.js"
import DrawCounter from "../../draw/DrawCounter.js"
import DrawText from "../../draw/DrawText.js"


export default class Clock extends Animator {
    static category = "Misc"
    static title = "Pacman"
    static description = "blabla"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, x = 0, y = 0) 
    {
      
        const colorControl = controls.color("Text color", 0, 255, 0);
        const clockIntervalControl = controls.value("Fractal interval", 1, 1, 10, 0.1);
        scheduler.intervalControlled(clockIntervalControl, (frameNr) => {
            box.clear()
            fonts.Picopixel.load()
            let time=new Date()
            let timestring=""
            let minutes="00"+time.getMinutes().toString()
            let hours="00"+time.getHours().toString()
            let seconds="00"+time.getSeconds().toString()
            if (box.width()<40)
            {
                //seconds dont fit on a 32 pixel screen
                timestring=hours.substring(hours.length-2,hours.length)+":"+minutes.substring(minutes.length-2,minutes.length)
            }
            else
            {
                timestring=hours.substring(hours.length-2,hours.length)+":"+minutes.substring(minutes.length-2,minutes.length)+":"+seconds.substring(seconds.length-2,seconds.length)
            }
            const text = new DrawText(0, 0, fontSelect(controls),timestring , colorControl).centerH(box)
            box.add(text)
            text.center(box)
        });
       
    }
}
