import Fx from "../Fx.js"
import ControlGroup from "../ControlGroup.js"
import Scheduler from "../Scheduler.js"
import PixelBox from "../PixelBox.js"
import Color from "../Color.js"
import DrawBox from "../draw/DrawBox.js"
import type PixelList from "../PixelList.js";


//Fade in/out by placing a black mask over a box and using the alpha channel. Usefull to keep animations running undistrubed while fading out or in
export class FxFadeMask extends Fx {

    mask:PixelList
    color: Color

    constructor(scheduler: Scheduler, controlGroup:ControlGroup) {
        super(scheduler, controlGroup);
    }

    //fades in or out by applying a mask. note: when fading out it will leave the mask forever, you have to remove it yourself
    run(pixelBox:PixelBox, out:boolean, time:number)
    {
        this.running=true

        let stepA

        if (this.color===undefined)
            this.color=new Color(0,0,0,0)

        if (out) {
            this.color.a = 0
            stepA=(1/time)

        }
        else {
            this.color.a = 1
            stepA=-(1/time)
        }

        if (this.mask===undefined) {
            this.mask = new DrawBox(pixelBox.xMin, pixelBox.yMin, pixelBox.width(), pixelBox.height(), this.color)
        }
        pixelBox.add(this.mask)

        let frameNr
        frameNr = time;

        this.promise = this.scheduler.interval(1, () => {

            frameNr--;
            this.color.a=this.color.a+stepA

            if (frameNr <= 0) {
                if (out)
                {
                    //make sure last step is exact
                    this.color.a=1
                }
                else {
                    //we've fade in, mask is transparent so it can be removed
                    pixelBox.delete(this.mask)
                }
                return false
            }


            if (!this.running)
                return false;

        })

        return(this.promise)

    }
}
