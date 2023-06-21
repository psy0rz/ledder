import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"


export default class Rainbowcross extends Animator {
    static category = "Ledart"
    static title = "Rainbowcross"
    static description = "blabla"


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) 
    {
        const alphaControls =controls.value("alpha/brightness",0.9,0.1,0.9,0.1)
        const intervalControl = controls.value("Fractal interval", 1, 1, 10, 0.1)
        let teller=0;
        let dx=-0.5;
        let dy=0.7;
        let cx=box.width()/2;
        let cy=box.height()/2;
 

        scheduler.intervalControlled(intervalControl, (frameNr) => {
           box.clear()
           let x=0;
           let y=0;
           let rShade=0;
           let bShade=0;
           let gShade=0;
           let divider=4;
           let dividerD=0.05
           teller=Math.sin(frameNr/1000)*10000
           //cx=cx+dx 
           //cy=cy+dy 
           if (cx>box.width() || cx<0 )  { dx=dx*-1}
           if (cy>box.height() || cy<0 )  { dy=dy*-1}
         
           for (let x=0;x<(box.width()+1);x++)
           {
              for (let y=0;y<(box.height()+1);y++)
              {
                    let difX=x-Math.round(cx)
                    let difY=y-Math.round(cy)
                    let distance=Math.sqrt((difX*difX)+(difY*difY))+0.01
                    divider=divider+dividerD;
                    if (divider>5) { divider=-5}
                    if (divider==0) {divider=dividerD;}
                    rShade=Math.round((Math.sin((teller/distance)/64)*127)+127)
                    gShade=Math.round((Math.sin((teller/distance)/64)*127)+127)
                    bShade=Math.round((Math.cos((teller/distance)/64)*127)+127)
                    box.add(new Pixel(x,y,new Color(rShade,gShade,bShade,1))); 
                   
                
                    

              }
            }
                

            box.add(new Pixel(Math.round(cx),Math.round(cy),new Color(255,255,255,1)))
        
           
    
        });
       
    }

    
}
