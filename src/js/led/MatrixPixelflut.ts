import {Matrix} from "./Matrix.js";
import {Color} from "./Color.js";
import * as dgram from "dgram";
import {Socket} from "dgram";

export class MatrixPixelflut extends Matrix {
  private displayWidth: number;

  /*
   * Pixelflutttt
   */
  private host: string;
  private port: number;
  private bufPrev: Color[];
  private buf: Color[];
  private socket: Socket;

  constructor(scheduler, host, port, width, height) {
    super(scheduler, width, height);
    this.host = host;
    this.port = port;
    this.bufPrev = [];
    this.buf = [];

    this.socket = dgram.createSocket('udp4');

  }


  setPixel(x, y, color) {

    const floor_y = ~~y;
    const floor_x = ~~x;

    const offset = floor_x + floor_y * this.width;


    if (this.buf[offset] === undefined)
      this.buf[offset] = new Color(0, 0, 0, 1);


    //alpha blending
    const old_a = 1 - color.a;
    let blended = this.buf[offset];

    blended.r = blended.r * old_a + color.r * color.a;
    blended.g = blended.g * old_a + color.g * color.a;
    blended.b = blended.b * old_a + color.b * color.a;

  }

  send(message) {
    // console.log(message);
    const raw_message = Buffer.from(message);
    this.socket.send(raw_message, 0, raw_message.length, this.port, this.host, function (err, bytes) {
      if (err) throw err;
    });

  }

  sendchanges() {

    // console.log(this.buf.length)

    let message = "";
    for (let i = 0; i < this.buf.length; i++) {
      const x = ~~(i % this.width);
      const y = this.height - ~~(i / this.width) - 1;
      const c = this.buf[i];
      const prevC = this.bufPrev[i];

      //only send changed pixels
      if (c === undefined && prevC !== undefined) {
        //pixel disappeared, turn off
        message = message + 'PX ' + x + ' ' + y + ' ' + '000000\n';
      } else if (c !== undefined && (prevC === undefined || c.r != prevC.r || c.g != prevC.g || c.b != prevC.b)) {
        //pixel changed
        message = message + 'PX ' + x + ' ' + y + ' ' + (~~c.r).toString(16).padStart(2, '0') + (~~c.g).toString(16).padStart(2, '0') + (~~c.b).toString(16).padStart(2, '0') + '\n';
      }


      //actually send
      if (message.length >= 1500) {
        this.send(message);
        message = "";
      }

    }
    if (message !== "")
      this.send(message);

    //swap buffers
    this.bufPrev = this.buf;
    this.buf = [];

  }

  frame()
  {
    setTimeout(()=>this.frame(), 1000/this.fpsControl.value)

    if (this.runScheduler)
      this.scheduler.update();

    this.render();

    //send changes
    this.sendchanges();

  }

  run() {
    this.frame()

  }


}
