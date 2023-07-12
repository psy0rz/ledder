import PixelBox from "../../PixelBox.js"
import Wandelaarster from "../Components/Wandelaarster.js"
import Wandelaar from "../Components/Wandelaar.js"
import Pacman from "../Components/Pacman.js"
import Ghost from "../Components/PacmanGhost.js"
import Fire from "../Fires/Fire.js"
import Starfield from "../Components/Starfield.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Landscape from "../Components/Landscape.js"






export default class Stampede extends Animator {
    static category = "Misc"
    static title = "Stampede"
    static description = "Help! a monster! Run as fast as you can"
 

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {     
        let wandelaarster = new Wandelaarster() 
        let wandelaar= new Wandelaar()
        let pacman=new Pacman()
        let ghost=new Ghost()
        let flames=new Fire();
        let starfield=new Starfield();
      
        let x=0;
        let y=0;
        if (box.height()>8) { y=box.height()-4}

        //let them run
        starfield.run(box, scheduler, controls) 
        flames.run(box, scheduler, controls) 
        wandelaarster.run(box, scheduler, controls,x-20,y) 
        wandelaar.run(box, scheduler, controls,x-30,y) 
        pacman.run(box, scheduler, controls,x-40,y) 
        ghost.run(box, scheduler, controls,x-50,y) 
       


    }
}
