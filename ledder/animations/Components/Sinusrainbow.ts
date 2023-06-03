import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"


export default class Sinusrainbow extends Animator {
    static category = "Time"
    static title = "Sinusrainbow"
    static description = "blabla"


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) 
    {
        const alphaControls =controls.value("alpha/brightness",0.9,0.1,0.9,0.1)
        const intervalControl = controls.value("Fractal interval", 1, 1, 10, 0.1)
 

        scheduler.intervalControlled(intervalControl, (frameNr) => {
           box.clear()
           for (let x=0;x<box.width();x++)
           {
                let rand=(Math.cos(frameNr/1000)+1)*30-30
                let y=Math.round(Math.sin((frameNr+x)/rand)*((box.height()/2)-1)+(box.height()/2)-1)

                let h=Math.round((box.height()*2))
                for (let i=(-1*h);i<((1*h)+1);i++)
                {
                    let colorDivider=(Math.abs(i/10)+1)
                    let rShade=Math.max(Math.round(((Math.sin((frameNr+x+i+h)/10)*128)+128)/colorDivider),0)
                    let gShade=Math.max(Math.round(((Math.sin((frameNr+x+i+h)/10)*128)+128)/colorDivider),0)
                    let bShade=Math.max(Math.round(((Math.cos((frameNr+x+i+h)/10)*128)+128)/colorDivider),32)
                    let alphafactor=(Math.abs((i+h))/50)

                    let aShade=alphaControls.value;; 
                   
                    if (x>-1 && x<box.width()+1 && y>-1 && y<box.height()-1)
                    {
                        let pShade=new Pixel(x,y+i,new Color(rShade,gShade,bShade,aShade));
                        box.add(pShade);
                    }
                }

           }
           
    
        });
       
    }

    
}
