import PixelBox from "../../PixelBox.js"
import sharp, { Sharp } from "sharp"
import drawImage from "../../draw/DrawImage.js"
import drawAnimatedImage from "../../draw/DrawAnimatedImage.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import PixelList from "../../PixelList.js"
import fetch from "node-fetch"
import FxMovie from "../../fx/FxMovie.js"

export default class RemotePicture extends Animator {


    toBuffer(arrayBuffer) {
        const buffer = Buffer.alloc(arrayBuffer.byteLength);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < buffer.length; ++i) {
          buffer[i] = view[i];
        }
        return buffer;
      }


      async loadImage(imageUrl,box)
      {
        const image = await fetch(imageUrl);
        const imageBuffer = await image.arrayBuffer();
        const sharpImg= await sharp(this.toBuffer(imageBuffer),{animated:true, pages:-1}).resize(box.width(),box.height())
        const sharpMetaData=await sharp(this.toBuffer(imageBuffer),{animated:true,pages:-1}).resize(box.width(),box.height()).metadata()
        let framedata=await drawAnimatedImage(box,0,0,sharpImg)
        if (sharpMetaData.delay)
        {
            let delay=sharpMetaData.delay[0]
            if (delay<1) { delay=100 }
            framedata.setFrameDelay(delay)
        }
        return framedata
      }

      
    
   
    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        let imgBox=new PixelBox(box)
        box.add(imgBox)
        
        const imageConfig = controls.input('Image URL', "http://localhost:3000/presets/Fires/PlasmaFire/Active%202.png?1702419790623.1921",true)
        console.log("loading ",imageConfig.text)
        let framedata=await this.loadImage(imageConfig.text,imgBox)
        let animationControls=controls.group("animation control")
        let delayControl=animationControls.value("delay multiplier",1,0.1,10,0.1,true)
        let frameId=0
        scheduler.setFrameTimeuS(framedata.getDelayMs()*1000*delayControl.value)
        scheduler.interval(1, (frameNr) => {
            if (framedata && framedata.length()>0)
            {
                imgBox.clear()
                frameId=frameNr%framedata.length()
                imgBox.add(framedata.getFrame(frameId))
            }
           
        })
        
        
    }
}
