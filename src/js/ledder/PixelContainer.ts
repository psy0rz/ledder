import {Pixel} from "./Pixel.js";
import BboxInterface from "./BboxInterface.js";
import {monitorEventLoopDelay} from "perf_hooks";

/**
 * A list of Pixels and sub PixelContainers.
 */
export class PixelContainer extends Set<Pixel | PixelContainer> {


    recurseForEachPixel(callbackfn: (pixel: Pixel) => void, pixelContainer: PixelContainer) {
        for (const p of pixelContainer) {
            if (p instanceof Pixel)
                callbackfn(p)
            else
                this.recurseForEachPixel(callbackfn, p)
        }
    }


    forEachPixel(callbackfn: (pixel: Pixel) => void) {
        this.recurseForEachPixel(callbackfn, this)
    }

    //
    // constructor() {
    //     super();
    //     if (xOffset instanceof  PixelContainer) {
    //         this.x = xOffset.x
    //         this.y = xOffset.y
    //         this.width = xOffset.width
    //         this.height = xOffset.height
    //     }
    //     else
    //     {
    //         this.x=xOffset
    //         this.y=yOffset
    //         this.width=width
    //         this.height=height
    //
    //     }
    // }
    //
    // limit(bbox:BboxInterface)
    // {
    //     if (this.x<bbox.xMin)
    //         this.x=bbox.xMin
    //     else if (this.x>bbox.xMax)
    //         this.x=bbox.xMax
    //
    //     if (this.y<bbox.yMin)
    //         this.y=bbox.yMin
    //     else if (this.y>bbox.yMax)
    //         this.y=bbox.yMax
    // }
    //
    // //keep pixel inside this box by wrapping (inclusive)
    // wrap(bbox:BboxInterface)
    // {
    //     if (this.x<bbox.xMin)
    //         this.x+=(bbox.xMax-bbox.xMin)
    //     else if (this.x>bbox.xMax)
    //         this.x-=(bbox.xMax-bbox.xMin)
    //
    //     if (this.y<bbox.yMin)
    //         this.y+=(bbox.yMax-bbox.yMin)
    //     else if (this.y>bbox.yMax)
    //         this.y-=(bbox.yMax-bbox.yMin)
    //
    // }

    // //remove pixels that are outside this box (inclusive)
    // crop(matrix:Matrix, bbox:BboxInterface)
    // {
    //     if ((this.x<bbox.xMin) ||(this.x>bbox.xMax) || (this.y<bbox.yMin) || (this.y>bbox.yMax))
    //         this.destroy(matrix)
    //
    // }


    // constructor() {
    //     this.pixels = new Set();
    // }

    // reset() {
    //     this.pixels = new Set();
    //     this.add(new Pixel(matrix,1,2))
    //
    // }
    //
    // //add pixel
    // addPixel(pixel: Pixel) {
    //     this.pixels.add(pixel)
    //     return (this);
    // }
    //
    // //add from array of pixels
    // addPixels(pixels: Array<Pixel>) {
    //
    //     const l = this.pixels.length
    //     this.pixels.length = l + pixels.length //prealloc
    //     for (let i = 0; i < pixels.length; i++)
    //         this.pixels[l + i] = pixels[i]
    //     return (this);
    // }
    //
    // //
    // // //add pixels from other pixel container to this one,
    // // add(pixelContainer: PixelContainer) {
    // //     this.addPixels(pixelContainer.pixels)
    // //     return (this)
    // // }
    //
    //
    // //add pixel to "background" (e.g. add to front of pixel list)
    // addPixelBG(pixel: Pixel) {
    //
    //     this.pixels.unshift(pixel);
    //     return (this);
    // }
    //
    //
    // //add pixels from other pixel container to this one, to "background" (e.g. add to front of pixel list)
    // addBg(pixelContainer: PixelContainer) {
    //     this.pixels.unshift(...pixelContainer.pixels)
    // }
    //
    //
    // //add array of pixels to "background" (e.g. add to front of pixel list)
    // addPixelsBG(pixels: Array<Pixel>) {
    //
    //     for (const i in pixels) {
    //         if (this.pixels.indexOf(pixels[i]) == -1) {
    //             this.pixels.unshift(pixels[i]);
    //         }
    //
    //     }
    //     return (this);
    // }
    //
    // //remove one pixel
    // removePixel(pixel: Pixel) {
    //     // const ourPixelIndex = this.pixels.indexOf(pixel);
    //     // for (const i in this.pixels)
    //     // {
    //     //     if (this.pixels[i]==pixel)
    //     //         return (this)
    //     // }
    //     // if (ourPixelIndex != -1) {
    //     //     // this.pixels.splice(ourPixelIndex, 1);
    //     // }
    //     this.pixels.delete(pixel)
    //     return (this);
    // }
    //
    // //remove array of pixels
    // removePixels(pixels: Array<Pixel>) {
    //     for (const i in pixels) {
    //         const ourPixelIndex = this.pixels.indexOf(pixels[i]);
    //         if (ourPixelIndex != -1) {
    //             this.pixels.splice(ourPixelIndex, 1);
    //         }
    //     }
    //     return (this);
    // }
    //
    // //remove pixels that are in other pixelontainers from this one
    // remove(pixelContainer: PixelContainer) {
    //     const pixels = pixelContainer.pixels
    //     for (const i in pixels) {
    //         const ourPixelIndex = this.pixels.indexOf(pixels[i]);
    //         if (ourPixelIndex != -1) {
    //             this.pixels.splice(ourPixelIndex, 1);
    //         }
    //     }
    //     return (this);
    // }
    //
    //
    // //get bounding box (override if needed)
    bbox(): BboxInterface {
        // const ret = {
        //     xMin: this.pixels[0].x,
        //     yMin: this.pixels[0].y,
        //     xMax: this.pixels[0].x,
        //     yMax: this.pixels[0].y,
        // }
        let ret = undefined

        this.forEachPixel(( p)=>
        {

            if (ret === undefined) {
                     ret = {
                        xMin: p.x,
                        yMin: p.y,
                        xMax: p.x,
                        yMax: p.y
                    }

            } else {

                if (p.x < ret.xMin)
                    ret.xMin = p.x
                else if (p.x > ret.xMax)
                    ret.xMax = p.x

                if (p.y < ret.yMin)
                    ret.yMin = p.y
                else if (p.y > ret.yMax)
                    ret.yMax = p.y
            }
        }
    )


        return (ret)
    }
}
