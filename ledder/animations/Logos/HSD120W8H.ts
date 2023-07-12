import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import PixelList from "../../PixelList.js"
import DrawHeadlines from "../Text/Headlines.js"
import Clock from "../Components/Clock.js"
import MQTTClimate from "../MQTTclimate.js"
import FxMovie from "../../fx/FxMovie.js"
import Color from "../../Color.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"
import DrawText from "../../draw/DrawText.js"






const hsdLogo70W8H =`
rr.rr.rr......................................................................rr.rr.rr..............................................
rr.rr.rr..w...w.wwwww.wwwww.w..w..wwwww.wwwww.wwwww.wwwww.wwwww.wwwww.wwwww...rr.rr.rr...www...wwwww.wwwww.wwwww.wwwww.w...w.wwwww..
.rrrrrr...w...w.w...w.w.....w.w...w.....w...w.w.....w...w.w...w.w.....w........rrrrrr....w..w..w...w.w.....w...w...w...w...w.w......
.rrrrrr...wwwww.wwwww.w.....ww....wwww..wwwww.wwwww.wwwww.wwwww.w.....wwww.....rrrrrr....w...w.wwwww.wwww..w...w...w...wwwww.wwww...
.rrrrrr...w...w.w...w.w.....w.w...w.....w.w.......w.w.....w...w.w.....w........rrrrrr....w...w.w.w...w.....w...w...w...w...w.w......
.rr..rr...w...w.w...w.w.....w..w..w.....w..w......w.w.....w...w.w.....w........rr..rr....w...w.w..w..w.....w...w...w...w...w.w......
rrr..rrr..w...w.w...w.wwwww.w...w.wwwww.w...w.wwwww.w.....w...w.wwwww.wwwww...rrr..rrr...wwwww.w...w.wwwww.w...w...w...w...w.wwwww..
rrr..rrr......................................................................rrr..rrr..............................................
`



 



export default class HSD64W20H extends Animator {
    static category = "Logos"
    static title = "hackerspace drenthe"
    static description = "Large horizontal logo scroller. 8 Pixels height"
    

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup,y:number=Math.round(box.height()-8)/2) 
    {
        
     
        function playHorizontalLogo(width:number,y:number)
        {
            let pl=new PixelList();
            let logowidth=(hsdLogo70W8H.length/8)
            let groundx=140-(logowidth-Math.round((time)/2)%(logowidth*2))
    
           pl.add(new DrawAsciiArtColor(Math.round(1-groundx),y, hsdLogo70W8H))
           pl.add(new DrawAsciiArtColor(Math.round(1-groundx)+logowidth,y, hsdLogo70W8H))
           pl.add(new DrawAsciiArtColor(Math.round(1-groundx)+logowidth*2,y, hsdLogo70W8H))
            return pl
        }

        let time=0
        const intervalControl = controls.value("Animation interval", 1, 1, 10, 0.1)
        const speedControl = controls.value("Time divider", 10, 1, 100, 1)
        let logoList=new PixelList()
        box.add(logoList) 
       
       scheduler.intervalControlled(intervalControl, (frameNr) => {
       
            logoList.clear()
            time=time+1
            
            logoList.add(playHorizontalLogo(box.width(),y))

        

       });
       
    }

    
}
