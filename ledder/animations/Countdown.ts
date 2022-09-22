// import Animation from "../Animation.js";
// import Pixel from "../Pixel.js";
// import {FontSimple8x8} from "../fonts/FontSimple8x8.js";
// import Display from "../Display.js";

// function paddy(num, padlen, padchar = '0') {
//     var pad = new Array(1 + padlen).join(padchar);
//     return (pad + num).slice(-pad.length);
// }

// export default class Countdown extends Animation {

//     static title = "Count down timer"
//     static description = ""
//     static presetDir = "Countdown"
//     static category = "Marquees"


//     constructor(display: Display) {
//         super(display);

//         const font = FontSimple8x8

//         let targetDate = new Date('2022-04-18T23:22:42');

//         // let targetDate = new Date('2022-04-01T12:37:42');

//         const intervalControl = display.control.value("Marquee interval", 1, 1, 10, 1);
//         // const textColor=new Color()
//         const textColor = display.control.color("Text color", 255, 0, 0, 1);


//         let blinkdir = 1 / 60
//         let hue = 0;
//         display.scheduler.intervalControlled(intervalControl, () => {

//                 //millesec
//                 let diff = Number(targetDate) - Number(new Date())

//                 if (diff <= 0) {

//                     textColor.a = textColor.a + blinkdir
//                     if (textColor.a >= 1) {
//                         blinkdir = -blinkdir
//                         textColor.a = 1
//                     }
//                     if (textColor.a <= 0) {
//                         blinkdir = -blinkdir
//                         textColor.a = 0
//                     }
//                 }

//                 // hue = (hue + 1)%361
//                 // textColor.setHsl(hue,100,50)

//                 diff = Math.abs(diff)
//                 let ms = diff % 1000

//                 //seconds
//                 diff = ~~(diff / 1000)
//                 let s = diff % 60

//                 //minutes
//                 diff = ~~(diff / 60)
//                 let m = diff % 60

//                 //hours
//                 diff = ~~(diff / 60)
//                 let h = diff

//                 //te groot
//                 // h=h%10


//                 let text = `${h}:${paddy(m, 2)}:${paddy(s, 2)}.${paddy(~~(ms / 10), 2)}`


//                 // //move everything to the left
//                 // for (const p of this.pixels) {
//                 //   p.x--
//                 //   if (p.x<0) {
//                 //     p.destroy(display)
//                 //     this.removePixel(p)
//                 //   }
//                 //
//                 // }

//                 //draw text
//                 display.pixels = []
//                 for (let char_nr = 0; char_nr < text.length; char_nr++) {
//                     const c = text[char_nr];
//                     const xStart = char_nr * (font.width - 1) + 2
//                     if (xStart + (font.width) > display.width)
//                         break
//                     for (let x = 0; x < font.width; x++) {
//                         for (let y = 0; y < font.height; y++) {
//                             if (font.data[c][x][y]) {
//                                 new Pixel(display, xStart + x, y, textColor)
//                             }
//                         }
//                     }
//                 }
//             }
//         )

//     }

// }
