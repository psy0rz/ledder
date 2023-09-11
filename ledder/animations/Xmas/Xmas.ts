import PixelBox from "../../PixelBox.js"
import Snow from "../Components/Snow.js"
import XmasSantaReindeer from "./XmasSantaReindeer.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Marquee from "../Text/Marquee.js"







export default class Xmas extends Animator {
    static category = "XMAS"
    static title = "XMAS"
    static description = "composition"
 

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {     
        let snow = new Snow() 
        let santa= new XmasSantaReindeer()
        let marquee=new Marquee()
      
      
        let x=0;
        let y=0;
        if (box.height()>8) { y=box.height()-4}

        //let them run
        snow.run(box, scheduler, controls) 
        santa.run(box, scheduler, controls) 
        marquee.run(box, scheduler, controls) 
      
       


    }
}