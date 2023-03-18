import OffsetMapper from "./ledder/server/drivers/OffsetMapper.js"

import {channel} from "diagnostics_channel"
import {DisplayQOISudp} from "./ledder/server/drivers/DisplayQOISudp.js"
//import {DisplayRPI} from "./ledder/server/drivers/DisplayRPI.js"

export let displayList = []

/////////// simple 8x32 matrix zigzag
// let matrixzigzag = new OffsetMapper(32, 8, false)
// matrixzigzag.zigZagY()
// matrixzigzag.flipY()
// displayList.push(new DisplayQOISudp(matrixzigzag, ["10.0.0.201"], 65000))



/////////// 10 stacked 8*32 matrixes
// let displayWidth=8;
// let displayHeight=32;
// let stackWidth=10;
// let stackHeight=1;

// //mapper for one display unit

// let right=new OffsetMapper(displayWidth,displayHeight, true);
// right.zigZagX()
// right.flipX()
// right.flipY()

// //the combined mapper that will contain all displays combined:
// let grid=new OffsetMapper(displayWidth*stackWidth, displayHeight*stackHeight, false)
// grid.addGrid(right, 0,0,0)
// grid.addGrid(right, 1,0,1)

// grid.addGrid(right, 2,0,4)
// grid.addGrid(right, 3,0,5)

// grid.addGrid(right, 4,0,2)
// grid.addGrid(right, 5,0,3)

// grid.addGrid(right, 6,0,8)
// grid.addGrid(right, 7,0,9)

// grid.addGrid(right, 8,0,6)
// grid.addGrid(right, 9,0,7)

// displayList.push(
//     new DisplayQOISudp(grid, ["192.168.13.116"], 65000),
//     // new DisplayQOISudp(grid, ["10.0.0.209"], 65000),
//     // new DisplayQOISudp(grid, ["204.2.68.66"], 65000),
// )

//
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

//XXX: raspberry needs to be fixed
//Raspberry PI with 5 displays next to eachother, the displays are zigzag displays of 8x32 pixels
// (standard ali express stuff)
// This uses https://github.com/psy0rz/rpi-ws281x-smi
// let mapper = new OffsetMapper(32*5, 8, false)
// mapper.zigZagY()
// mapper.flipY()
// displayList.push(new DisplayRPI(32*5, 8, 8*32, mapper))




//default animation and preset
export let animation = "Tests/TestMatrix/default"

export let brightness = 255
export let gamma = 2.8
