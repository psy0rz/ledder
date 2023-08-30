import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Clock from "../Components/Clock.js"
import HSD120W8H from "../Logos/HSD120W8H.js"
import HSD64W20H from "../Logos/HSD64W20H.js"
import MQTTClimate from "../MQTTclimate.js"
import Headlines from "../Text/Headlines.js"





export default class Hackerspacedrenthe extends Animator {
    static category = "Gamesdemos"
    static title = "hackerspace drenthe"
    static description = "Multiple widgets smashed into 1 panel"
    

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) 
    {
        
        let time=0  
        let headlines=new Headlines()
        let sensors=new MQTTClimate()
        let hsdIntro=new HSD64W20H()
        let hsdScroller=new HSD120W8H()
          
        let introBox=new PixelBox(box);
        let newsBox=new PixelBox(box);

        let sensorBox=new PixelBox(box);
        let logoscrollerBox=new PixelBox(box);
    
        box.add(introBox) 
        box.add(logoscrollerBox)
        box.add(newsBox)
        //box.add(clockBox)
        box.add(sensorBox)

        const intervalControl = controls.value("Animation interval", 1, 1, 10, 0.1)

        hsdIntro.run(box,scheduler,controls)
        hsdScroller.run(logoscrollerBox,scheduler,controls,0)
        headlines.run(newsBox,scheduler,controls,0,8,box.width()/2,8,[])
        //clock.run(clockBox,scheduler,controls,0,0)
        sensors.run(sensorBox,scheduler,controls,0,8)

       scheduler.intervalControlled(intervalControl, (frameNr) => {
            //box.clear()
     
            time=time+1
        
            if (time<500)
            {
                newsBox.clear()
                sensorBox.clear()
                //clockBox.clear()
                logoscrollerBox.clear();
            }
            else
            {
                introBox.clear()
            }

            if (time<5000)
            {
                sensorBox.clear()
            }
            else
            {
                newsBox.clear()
            }


            if (time>8000)
            {
                time=0
            }

       });
       
    }

    
}
