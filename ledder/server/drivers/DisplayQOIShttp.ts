import {DisplayQOIS} from "../DisplayQOIS.js"
import OffsetMapper from "./OffsetMapper.js"

import {type Response} from 'express';


export class DisplayQOIShttp extends DisplayQOIS {

    private response: Response


    private setFlash: boolean


    constructor(mapper: OffsetMapper, maxFps = 60) {
        super(mapper, 0)

        this.minFrameTimeMicros = ~~(1000000 / maxFps)
        this.defaultFrameTimeMicros = this.minFrameTimeMicros

        this.response = undefined
        this.ready = false
        this.setFlash = false


    }


    frame(displayTime: number) {

        displayTime = displayTime / 1000


        const buffer = []

        this.encode(buffer, displayTime)

        const abuffer = new Uint8Array(buffer)


        try {
            if ( this.response.writable) {

                this.ready = this.response.write(abuffer, () => {
                    this.ready = true
                })
                return abuffer.length
            }
        } catch (e) {
            console.error(e)
            return 0
        }

        return 0

    }


    abortConnection() {
        if (this.response !== undefined) {
            this.response.socket.destroy()
            this.response = undefined
            this.ready=false
        }

    }

    //set new response handler, close previious one
    setResponseHandler(response: Response) {

        this.abortConnection()

        this.response = response
        this.ready = true

        response.on('close', () => {
            //we're still the responder?
            if (this.response === response) {
                this.ready = false
                this.response = undefined
            }
        })

        response.set('Content-Type', 'application/octet-stream'); // or whatever MIME type suits your data
        response.set('Content-Length', '100000000');
        response.set('Flash', this.setFlash ? '1' : '0')

        this.setFlash = false


    }


    storeStream() {
        this.setFlash = true
        //make it reconnect
        this.abortConnection()

    }

    storing() {
        return this.setFlash
    }


}
