import PixelBox from "../../PixelBox.js"
import Snow from "./Snow.js"
import XmasSantaReindeer from "./XmasSantaReindeer.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Text from "../Text/Marquee.js"







export default class Xmas extends Animator {
    static description = "composition"
 

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {     
        let snow = new Snow() 
        let santa= new XmasSantaReindeer()
        let textAnimation=new Text()
      
      
        let x=0;
        let y=0;
        if (box.height()>8) { y=box.height()-4}

        //let them run
        snow.run(box, scheduler, controls) 
        santa.run(box, scheduler, controls) 
        textAnimation.run(box, scheduler, controls) 
      
       


    }
}