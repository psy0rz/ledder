import {Matrix} from "../../ledder/Matrix.js";

// @ts-ignore
import dgram from "dgram";

export let gamma = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2,
  2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5,
  5, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10,
  10, 10, 11, 11, 11, 12, 12, 13, 13, 13, 14, 14, 15, 15, 16, 16,
  17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 24, 24, 25,
  25, 26, 27, 27, 28, 29, 29, 30, 31, 32, 32, 33, 34, 35, 35, 36,
  37, 38, 39, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 50,
  51, 52, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 66, 67, 68,
  69, 70, 72, 73, 74, 75, 77, 78, 79, 81, 82, 83, 85, 86, 87, 89,
  90, 92, 93, 95, 96, 98, 99,101,102,104,105,107,109,110,112,114,
  115,117,119,120,122,124,126,127,129,131,133,135,137,138,140,142,
  144,146,148,150,152,154,156,158,160,162,164,167,169,171,173,175,
  177,180,182,184,186,189,191,193,196,198,200,203,205,208,210,213,
  215,218,220,223,225,228,231,233,236,239,241,244,247,249,252,255 ]

//Matrix driver for WLED https://github.com/Aircoookie/WLED/wiki/UDP-Realtime-Control via DRGB
export class MatrixWLED extends Matrix {

  buffer: Uint8ClampedArray;
  socket: any;
  flipX: boolean;
  flipY: boolean;
  ip: string;
  port: number;

  /**
   * Driver for WLED via UDP protocol
   * @param scheduler
   * @param width
   * @param height
   * @param flipX Flip X axis
   * @param flipY Flip Y axis
   * @param ip IP address
   * @param port UDP port
   */
  constructor(scheduler, width, height, flipX, flipY, ip, port=21324) {
    super(scheduler, width, height);

    this.flipX=flipX;
    this.flipY=flipY;

    this.ip=ip;
    this.port=port;

    this.buffer=new Uint8ClampedArray(this.width * this.height * 3);

    this.socket = dgram.createSocket('udp4');

    this.socket.on('error', (err) => {
      console.log(`server error:\n${err.stack}`);
    });

  }

  //sets a pixel in the render buffer (called from Draw-classes render() functions)
  setPixel(x,y, color)
  {

    if (x>=0 && x<this.width && y>=0 && y<this.height) {
      let physX;
      let physY;

      if (this.flipX)
        physX=this.width-~~x-1;
      else
        physX=~~x;

      if (this.flipY)
        physY=this.height-~~y-1;
      else
        physY=~~y;

      const offset = physX * 3 + physY * 3 * this.width;
      const old_a = 1 - color.a;

      //store pixel in buffer, alphablend with existing values
      this.buffer[offset] = (this.buffer[offset] * old_a + gamma[~~color.r] * color.a);
      this.buffer[offset + 1] = (this.buffer[offset + 1] * old_a + gamma[~~color.g] * color.a);
      this.buffer[offset + 2] = (this.buffer[offset + 2] * old_a + gamma[~~color.b] * color.a);
      // this.buffer[offset] = (this.buffer[offset] * old_a + ~~color.r * color.a);
      // this.buffer[offset + 1] = (this.buffer[offset + 1] * old_a + ~~color.g * color.a);
      // this.buffer[offset + 2] = (this.buffer[offset + 2] * old_a + ~~color.b * color.a);
    }
  }


  frame()
  {
    setTimeout(()=> this.frame(), 1000/this.fpsControl.value)

    //we want the sending to be timed exactly, so do that first:
    let sendBuffer=new Uint8Array(2 + this.height * this.width*3);

    sendBuffer[0]=2;//DRGB protocol
    sendBuffer[1]=120; //timeout


    for (let i=0, n=this.buffer.length; i<n; ++i)
    {
      sendBuffer[i+2]=this.buffer[i];
    }


    //clear
    this.buffer=new Uint8ClampedArray(this.width * this.height * 3);

    if (this.runScheduler) {
      // console.log(this)

      this.scheduler.update();
    }

    this.render();

  }





  run()
  {
    this.socket.on('connect', ()=> this.frame())
    this.socket.connect(this.port, this.ip)

  }



}
