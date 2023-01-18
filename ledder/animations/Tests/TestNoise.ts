import PixelBox from "../../PixelBox.js"
import Pixel from "../../Pixel.js"
import FxBlink from "../../fx/FxBlink.js"
import PixelList from "../../PixelList.js"
import FxRotate from "../../fx/FxRotate.js"
import Scheduler from "../../Scheduler.js"
import Color from "../../Color.js"
import ControlGroup from "../../ControlGroup.js"
import Animation from "../../Animation.js"
import {colorBlack} from "../../Colors.js"
import {random} from "../../utils.js"


export default class TestNoise extends Animation {


  async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {


    const raster=box.raster(box, colorBlack, false, false,false, true)

    scheduler.interval(1 , ()=>{
      box.forEachPixel( (p)=>
      {
        p.color.r=random(0,255)
        p.color.g=random(0,255)
        p.color.b=random(0,255)

      })
    })



  }
}
