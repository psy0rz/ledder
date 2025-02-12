import Pixel from "../Pixel.js"
import sharp from "sharp"
import PixelList from "../PixelList.js"
import ColorCache from "../ColorCache.js"
import PixelBox from "../PixelBox.js"


//convert raw image data from the sharp library to pixel list
//doesnt add pixels which have alpha 0
//animated images have frames in y direction(height)

export class ImgAnimationFrames
{
    frames=[]
    delay:number

    constructor(initialFrameCount:number)
    {
        this.frames=[]
        for (let c=0;c<initialFrameCount;c++)
        {
            this.frames.push(new PixelList())
            this.delay=1000
        }
    }

    

    getDelayMs()
    {
        return this.delay
    }

    setFrameDelay(delay)
    {
        this.delay=delay
    }

    addFrame(frame:PixelList)
    {
        this.frames.push(frame)
    }

    length()
    {
        return this.frames.length
    }

    addPixel(index:number,pixel:Pixel)
    {
        if (this.frames[index])
        {
            this.frames[index].add(pixel)
        }

    }

   

    getFrame(index:number)
    {
        let itemcount=this.length()
        index=index%itemcount
        if (this.frames[index])
        {
            return this.frames[index]
        }
        else
        {
            return new PixelList()
        }
    }
}

export default async function drawAnimatedImage(box:PixelBox,xOffset: number, yOffset: number, image: sharp.Sharp): Promise<ImgAnimationFrames> {

    const {data, info} = await image.raw().toBuffer({resolveWithObject: true})
    const colorCache=new ColorCache()
    const canvasHeight=info.height
    const imageHeight=box.height()
    const imageFrameCount=Math.round(canvasHeight/imageHeight)
    const frames=new ImgAnimationFrames(imageFrameCount)

    
        for (let y = 0; y < info.height; y++) {
            let f=Math.trunc(y/imageHeight)
            for (let x = 0; x < info.width; x++) {
                const offset = (x * info.channels) + ((y) * info.width * info.channels)
                const a = data[offset + 3]
                //ignore alpha 0
                if (a > 0) {
                    const c = colorCache.get(data[offset], data[offset + 1], data[offset + 2], data[offset + 3] / 255)
                    let pixel=new Pixel(x + xOffset, (y%imageHeight) + yOffset, c)
                    pixel.wrap(box)
                    frames.addPixel(f,pixel)
                }
            }
        }


   
    return frames

}



