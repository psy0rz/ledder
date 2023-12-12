import PixelBox from "../../PixelBox.js"
import sharp, { Sharp } from "sharp"
import drawImage from "../../draw/DrawImage.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import PixelList from "../../PixelList.js"
import fetch from "node-fetch"
import FxMovie from "../../fx/FxMovie.js"
import FxRotate from "../../fx/FxRotate.js"

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
        const pages=sharpMetaData.pages
        pl.add(await drawImage(0,0,sharpImg))
        return pl
      }
      

   
    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        let imgBox=new PixelBox(box)
        box.add(imgBox)
        
        //const imageConfig = controls.input('Image URL', 'https://image-cdn.buienradar.nl/br-processing/image-api/RadarMapRainNL/Animation/202312110025__256x238_True_False_True_3_3_1_0_run202312110020.gif',true)
     
       
        let choices=[]
        choices.push({id:0,     name:"Dancing banana",          url:"https://i.giphy.com/f5pe3BZCCYWPkx6mzW.webp"})
        choices.push({id:1,     name:"Buienradar.nl 48x48",   url:"https://api.buienradar.nl/image/1.0/RadarMapNL?w=48&h=48"})
        choices.push({id:2,     name:"Buienradar.nl 256x256",   url:"https://api.buienradar.nl/image/1.0/RadarMapNL?w=256&h=256"})
        choices.push({id:3,     name:"Rotating earth",    url:"https://upload.wikimedia.org/wikipedia/commons/2/2c/Rotating_earth_%28large%29.gif"})
        choices.push({id:4,     name:"Default",         url:"https://avatars.githubusercontent.com/u/6029931?v=4"})
        choices.push({id:5,     name:"Homer",         url:"https://user-images.githubusercontent.com/14011726/94132137-7d4fc100-fe7c-11ea-8512-69f90cb65e48.gif"})
        const imagePreset = controls.select("Preset","Dancing banana",choices,true)
        console.log("selected:",imagePreset.selected)
        const selectedChoice=choices[imagePreset.selected]
        console.log("imagedata:", selectedChoice)
        let url=""
        if (selectedChoice)
        {
            url=selectedChoice.url
        }
        else
        {
            url="https://avatars.githubusercontent.com/u/6029931?v=4"
        }
        const imageConfig = controls.input('Image URL', url,true)
        imageConfig.text=url
       
        let frames=await this.loadImage(url,imgBox)
        
        
        let animationControls=controls.group("animation control")
        new FxMovie(scheduler, animationControls, 4, 0).run(frames,  imgBox)
        new FxRotate(scheduler, animationControls, 0).run(frames,  imgBox)
        
       
    


     
  

    }
}
