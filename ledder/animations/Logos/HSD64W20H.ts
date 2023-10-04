import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import PixelList from "../../PixelList.js"
import DrawHeadlines from "../Text/Headlines.js"
import Clock from "../ReinsCollection/Clock.js"
import MQTTClimate from "../ReinsCollection/MQTTclimate.js"
import FxMovie from "../../fx/FxMovie.js"
import Color from "../../Color.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"
import DrawText from "../../draw/DrawText.js"







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
    static category = "Logos"
    static title = "hackerspace drenthe"
    static description = "Large vertical logo scroller for big screens (64 pixels width)"
    

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) 
    {
        
     
        function putLogo(x:number,y:number)
        {
            return new DrawAsciiArtColor(x,y, hsdLogo64W32H)
        }

        let time=0
        const intervalControl = controls.value("Animation interval", 1, 1, 10, 0.1)
        const speedControl = controls.value("Time divider", 10, 1, 100, 1)
        let logoList=new PixelList()
        box.add(logoList) 
       
       scheduler.intervalControlled(intervalControl, (frameNr) => {
       
            logoList.clear()
            time=time+1

            let x=(box.width()-64)/2
            if (x<0) {x=0}
            
            let y=box.height()-(time/speedControl.value)
            
            logoList.add(putLogo(x,y))

            if (y< (-1*box.height())-20)
            {
                time=0
            }

       });
       
    }

    
}
