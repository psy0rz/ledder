import {DisplayQOIS} from "../DisplayQOIS.js"
import OffsetMapper from "./OffsetMapper.js"
import type {Writable} from "node:stream";


export class DisplayQOIShttp extends DisplayQOIS {


    private fhs: Set<Writable>
    private primaryFh: Writable
    private readyCb: () => void


    public ready: boolean


    constructor(mapper: OffsetMapper, maxFps = 60) {
        super(mapper, 0)

        this.minFrameTimeMicros = ~~(1000000 / maxFps)
        this.defaultFrameTimeMicros = this.minFrameTimeMicros

        this.fhs = new Set()
        this.primaryFh = undefined
        this.ready = false


    }


    frame(displayTime: number) {

        displayTime = displayTime / 1000


        const buffer = []

        this.encode(buffer, displayTime)


        let bytes = 0
        for (let fh of this.fhs) {

            const ready = fh.write(new Uint8Array(buffer), this.readyEvent.bind(this))

            if (fh === this.primaryFh)
                this.ready = ready
            bytes = bytes + buffer.length
        }

        return bytes

    }

    registerReadyCb(readyCb: () => void) {
        this.readyCb = readyCb
    }

    async readyEvent() {
        this.ready = true
        if (this.readyCb !== undefined)
            return this.readyCb()


    }

    addFh(fh: Writable) {
        this.fhs.add(fh)

        if (this.primaryFh === undefined) {
            this.primaryFh = fh
            // fh.on('drain', this.readyEvent.bind(this))
            this.ready = true
            return true
        }

        return false
    }

    removeFh(fh: Writable) {
        this.fhs.delete(fh)
        if (fh === this.primaryFh) {
            this.primaryFh = undefined
            // fh.off('drain', this.readyEvent)
            this.ready = true
            return true
        }
        return false
    }

}
