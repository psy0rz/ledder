import PixelBox from "../../PixelBox.js"
import sharp, { Sharp } from "sharp"
import drawImage from "../../draw/DrawImage.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import PixelList from "../../PixelList.js"
import fetch from "node-fetch"
import FxMovie from "../../fx/FxMovie.js"
import FxRotate from "../../fx/FxImgAni.js"

export default class Reinstein extends Animator {

    plImg:PixelList

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
        let pl=new PixelList()
        const image = await fetch(imageUrl);
        const imageBuffer = await image.arrayBuffer();
        const sharpImg= await sharp(this.toBuffer(imageBuffer),{animated:true, pages:-1}).resize(box.width(),box.height())
        const sharpMetaData=await sharp(this.toBuffer(imageBuffer),{animated:true,pages:-1}).resize(box.width(),box.height()).metadata()
        //console.log(sharpImg,sharpMetaData)
        pl.add(await drawImage(0,0,sharpImg))
        return pl
      }
      

   
    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        let imgBox=new PixelBox(box)
        box.add(imgBox)
        
        const imageConfig = controls.input('Image URL', "http://localhost:3000/presets/Fires/PlasmaFire/Active%202.png?1702419790623.1921",true)
        console.log("loading ",imageConfig.text)
        let frames=await this.loadImage(imageConfig.text,imgBox)
        //frames.crop(box)
        imgBox.add(frames)
        let animationControls=controls.group("animation control")
        //new FxMovie(scheduler, animationControls, 4, 0).run(frames,  imgBox)
        let rotate=new FxRotate(scheduler, animationControls, 0)
        rotate.run(frames,  imgBox)
        
    }
}
