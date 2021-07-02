import { Matrix } from "./Matrix.js";
// @ts-ignore
import dgram from "dgram";
//Matrix driver for WLED https://github.com/Aircoookie/WLED/wiki/UDP-Realtime-Control
export class MatrixWLED extends Matrix {
    constructor(scheduler, width, height, ip, port = 21324) {
        super(scheduler, width, height);
        this.buffer = new Uint8Array(this.width * this.height * 3);
        this.socket = dgram.createSocket('udp4');
        this.socket.on('error', (err) => {
            console.log(`server error:\n${err.stack}`);
        });
        this.socket.connect(port, ip);
    }
    //sets a pixel in the render buffer (called from Draw-classes render() functions)
    setPixel(x, y, r, g, b, a) {
        //store pixel in buffer, alphablend with existing values
        const offset = x * 3 + (this.height - y - 1) * 3 * this.width;
        const old_a = 1 - a;
        this.buffer[offset] = Math.floor(this.buffer[offset] * old_a + r * a);
        this.buffer[offset + 1] = Math.floor(this.buffer[offset + 1] * old_a + g * a);
        this.buffer[offset + 2] = Math.floor(this.buffer[offset + 2] * old_a + b * a);
    }
    frame() {
        //store old buffer, create new one
        this.prevBuffer = this.buffer;
        this.buffer = new Uint8Array(this.width * this.height * 3);
        this.scheduler.update();
        this.render();
        let sendBuffer = new Uint8Array(2 + this.height * this.width * 3);
        sendBuffer[0] = 2; //DRGB protocol
        sendBuffer[1] = 2; //timeout
        let changed = false;
        for (let i = 0, n = this.buffer.length; i < n; ++i) {
            if (this.buffer[i] != this.prevBuffer[i])
                changed = true;
            sendBuffer[i + 2] = this.buffer[i];
        }
        if (changed) {
            this.socket.send(sendBuffer);
        }
    }
    run() {
        const self = this;
        setInterval(function () { self.frame(); }, 1000 / 60);
    }
}
//# sourceMappingURL=MatrixWLED.js.map