// import {Pixel} from "../ledder/Pixel.js";
// import {PixelContainer} from "../ledder/PixelContainer.js";
// import {Color} from "../ledder/Color.js";
// import {DisplayDummy} from "./drivers/DisplayDummy.js";

// function ops(fn, runForMs = 1000) {

//     fn() //precache/jit

//     const start = process.hrtime.bigint()
//     const ogNow = Date.now()
//     const endAt = ogNow + runForMs

//     let ops = 0n
//     let now = ogNow
//     while (now < endAt) {
//         fn()
//         ops += 1n
//         now = Date.now()
//     }

//     const ranFor = process.hrtime.bigint() - start
//     const result = ~~((ops * 1000000000n) / ranFor)

//     console.log(`${fn}: ${result} op/s`)
//     return result
// }


// function containerTest() {

//     let m = new DisplayDummy(10, 10)

//     let c = new PixelContainer()
//     for (let i = 0; i < 1000; i++) {
//         c.addPixel(new Pixel(m, 1, 1, new Color()))
//     }


//     ops(() => {
//         let test = new PixelContainer()
//         // for (let i = 0; i < c.pixels.length; i++)
//         //     test.addPixel(c.pixels[i])
//         for (const p of c.pixels)
//             test.addPixel(p)

//         console.assert(test.pixels.size==1000)
//     })

//     ops(() => {
//         let test = new PixelContainer()
//         for (const p of c.pixels)
//             test.addPixel(p)
//         for (const p of c.pixels)
//             test.removePixel(p)

//         console.assert(test.pixels.size==0)
//     })

//     // ops(() => {
//     //     let test = new PixelContainer()
//     //     for (let i = 0; i < c.pixels.length; i++)
//     //         test.addPixel(c.pixels[i])
//     //     for (let i = 0; i < c.pixels.length; i++)
//     //         test.removePixel(c.pixels[i])
//     //
//     //     // console.assert(test.pixels.length==/0)
//     // })
//     //
//     //
//     // ops(() => {
//     //     let test = new PixelContainer()
//     //     for (let i = 0; i < c.pixels.length; i++)
//     //         test.addPixelBG(c.pixels[i])
//     //
//     //     console.assert(test.pixels.length==1000)
//     // })
//     //
//     //
//     // ops(() => {
//     //     let test = new PixelContainer()
//     //     test.addPixels(c.pixels)
//     //     console.assert(test.pixels.length==1000)
//     // })
//     //
//     // ops(() => {
//     //     let test = new PixelContainer()
//     //     test.add(c)
//     //     console.assert(test.pixels.length==1000)
//     // })

// }

// containerTest()

