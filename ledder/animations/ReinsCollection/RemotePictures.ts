import PixelBox from "../../PixelBox.js"
import sharp, {type Sharp} from "sharp"
import drawAnimatedImage from "../../draw/DrawAnimatedImage.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import fetch from "node-fetch"

export default class RemotePicture extends Animator {


    toBuffer(arrayBuffer) {
        const buffer = Buffer.alloc(arrayBuffer.byteLength);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < buffer.length; ++i) {
            buffer[i] = view[i];
        }
        return buffer;
    }


    async loadImage(imageUrl, box, resizeOptions) {
        const image = await fetch(imageUrl);
        const imageBuffer = await image.arrayBuffer();
        let width = box.width()
        let height = box.height()
        const sharpImg = await sharp(this.toBuffer(imageBuffer), {
            animated: true,
            pages: -1
        }).resize(width, height, {fit: resizeOptions})

        const sharpMetaData = await sharp(this.toBuffer(imageBuffer), {
            animated: true,
            pages: -1
        }).resize(width, height, {fit: resizeOptions}).metadata()

        let framedata = await drawAnimatedImage(box, 0, 0, sharpImg)
        if (sharpMetaData.delay) {
            let delay = sharpMetaData.delay[0]
            if (delay < 1) {
                delay = 100
            }
            framedata.setFrameDelay(delay)
        }
        return framedata
    }


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        let imgBox = new PixelBox(box)
        box.add(imgBox)
        //https://github.com/lovell/sharp/blob/main/docs/api-resize.md
        let resizeOptions = []
        resizeOptions.push({id: "cover", name: "cover"})
        resizeOptions.push({id: "contain", name: "contain"})
        resizeOptions.push({id: "fill", name: "fill"})
        resizeOptions.push({id: "inside", name: "inside"})
        resizeOptions.push({id: "outside", name: "outside"})
        const imageConfig = controls.input('Image URL', "http://localhost:3000/presets/Fires/PlasmaFire/Active%202.png?1702419790623.1921", true)
        const imageResize = controls.select("fit", "fill", resizeOptions, true)
        console.log("loading ", imageConfig.text)

        scheduler.stop()
        let framedata = await this.loadImage(imageConfig.text, imgBox, imageResize.selected)
        scheduler.resume()

        let animationControls = controls.group("animation control")
        let delayControl = animationControls.value("delay multiplier", 1, 0.1, 10, 0.1, true)
        let frameId = 0
        scheduler.setFrameTimeuS(framedata.getDelayMs() * 1000 * delayControl.value)
        scheduler.interval(1, (frameNr) => {
            if (framedata && framedata.length() > 0) {
                imgBox.clear()
                frameId = frameNr % framedata.length()
                imgBox.add(framedata.getFrame(frameId))
            }

        })


    }
}
