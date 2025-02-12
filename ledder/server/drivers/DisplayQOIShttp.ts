import {DisplayQOIS} from "../DisplayQOIS.js"
import OffsetMapper from "./OffsetMapper.js"

import {type Response} from 'express';


const STREAM_LIVE = 0
const STREAM_RECORD = 1
const STREAM_REPLAY = 2

export class DisplayQOIShttp extends DisplayQOIS {

    private response: Response


    private streamMode: number


    constructor(mapper: OffsetMapper, maxFps = 60) {
        super(mapper, 0)

        this.minFrameTimeMicros = ~~(1000000 / maxFps)
        this.defaultFrameTimeMicros = this.minFrameTimeMicros

        this.response = undefined
        this.ready = false


        this.streamMode = STREAM_REPLAY


    }


    frame(displayTime: number) {

        displayTime = displayTime / 1000


        const buffer = []

        this.encode(buffer, displayTime)

        const abuffer = new Uint8Array(buffer)


        try {
            if (this.streamMode !== STREAM_REPLAY) {
                if (this.response!==undefined && this.response.writable) {

                    this.ready = this.response.write(abuffer, () => {
                        this.ready = true
                    })
                    return abuffer.length
                }
            } else {

                this.ready = false;
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
            this.ready = false
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
        response.set('Mode', this.streamMode.toString())


        response.flushHeaders()

    }

    isOnline()
    {
        return this.response!==undefined
    }


    setStreamMode(mode: number) {
        this.streamMode = mode
        this.abortConnection()

    }


    getStreamMode() {
        return this.streamMode
    }

}
