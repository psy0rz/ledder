
// import Pixel from "../Pixel.js";
// import Animation from "../Animation.js";
// import {AnimationBlink} from "../AnimationBlink.js";
// import {AnimationMove} from "../AnimationMove.js";
// import Display from "../Display.js";
// import Color from "../Color.js";

// export default class SyncTest extends Animation {

//   static title="Matrix test sync"
//   static description="Test smoothness and syncronisation of multiple displayes"


//   constructor(display: Display) {
//         super(display);

//       let moveX=new AnimationMove(display, {value: 1}, {value: 1}, {value: 0}, true );
//       let moveY=new AnimationMove(display, {value: 4}, {value: 0}, {value: 1}, true );

//       for (let x=0; x<display.width; x=x+32) {
//           for (let y = 0; y < display.height; y++) {
//               moveX.addPixel(new Pixel(display, x, y, new Color(255, 0, 0)));
//           }
//       }
//       // for (let x=0; x<display.width; x++) {
//       //         moveY.addPixel(new Pixel(display, x, 0, new Color(0, 0, 255)));
//       //     }

//     }

// }
