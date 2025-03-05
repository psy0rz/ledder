import OffsetMapper from "./ledder/server/drivers/OffsetMapper.js"

import {DisplayQOISudp} from "./ledder/server/drivers/DisplayQOISudp.js"
//import {DisplayRPI} from "./ledder/server/drivers/DisplayRPI.js"
import {DisplayWLED} from "./ledder/server/drivers/DisplayWLED.js"
import {DisplayQOIShttp} from "./ledder/server/drivers/DisplayQOIShttp.js";
import DisplayPixelflut from "./ledder/server/drivers/DisplayPixelflut.js";
import DisplayPixelflutBinary from "./ledder/server/drivers/DisplayPixelflutBinary.js";

export let displayList = []

/////////// single 8x32 matrix zigzag display
// (channel0) --> (8x32 display)
//  let matrixzigzag8x32 = new OffsetMapper(32, 8, false)
//  matrixzigzag8x32.zigZagY()
//  matrixzigzag8x32.flipY()
// displayList.push(new DisplayQOISudp(matrixzigzag8x32, ["192.168.13.184"], 65000,0))

/////////// two 8x32 displays on two channels, stacked in length
// (channel0) --> (8x32 left display)
// (channel1) --> (8x32 right display)
// let matrixzigzag = new OffsetMapper(32, 8, false)
// matrixzigzag.zigZagY()
// matrixzigzag.flipY()
// let stackedMatrix=new OffsetMapper(64,8, false)
// stackedMatrix.addGrid(matrixzigzag, 0,0,0)
// stackedMatrix.addGrid(matrixzigzag, 1,0,1)
// displayList.push(new DisplayQOISudp(stackedMatrix, ["192.168.13.137"], 65000,256))

/////////// two 8x32 displays on two channels, stacked in height
// (channel0) --> (8x32 top display)
// (channel1) --> (8x32 bottom display)
// let matrixzigzag = new OffsetMapper(32, 8, false)
// matrixzigzag.zigZagY()
// matrixzigzag.flipY()
// let stackedMatrix=new OffsetMapper(32,16, false)
// stackedMatrix.addGrid(matrixzigzag, 0,0,0)
// stackedMatrix.addGrid(matrixzigzag, 0,1,1)
// displayList.push(new DisplayQOISudp(stackedMatrix, ["192.168.13.137"], 65000,256))

/////////// two 8x32 displays on one channel, stacked in length
// (channel0) --> (8x32 left display) --> (8x32 right display)
// let matrixzigzag = new OffsetMapper(32, 8, false)
// matrixzigzag.zigZagY()
// matrixzigzag.flipY()
// let stackedMatrix=new OffsetMapper(64,8, false)
// stackedMatrix.addGrid(matrixzigzag, 0,0,0)
// stackedMatrix.addGrid(matrixzigzag, 1,0,1)
// displayList.push(new DisplayQOISudp(stackedMatrix, ["192.168.13.137"], 65000,512))

/////////// two 8x32 displays on one channel, stacked in height
// (channel0) --> (8x32 top display) --> (8x32 bottom display)
// let matrixzigzag = new OffsetMapper(32, 8, false)
// matrixzigzag.zigZagY()
// matrixzigzag.flipY()
// let stackedMatrix=new OffsetMapper(32,16, false)
// stackedMatrix.addGrid(matrixzigzag, 0,0,0)
// stackedMatrix.addGrid(matrixzigzag, 0,1,1)
// displayList.push(new DisplayQOISudp(stackedMatrix, ["192.168.13.137"], 65000,512))

/////////// four 8x32 displays on two channels
// (channel0) --> (8x32 top left display) --> (8x32 top right display)
// (channel1) --> (8x32 bottom left display) --> (8x32 bottom right display)
// let matrixzigzag = new OffsetMapper(32, 8, false)
// matrixzigzag.zigZagY()
// matrixzigzag.flipY()
// let stackedMatrix=new OffsetMapper(64,16, false)
// stackedMatrix.addGrid(matrixzigzag, 0,0,0)
// stackedMatrix.addGrid(matrixzigzag, 1,0,1)
// stackedMatrix.addGrid(matrixzigzag, 0,1,2)
// stackedMatrix.addGrid(matrixzigzag, 1,1,3)
// displayList.push(new DisplayQOISudp(stackedMatrix, ["192.168.13.142"], 65000,512))



/////////// use the maximum config: eight channels with 2 displays per channel.
// let matrixzigzag = new OffsetMapper(32, 8, false)
// matrixzigzag.zigZagY()
// matrixzigzag.flipY()
// let stackedMatrix=new OffsetMapper(32*2,8*8, false)
// stackedMatrix.addGrid(matrixzigzag, 0,0,0)
// stackedMatrix.addGrid(matrixzigzag, 1,0,1)
//
// stackedMatrix.addGrid(matrixzigzag, 0,1,2)
// stackedMatrix.addGrid(matrixzigzag, 1,1,3)
//
// stackedMatrix.addGrid(matrixzigzag, 0,2,4)
// stackedMatrix.addGrid(matrixzigzag, 1,2,5)
//
// stackedMatrix.addGrid(matrixzigzag, 0,3,6)
// stackedMatrix.addGrid(matrixzigzag, 1,3,7)
//
// stackedMatrix.addGrid(matrixzigzag, 0,4,8)
// stackedMatrix.addGrid(matrixzigzag, 1,4,9)
//
// stackedMatrix.addGrid(matrixzigzag, 0,5,10)
// stackedMatrix.addGrid(matrixzigzag, 1,5,11)
//
// stackedMatrix.addGrid(matrixzigzag, 0,6,12)
// stackedMatrix.addGrid(matrixzigzag, 1,6,13)
//
// stackedMatrix.addGrid(matrixzigzag, 0,7,14)
// stackedMatrix.addGrid(matrixzigzag, 1,7,15)
//
//
// displayList.push(new DisplayQOISudp(stackedMatrix, ["192.168.13.137"], 65000,512))


/////////// normal landscape 75 x 8, left zigzagged ledstream:
//  let mapper = new OffsetMapper(75, 8, true)
//  mapper.zigZagX()
//  mapper.flipY()
//  displayList.push(
//      // new DisplayLedstream( 2, 75, 8, ["esp32-240ac4973068.local"], 65000, mapper), //smokeplastic board
// //     new DisplayLedstream( 2, 75, 8, ["10.0.0.160"], 65000, mapper), //painted board
//      new DisplayQOISudp( mapper, ["10.10.10.12"], 65000), //painted board
//  )

//
/////////// display pascal HSD
// let pascal = new OffsetMapper(18*4, 18, false)
// pascal.zigZagY()
// displayList.push(    new DisplayQOISudp( pascal,["10.0.0.183"], 65000))

// /////////// vertical landscape mode 75 x 8, left zigzagged ledstream.
// //For ledder the display now has width 8 and height 75.
// new MulticastSync('239.137.111.1', 65001, 1000)
// let mapper = new OffsetMapper(8, 75, false)
// mapper.zigZagY()
// displayList=[
//     new DisplayLedstream( 2, 8, 75, ["esp32-f008d161492c.local"], 65000, mapper), //painted board
// ]


//Raspberry PI with 10 portrait 8x32 displays next to eachother.
// Each channel has one display.
// This uses https://github.com/psy0rz/rpi-ws281x-smi
// To figure our the displayNr order, use Tests/TestGrid/alu10x
// let matrixZigZag = new OffsetMapper(8, 32, true)
// matrixZigZag.zigZagX()
// matrixZigZag.flipX()
// matrixZigZag.flipY()
//
// let stackedMatrix = new OffsetMapper(8*10, 32, true)
// stackedMatrix.addGrid(matrixZigZag, 0,0, 6)
// stackedMatrix.addGrid(matrixZigZag, 1,0, 4)
// stackedMatrix.addGrid(matrixZigZag, 2,0, 2)
// stackedMatrix.addGrid(matrixZigZag, 3,0, 3)
// stackedMatrix.addGrid(matrixZigZag, 4,0, 0)
// stackedMatrix.addGrid(matrixZigZag, 5,0, 8)
// stackedMatrix.addGrid(matrixZigZag, 6,0, 1)
// stackedMatrix.addGrid(matrixZigZag, 7,0, 9)
// stackedMatrix.addGrid(matrixZigZag, 8,0, 7)
// stackedMatrix.addGrid(matrixZigZag, 9,0, 5)
// displayList.push(new DisplayRPI(stackedMatrix, 8*32)) //1 display per channel (8*32)

//Raspberry PI with 8 ledstrings on volleyball net.
//let mapper = new OffsetMapper(66, 8, true, [1,2,3,6,5,7,4,0])
//mapper.flipY()
//displayList.push(new DisplayRPI(mapper,66,1))

//Raspberry PI with 5 displays next to eachother in a loop, the displays are zigzag displays of 8x32 pixels
// (standard ali express stuff)
// let mapper = new OffsetMapper(32*5, 8, false)
// mapper.zigZagY()
// mapper.flipY()
//displayList.push(new DisplayRPI(mapper, 32*8))

/////////// WLED https://github.com/Aircoookie/WLED/wiki/UDP-Realtime-Control via DRGB
// displayList.push(new DisplayWLED(37,8, false, false, '10.0.0.209'))

//Offline static rendering
//Display downloads animation one time and stores it in flash and loops it forever)
// let matrixzigzag8x32 = new OffsetMapper(32, 8, false)
// matrixzigzag8x32.zigZagY()
// matrixzigzag8x32.flipY()
// let staticDisplay=new DisplayQOISstream(matrixzigzag8x32, 256)
// export let staticDisplayList=[ staticDisplay]


////////////// PIXEL FLUT
// let display=new DisplayPixelflut(50,8,'table.c3pixelflut.de', 1337, 12,10)
// let display=new DisplayPixelflut(50,8,'wall.c3pixelflut.de', 1337, 12,10)

// let display=new DisplayPixelflut(128,32,'tickerpi.lan.nurd.space', 5004)
// let display=new DisplayPixelflut(64,16,'tickerpi.lan.nurd.space', 5004)
// let display=new DisplayPixelflutBinary(128,32,'10.208.1.48', 5004)
// displayList.push(display)

// ////////////// ledstream via http
// let mapper = new OffsetMapper(64, 32, true)
// displayList.push(new DisplayQOIShttp(mapper, "983DAEEDA39C" ))
// displayList.push(new DisplayQOIShttp(mapper, "AB43DE321453" ))



//default animation and preset
export let animation = "Tests/TestMatrix/default"

