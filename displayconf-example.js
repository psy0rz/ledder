export let displayList=[];

// /////////// normal landscape 75 x 8, left zigzagged ledstream:
// new MulticastSync('239.137.111.1', 65001, 1000)
// let mapper = new OffsetMapper(75, 8, true)
// mapper.zigZagX()
// displayList=[
//     new DisplayLedstream( 2, 75, 8, ["esp32-240ac4973068.local"], 65000, mapper), //smokeplastic board
//     new DisplayLedstream( 2, 75, 8, ["esp32-f008d161492c.local"], 65000, mapper), //painted board
// ]

// /////////// vertical landscape mode 75 x 8, left zigzagged ledstream.
// //For ledder the display now has width 8 and height 75.
// new MulticastSync('239.137.111.1', 65001, 1000)
// let mapper = new OffsetMapper(8, 75, false)
// mapper.zigZagY()
// displayList=[
//     new DisplayLedstream( 2, 8, 75, ["esp32-f008d161492c.local"], 65000, mapper), //painted board
// ]

//mqtt stuff used by some animations
export let nodename="somename"
export let mqttHost='mqtt://mqttserver.com'
export let mqttOpts={

    username: 'abc',
    password: '12345',
}

//default animation and preset
export let animationName="TestMatrix"
export let presetName=""
