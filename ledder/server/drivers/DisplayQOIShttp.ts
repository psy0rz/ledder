import {DisplayQOIS} from "../DisplayQOIS.js"
import OffsetMapper from "./OffsetMapper.js"

import {type Response} from 'express';


export const STREAM_LIVE = 0
export const STREAM_RECORD = 1
export const STREAM_REPLAY = 2

//A display that vanishes (unplugged, crashed, out of wifi range) usually does not close its TCP
//connection: our writes just pile up in the kernel socket buffer and the write-callback stops firing.
//After this long without a single completed write we call the display offline, even though the socket
//is still nominally open. It has to be well above the worst case for a display that is merely slow:
//the renderer stops producing frames while a write is outstanding, so a healthy display drains
//every frame it is sent.
const stalledOfflineMillis = 5000

//Ask the OS to probe idle connections, so a peer that went away without closing eventually
//destroys the socket instead of looking connected forever.
const keepAliveDelayMillis = 10000

export class DisplayQOIShttp extends DisplayQOIS {

    private response: Response

    //Date.now() of the moment the current unfinished write started, or undefined when no write is
    //waiting to be flushed to the display.
    private writePendingSinceMs: number

    //did the last frame we handed to the socket get flushed? While it did not, the next frame has to
    //wait. See updateReady(), which is what actually decides whether the renderer may continue.
    private lastWriteFlushed: boolean


    private streamMode: number


    constructor(mapper: OffsetMapper, id, maxFps = 60) {
        super(mapper, 0)

        this.id=id
        this.descriptionControl.text=`HTTP ${id}`

        this.minFrameTimeMicros = ~~(1000000 / maxFps)
        this.defaultFrameTimeMicros = this.minFrameTimeMicros

        this.response = undefined
        this.writePendingSinceMs = undefined
        this.lastWriteFlushed = true


        this.streamMode = STREAM_LIVE

        this.updateReady()

    }


    //The renderer only steps the animation while the primary display is ready, so this is where the
    //driver decides whether the animation may continue. Call it after anything that can change the
    //connection state. There is no point in rendering frames for a display that is offline (they
    //would be encoded and thrown away, and the animation would be somewhere else entirely by the
    //time the display comes back), nor for one that is replaying from its own flash.
    private updateReady() {
        this.ready = this.lastWriteFlushed && this.streamMode !== STREAM_REPLAY && this.isOnline()
    }


    frame(displayTime: number) {

        displayTime = displayTime / 1000

        //always encode, also when there is nobody to send it to: encode() is what resets the pixel
        //accumulators for the next frame, and it keeps the encoder state moving with the animation
        const length = this.encode(displayTime)

        if (this.streamMode === STREAM_REPLAY) {
            this.updateReady()
            return 0
        }

        if (this.response === undefined || !this.response.writable)
            return 0

        //frame did not fit in the stream format. The decoder can not resync by itself, so drop the
        //client and let it reconnect, which starts both sides from a clean state again.
        if (length === 0) {
            this.abortConnection()
            return 0
        }

        //response.write() can hold on to the buffer past this call, so the shared frameBuffer can not
        //be handed over directly. Buffer.allocUnsafe() takes these from a pool, which is far cheaper
        //than the Array-of-numbers the encoder used to build.
        const abuffer = Buffer.allocUnsafe(length)
        abuffer.set(this.frameBuffer.subarray(0, length))

        try {
            const flushedImmediately = this.response.write(abuffer, () => {
                this.lastWriteFlushed = true
                this.writePendingSinceMs = undefined
                this.updateReady()
            })
            this.lastWriteFlushed = flushedImmediately

            //the callback also runs for a write that was flushed immediately, but only on the next
            //tick, so clear the stall timer here as well instead of leaving it set in between.
            if (flushedImmediately)
                this.writePendingSinceMs = undefined
            else if (this.writePendingSinceMs === undefined)
                this.writePendingSinceMs = Date.now()

            this.updateReady()

            return length
        } catch (e) {
            console.error(e)
            return 0
        }
    }


    abortConnection() {
        if (this.response !== undefined) {
            //an already closed response has no socket left to destroy
            this.response.socket?.destroy()
            this.response = undefined
            this.writePendingSinceMs = undefined
            this.lastWriteFlushed = true
            this.updateReady()
        }

    }

    //set new response handler, close previious one
    setResponseHandler(response: Response) {

        this.abortConnection()

        //new client starts decoding from scratch, so the encoder color-index must also start fresh
        this.resetEncoderState()


        this.response = response
        this.writePendingSinceMs = undefined
        this.lastWriteFlushed = true
        this.updateReady()

        //let the OS notice a peer that disappeared without closing its side
        response.socket?.setKeepAlive(true, keepAliveDelayMillis)


        response.on('close', () => {
            //we're still the responder?
            if (this.response === response) {
                this.response = undefined
                this.writePendingSinceMs = undefined
                this.lastWriteFlushed = true
                this.updateReady()
            }

        })

        response.set('Content-Type', 'application/octet-stream'); // or whatever MIME type suits your data
        response.set('Content-Length', '100000000');
        response.set('Mode', this.streamMode.toString())


        response.flushHeaders()

    }

    isOnline() {

        if (this.response === undefined || !this.response.writable)
            return false

        //frames we handed to the socket are not getting out: the display is gone, even though the
        //connection is still open as far as we can tell.
        return !this.writeStalled()
    }

    //a stalled connection never recovers on its own (we stop sending frames once a write is pending),
    //so drop it: the display reconnects and both sides start from a clean state again.
    disconnectIfDead() {
        if (this.response !== undefined && this.writeStalled()) {
            console.log(`Display http stalled, dropping connection: ${this.id}`)
            this.abortConnection()
        }

        //going offline can also happen without an event we hook into (a socket that stopped being
        //writable), so this poll is what makes the renderer notice it in that case
        this.updateReady()
    }

    //is a frame we handed to the socket still not flushed after all this time?
    private writeStalled() {
        return this.writePendingSinceMs !== undefined && Date.now() - this.writePendingSinceMs > stalledOfflineMillis
    }


    setStreamMode(mode: number) {
        this.streamMode = mode
        this.abortConnection()
        this.updateReady()

    }


    getStreamMode() {
        return this.streamMode
    }

}
