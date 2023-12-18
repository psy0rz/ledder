import PixelBox from "../../PixelBox.js"
import sharp, { Sharp } from "sharp"
import drawAnimatedImage, { ImgAnimationFrames } from "../../draw/DrawAnimatedImage.js"
import Scheduler from "../../Scheduler.js"
import drawImage from "../../draw/DrawImage.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import PixelList from "../../PixelList.js"
import fetch from "node-fetch"
import { spawn } from "child_process"
import { Writable } from "stream"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"



//let rawFrames=
let frameData=[]

// inspiration: https://stackoverflow.com/questions/62050534/how-to-read-video-frames-directly-into-memory-with-nodejs

export default class RemoteVideo extends Animator {

     async waitForBuffer(num:number)
     {
      while (frameData.length<num)
      {
         console.log(".")
      }
      return true
     }

     async decodeVideo(url,box,fps:number)
    {
       
       let width=box.width()
       let height=box.height()
       let bufPos = 0
       let frame = 0

        console.log("decode",url)
        const ffmpeg = spawn('ffmpeg', [
            '-i', url,
            '-r', fps,
            '-f', 'rawvideo',
            '-s', width+'x'+height, 
            '-pix_fmt', 'rgb24',
            'pipe:1', // ffmpeg will output the data to stdout
        ])

        ffmpeg.stdout.on('data', function(chunk){
                chunk.copy(buffer, bufPos)
                bufPos += chunk.length
               
                // we have a complete frame (and possibly a bit of the next frame) in the buffer
                if (bufPos >= frameSize) {
                    const rawPixels = buffer.subarray(0, frameSize)
                    // do something with the data
                    let pl=new PixelList()
         
                    let offset=0
                    let pixelsize=3
                    for (let y=0;y<box.height();y++){
                      for (let x=0;x<box.width();x++){
                        let rgb = buffer.subarray(offset, offset+pixelsize)
                       
                        let r=rgb[0]
                        let g=rgb[1]
                        let b=rgb[2]
                        pl.add(new Pixel(x,y,new Color(r,g,b,1)))
                        offset=offset+pixelsize
                      }
                    }
                    frameData.push(pl)
                    // copy the overflowing part of the chunk to the beginning of the buffer
                    buffer.copy(buffer, 0, frameSize, bufPos - frameSize)
                    bufPos = bufPos - frameSize
                   
                 
                    frame++
                }
      });
      
      ffmpeg.stderr.on('data', function(chunk){
          var textChunk = chunk.toString('utf8');
          //console.error(textChunk);
      });

        const frameSize =  width*height*3 // full HD in RGB (24bpp)
        const buffer = Buffer.alloc(frameSize+1024*1024*100) // frameSize + 10MB headroom
       

       
       

        return true

    }
        
   
    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        let imgBox=new PixelBox(box)
        box.add(imgBox)
        let ready=false
        const imageConfig = controls.input('Image URL', "http://localhost:3000/presets/Fires/PlasmaFire/Active%202.png?1702419790623.1921",true)
        let animationControls=controls.group("animation control")
        let movieFpsControl=animationControls.value("Movie FPS",5,1,20,1,true)
        let delayControl=animationControls.value("Delay multiplier",1,0.1,10,0.1,true)
        
        ready= await this.decodeVideo(imageConfig.text,box,movieFpsControl.value)
        scheduler.setFrameTimeuS(((1000*1000)/movieFpsControl.value)*delayControl.value)
        let pl=new PixelList()
        let frameIndex=0
        scheduler.interval(1, (frameNr) => {
            if (frameData.length>1)
            {
               //new frame is ready 
                if (frameNr%10==0) { console.log("buffer size:",frameData.length) }  
                imgBox.clear()
                let frame=frameData.shift()
                imgBox.add(frame)
               
               
            }
            
           
        })
        
        
    }
}

