import PixelBox from "../../PixelBox.js"
import sharp from "sharp"
import drawImage from "../../draw/DrawImage.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import FxTwinkle from "../../fx/FxTwinkle.js"


export default class Rammstein extends Animator {

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {


        //load image and determine colors
        const image = await sharp('images/rammstein.png')
        const imageLetterColor = controls.color('color', 255, 216, 0)

        const logo = await drawImage(0, 0, image)
        logo.setColor(imageLetterColor)
        box.add(logo)


        let twinkle=new FxTwinkle(scheduler,controls.group('twinkle')).run(logo, logo)



    }
}
