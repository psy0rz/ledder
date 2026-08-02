import PixelBox from "../../PixelBox.js"
import Pixel from "../../Pixel.js"
import Scheduler from "../../Scheduler.js"
import Color from "../../Color.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import DrawText from "../../draw/DrawText.js";
import {fontSelect} from "../../fonts.js";
import {colorRed, colorWhite, colorYellow} from "../../Colors.js";
import FxWobble from "../../fx/FxWobble.js";
import FxAutoTrace from "../../fx/FxAutoTrace.js";
import FxTrace from "../../fx/FxTrace.js";
import FxTwinkle from "../../fx/FxTwinkle.js";


export default class Ledder extends  Animator
{

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const scrollBox=new PixelBox(box)
        box.add(scrollBox)

        const logo= new DrawText(0,12,fontSelect(controls), "LEDDER",controls.color("Logo color"))
        scrollBox.add(logo)
        scrollBox.centerH(scrollBox)

        const pwrgroup=controls.group("Powered by")
        const poweredby = new DrawText(0,0, fontSelect(pwrgroup), "Run by", pwrgroup.color())
        scrollBox.add(poweredby)
        poweredby.centerH(scrollBox)

        const github=new DrawText(0,24, fontSelect(pwrgroup), "@github", pwrgroup.color())
        scrollBox.add(github)
        github.centerH(scrollBox)

        // const wobble=new FxWobble(scheduler, controls)
        // wobble.run(logo)

        let a= new FxTwinkle(scheduler, controls)
        a.run(logo, box)

        //move in
        scrollBox.move(0,scrollBox.height())

        let speed=1
        let steps=box.height()+32
        await scheduler.interval(6, ()=>{
            scrollBox.move(0,-speed)
            steps--
            return (steps>0)
        })

        console.log("KLAAR")

    }
}
