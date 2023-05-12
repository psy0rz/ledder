
//rendered font text.
import Draw from "../Draw.js"
import PixelList from "../PixelList.js"

export default class DrawBlur extends Draw {

    constructor(pixels:PixelList, xDir, yDir, factor) {
        super()
        const index=pixels.index()

        pixels.forEachPixel( (p)=>{
            const blurred=p.copy(true)
            blurred.x=blurred.x+xDir
            blurred.y=blurred.y+yDir
            //not occupied yet?
            if (index[blurred.x]==undefined || index[blurred.x][blurred.y]==undefined)
            {
                blurred.color.a=blurred.color.a*factor;
                this.add(blurred)
            }
        })

    }
}