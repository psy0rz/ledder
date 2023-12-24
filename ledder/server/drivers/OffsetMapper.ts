/*
 Maps an x,y coordinate to an offset number. Usefull for display and led-strip orientations.

 The mapping table is precalculated, so the performance impact is minimal.

 Tips:
  - Use this animation to test: Tests/TestMatrix/default (compare to the animation on the screen to see if orientation etc is correct)
  - Start out with figuring out of its horizontal or vertical. If you mess this up you'll get garbage, so try the other one. :)
  - After that it should be easy to determine if you need a zigzag or flip as well.
  - After that you can stack multiple displays together by creating another OffsetMapper and use AddGrid.

*/
export default class OffsetMapper extends Array {
    public height: number
    public width: number

    constructor(width: number, height: number, horizontal = true) {

        super()
        this.width = width
        this.height = height

        //horizontal ledstrips, left to right
        if (horizontal) {
            for (let x = 0; x < width; x++) {
                this.push([])
                for (let y = 0; y < height; y++) {
                    this[x].push(x + y * width)
                }
            }
        }
        //vertical ledstrips, top to bottom
        else {
            for (let x = 0; x < this.width; x++) {
                this.push([])
                for (let y = 0; y < this.height; y++) {
                    this[x].push(x * this.height + y)
                }
            }
        }
    }

    //normal X flip
    flipX() {
        this.reverse()
    }

    //normal Y flip
    flipY() {
        for (let x = 0; x < this.width; x++) {
            this[x].reverse()
        }
    }

    //flip every even X line (for zigzagged ledstrips )
    zigZagX() {
        for (let y = 0; y < this.height; y = y + 2) {
            const old = []
            for (let x = 0; x < this.width; x++)
                old.push(this[x][y])

            old.reverse()
            for (let x = 0; x < this.width; x++)
                this[x][y] = old[x]

        }
    }


    //flip every odd Y line (for zigzagged ledstrips)
    zigZagY() {
        for (let x = 0; x < this.width; x = x + 2) {
            this[x].reverse()
        }
    }

    //Copy another mapper to this one, with certain offsets
    //Usefull for combining smaller displays into a bigger stacked one for example.
    //NOTE: the order in which you call add doesnt matter.
    add(other: OffsetMapper, xOffset: number, yOffset: number, offset: Number) {
        for (let y = 0; y < other.height; y++)
            for (let x = 0; x < other.width; x++)
                this[x + xOffset][y + yOffset] = other[x][y] + offset
    }

    //Same as above, but now assume we're stacking a bunch of the same sized displays into a grid.
    //Displaynr starts at channel 0, and each display add the  nuber of pixels that other has to the offset.
    //Usefull with ledstream.
    //NOTE: the order in which you call addGrid doesnt matter.
    addGrid(other: OffsetMapper, gridX, gridY, displayNr)
    {
        this.add(other, gridX*other.width, gridY*other.height, displayNr * other.width * other.height)

    }

}
