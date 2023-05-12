import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"
import {random} from "../../utils.js"
import PixelList from "../../PixelList.js"
import Animator from "../../Animator.js"




export default class Landscape extends Animator {
    static category = "Misc"
    static title = "Landscape"
    static description = "blabla"


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        let seed=0;
        let width=box.width();
        let height=box.height();

  
        scheduler.intervalControlled(controls.value("Creation interval", 5), (frameNr) => {
            let x=frameNr%width;
            let y=0;
            for (let i=0;i<width;i++)
            {
                let s=(height/2)
                for (y=0;y<height;y++)
                {
                    let intensity=y*(255/height)
                    if (y>s)
                    {
                        box.add(new Pixel(i,y,new Color(0,intensity,0))) //ground
                    }
                    else
                    {
                        box.add(new Pixel(i,y,new Color(0,0,intensity))) //sky
                    }
                }
            }
          
           

        })

    }
}
