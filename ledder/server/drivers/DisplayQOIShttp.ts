import {DisplayQOIS} from "../DisplayQOIS.js"
import OffsetMapper from "./OffsetMapper.js"

import {type Response} from 'express';


export class DisplayQOIShttp extends DisplayQOIS {


    // private fhs: Set<Writable>
    private response: Response
    private readyCb: () => void


    public ready: boolean


    constructor(mapper: OffsetMapper, maxFps = 60) {
        super(mapper, 0)

        this.minFrameTimeMicros = ~~(1000000 / maxFps)
        this.defaultFrameTimeMicros = this.minFrameTimeMicros

        this.response = undefined
        this.ready = false


    }


    frame(displayTime: number) {

        displayTime = displayTime / 1000


        const buffer = []

        this.encode(buffer, displayTime)

        const abuffer = new Uint8Array(buffer)


        if (this.response.writable) {

            this.ready = this.response.write(abuffer, () => {
                this.ready = true
            })
            return abuffer.length
        }

        return 0

    }

    //set new response handler, close previious one
    setResponseHandler(response: Response) {

        if (this.response !== undefined) {
            this.response.socket.destroy()
        }

        this.response = response
        this.ready = true

        response.on('close', () => {
            //we're still the responder?
            if (this.response === response) {
                this.ready = false
                this.response = undefined
            }
        })


    }

    // //remove a response handler
    // removeResponseHandler(response: Response) {
    //     if (response === this.response) {
    //         this.response = undefined
    //         this.ready = false
    //     }
    // }

}
