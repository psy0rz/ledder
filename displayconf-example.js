import OffsetMapper from "./ledder/server/drivers/OffsetMapper.js"
import {DisplayLedstream} from "./ledder/server/drivers/DisplayLedstream.js"
//import {DisplayRPI} from "./ledder/server/drivers/DisplayRPI.js"

export let displayList=[];

//Raspberry PI with 5 displays next to eachother, the displays are zigzag displays of 8x32 pixels
// (standard ali express stuff)
// This uses https://github.com/psy0rz/rpi-ws281x-smi
// let mapper = new OffsetMapper(32*5, 8, false)
// mapper.zigZagY()
// mapper.flipY()
// displayList.push(new DisplayRPI(32*5, 8, 8*32, mapper))


/////////// normal landscape 75 x 8, left zigzagged ledstream:
// let mapper = new OffsetMapper(75, 8, true)
// mapper.zigZagX()
// mapper.flipY()
// displayList.push(
//     // new DisplayLedstream( 2, 75, 8, ["esp32-240ac4973068.local"], 65000, mapper), //smokeplastic board
//     new DisplayLedstream( 2, 75, 8, ["10.0.0.160"], 65000, mapper), //painted board
// )
//
// ///////////// display pascal HSD
// mapper = new OffsetMapper(18*4, 18, false)
// mapper.zigZagY()
// // mapper.flipY()
// displayList.push(    new DisplayLedstream( 4, 18*4, 18, ["10.0.0.183"], 65000, mapper))

// /////////// vertical landscape mode 75 x 8, left zigzagged ledstream.
// //For ledder the display now has width 8 and height 75.
// new MulticastSync('239.137.111.1', 65001, 1000)
// let mapper = new OffsetMapper(8, 75, false)
// mapper.zigZagY()
// displayList=[
//     new DisplayLedstream( 2, 8, 75, ["esp32-f008d161492c.local"], 65000, mapper), //painted board
// ]


//default animation and preset
export let animationName="Tests/TestMatrix"
export let presetName="default"

export let brightness=255
export let gamma=2.8
