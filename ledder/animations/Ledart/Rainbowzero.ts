import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"


export default class Rainbowzero extends Animator {
    static category = "Ledart"
    static title = "Rainbowzero"
    static description = "blabla"


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) 
    {
        const alphaControls =controls.value("alpha/brightness",0.9,0.1,0.9,0.1)
        const intervalControl = controls.value("Fractal interval", 1, 1, 10, 0.1)
        let teller=0;
 

        scheduler.intervalControlled(intervalControl, (frameNr) => {
           box.clear()
           let x=0;
           let y=0;
           let rShade=0;
           let bShade=0;
           let gShade=0;
           let divider=1;
           let dividerD=0.005
           teller++
           for (let x=0;x<(box.width()+1);x++)
           {
              for (let y=0;y<(box.height()+1);y++)
              {
               
                    let speed=10;
                    let colorDivider=1;
                    divider=divider+dividerD;
                    if (divider>5) { divider=-5}
                    if (divider==0) {divider=dividerD;}
                    rShade=Math.max(Math.round((Math.sin((teller+x+y)/divider)*127)+127),0)
                    gShade=Math.max(Math.round((Math.sin((teller+x+y)/divider)*127)+127),0)
                    bShade=Math.max(Math.round((Math.cos((teller+x+y)/divider)*127)+127),0)
                    box.add(new Pixel(x,y,new Color(rShade,gShade,bShade,0.8))); 
                    box.add(new Pixel(box.width()-x,y,new Color(rShade,gShade,bShade,0.8))); 
                    box.add(new Pixel(box.width()-x,box.height()-y,new Color(rShade,gShade,bShade,0.8))); 
                    box.add(new Pixel(x,box.height()-y,new Color(rShade,gShade,bShade,0.8))); 
                
                    

              }
            }
                

    
        
           
    
        });
       
    }

    
}
