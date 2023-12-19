import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import PixelList from "../../PixelList.js"
import { spawn } from "child_process"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"

let frameData=[]

export default class RemoteVideo extends Animator {

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
                        pl.add(new Pixel(x,y,new Color(rgb[0],rgb[1],rgb[2],1)))
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
      
      ffmpeg.stderr.on('data', function(chunk){ });
      const frameSize =  width*height*3 //rgb needs 3 bytes
      const buffer = Buffer.alloc(frameSize+1024*1024*1) // frameSize + 10MB headroom
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
        let loopControl=animationControls.switch("Loop",false,true)
        ready= await this.decodeVideo(imageConfig.text,box,movieFpsControl.value)
        scheduler.setFrameTimeuS(((1000*1000)/movieFpsControl.value)*delayControl.value)
        let pl=new PixelList()
        let frameBufferPointer=0
        scheduler.interval(1, (frameNr) => {
            if (frameData.length>1 && frameBufferPointer<frameData.length)
            {
                imgBox.clear()
                let frame=frameData[frameBufferPointer]
                imgBox.add(frame)  
                frameBufferPointer++
            } 
            else
            {
              if (!frameData[frameBufferPointer] && loopControl.enabled)
              {
                frameBufferPointer=0
              }
           }
           
        })
    }
}

