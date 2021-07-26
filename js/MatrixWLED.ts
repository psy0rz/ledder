import {Matrix} from "./Matrix.js";

// @ts-ignore
import dgram from "dgram";

//Matrix driver for WLED https://github.com/Aircoookie/WLED/wiki/UDP-Realtime-Control
export class MatrixWLED extends Matrix {

  buffer: Uint8Array;
  prevBuffer: Uint8Array;
  socket: any;
  flipX: boolean;
  flipY: boolean;

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

    this.buffer=new Uint8Array(this.width * this.height * 3);

    this.socket = dgram.createSocket('udp4');

    this.socket.on('error', (err) => {
      console.log(`server error:\n${err.stack}`);
    });
    this.socket.connect(port, ip);

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
      this.buffer[offset] = ~~(this.buffer[offset] * old_a + color.r * color.a);
      this.buffer[offset + 1] = ~~(this.buffer[offset + 1] * old_a + color.g * color.a);
      this.buffer[offset + 2] = ~~(this.buffer[offset + 2] * old_a + color.b * color.a);
    }
  }


  frame()
  {
    //store old buffer, create new one
    this.prevBuffer=this.buffer;
    this.buffer=new Uint8Array(this.width * this.height * 3);

    if (this.runScheduler)
      this.scheduler.update();

    this.render();

    let sendBuffer=new Uint8Array(2 + this.height * this.width*3);

    sendBuffer[0]=2;//DRGB protocol
    sendBuffer[1]=120; //timeout

    let changed=false;

    for (let i=0, n=this.buffer.length; i<n; ++i)
    {
      if (this.buffer[i]!=this.prevBuffer[i])
        changed=true;
      // //blur with previous frame to make animations smoother?
      // sendBuffer[i+2]=(this.buffer[i]+this.prevBuffer[i])/2;
      sendBuffer[i+2]=this.buffer[i];
    }

    // if (changed) {
    //always send at 60 updates/s, otherwise it will stutter
        this.socket.send(sendBuffer);
    // }

  }





  run()
  {
    setInterval(() => { this.frame() }, 1000/60);
  }


}
