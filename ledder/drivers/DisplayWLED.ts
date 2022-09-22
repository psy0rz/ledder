// import {Display} from "../../ledder/Display.js";

// // @ts-ignore
// import dgram from "dgram";

// //Matrix driver for WLED https://github.com/Aircoookie/WLED/wiki/UDP-Realtime-Control via DRGB
// export class DisplayWLED extends Display {

//   buffer: Uint8ClampedArray;
//   socket: any;
//   flipX: boolean;
//   flipY: boolean;
//   ip: string;
//   port: number;

//   /**
//    * Driver for WLED via UDP protocol
//    * @param scheduler
//    * @param width
//    * @param height
//    * @param flipX Flip X axis
//    * @param flipY Flip Y axis
//    * @param ip IP address
//    * @param port UDP port
//    */
//   constructor(scheduler, width, height, flipX, flipY, ip, port=21324) {
//     super(scheduler, width, height);

//     this.flipX=flipX;
//     this.flipY=flipY;

//     this.ip=ip;
//     this.port=port;

//     this.buffer=new Uint8ClampedArray(this.width * this.height * 3);

//     this.socket = dgram.createSocket('udp4');

//     this.socket.on('error', (err) => {
//       console.log(`server error:\n${err.stack}`);
//     });

//   }

//   //sets a pixel in the render buffer (called from Draw-classes render() functions)
//   setPixel(x,y, color)
//   {

//     if (x>=0 && x<this.width && y>=0 && y<this.height) {
//       let physX;
//       let physY;

//       if (this.flipX)
//         physX=this.width-~~x-1;
//       else
//         physX=~~x;

//       if (this.flipY)
//         physY=this.height-~~y-1;
//       else
//         physY=~~y;

//       const offset = physX * 3 + physY * 3 * this.width;
//       const old_a = 1 - color.a;

//       //store pixel in buffer, alphablend with existing values
//       this.buffer[offset] = (this.buffer[offset] * old_a + gamma[~~color.r] * color.a);
//       this.buffer[offset + 1] = (this.buffer[offset + 1] * old_a + gamma[~~color.g] * color.a);
//       this.buffer[offset + 2] = (this.buffer[offset + 2] * old_a + gamma[~~color.b] * color.a);
//       // this.buffer[offset] = (this.buffer[offset] * old_a + ~~color.r * color.a);
//       // this.buffer[offset + 1] = (this.buffer[offset + 1] * old_a + ~~color.g * color.a);
//       // this.buffer[offset + 2] = (this.buffer[offset + 2] * old_a + ~~color.b * color.a);
//     }
//   }


//   frame()
//   {
//     setTimeout(()=> this.frame(), 1000/this.fpsControl.value)

//     //we want the sending to be timed exactly, so do that first:
//     let sendBuffer=new Uint8Array(2 + this.height * this.width*3);

//     sendBuffer[0]=2;//DRGB protocol
//     sendBuffer[1]=120; //timeout


//     for (let i=0, n=this.buffer.length; i<n; ++i)
//     {
//       sendBuffer[i+2]=this.buffer[i];
//     }


//     //clear
//     this.buffer=new Uint8ClampedArray(this.width * this.height * 3);

//     if (this.runScheduler) {
//       // console.log(this)

//       this.scheduler.update();
//     }

//     this.render();

//   }





//   run()
//   {
//     this.socket.on('connect', ()=> this.frame())
//     this.socket.connect(this.port, this.ip)

//   }



// }
