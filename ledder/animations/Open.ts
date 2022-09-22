// import Animation from "../Animation.js";
// import Pixel from "../Pixel.js";
// import {FontSimple8x8} from "../fonts/FontSimple8x8.js";
// import Display from "../Display.js";
// import {AnimationTwinkle} from "../AnimationTwinkle.js";
// import { Color } from "../Color.js";

// export default class Open extends Animation {

//   static title = "Open"
//   static description = ""
//   static presetDir = "Open"
//   static category = "Marquees"


//   constructor(display:Display ) {
//     super(display);

//     const font=FontSimple8x8
//     const text="Open! "

//     const width = text.length * font.width;
//     let char_nr = 0;
//     let x = 0;

//     const intervalControl = display.control.value("Marquee interval", 1, 1, 10, 1);
//     // const colorControl = display.control.color("Text color");
//     // let colorControl=new Color()

//     new AnimationTwinkle(display, this.pixels)

//     let hue=0;

//     display.scheduler.intervalControlled(intervalControl, () => {

//       //move everything to the left
//       for (const p of this.pixels) {
//         p.x--
//         if (p.x<0) {
//           p.destroy(display)
//           this.removePixel(p)
//         }

//       }


//       hue=(hue+5)%360
//       //add column to the right
//       const c = text[char_nr];
//       for (let y=0; y<font.height; y++)
//       {
//         if (font.data[c][x][y])
//         {
//           let color=new Color()
//           color.setHsl(hue/360,1,0.5)
//           this.addPixel(new Pixel(display, display.width-1,y, color))
//         }

//       }

//       //goto next column
//       x = x + 1;
//       if (x == font.width) {
//         char_nr++
//         if (char_nr>=text.length)
//           char_nr=0
//         x=0;
//       }

//       return true
//     })

//   }

// }
