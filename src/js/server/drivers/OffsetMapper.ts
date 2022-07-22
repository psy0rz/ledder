//map x,y to offset number
export default class OffsetMapper extends Array {
    private height: any
    private width: any

    constructor(width, height) {

        super()
        this.width = width
        this.height = height

        for (let x = 0; x < width; x++) {
            this.push([])
            for (let y = 0; y < height; y++) {
                this[x].push(x + y * width)
            }
        }
    }

    flipX() {
        this.reverse()
    }

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


    flipY() {
        for (let x = 0; x < this.width; x++) {
            this[x].reverse()
        }
    }

    zigZagY() {
        for (let x = 0; x < this.width; x = x + 2) {
            this[x].reverse()
        }
    }


}
