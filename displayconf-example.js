// import {MatrixRPIupdown} from "./led/MatrixRPIupdown.js";
// import {MatrixWLED} from "./src/js/server/drivers/MatrixWLED.js";
// import {MatrixRPIleftright} from "./src/js/server/drivers/MatrixRPIleftright.js";
import {Scheduler} from "./src/js/ledder/Scheduler.js";
import {DisplayLedstream} from "./src/js/server/drivers/DisplayLedstream.js";
import {ControlGroup} from "./src/js/ledder/ControlGroup.js";
import {MulticastSync} from "./src/js/server/drivers/MulticastSync.js";
import OffsetMapper from "./src/js/server/drivers/OffsetMapper.js";
import GammaMapper from "./src/js/server/drivers/GammaMapper.js";
// import {MatrixWebsocket} from "./src/js/server/drivers/MatrixWebsocket.js";

new MulticastSync('239.137.111.1', 65001, 1000)

    // new MatrixWLED(scheduler, 37, 8, false, false, '192.168.13.176')

    // 5 x  (8x32) matrix on raspberry
    // new MatrixRPIupdown(scheduler, 32, 5),
    //
    // ceilingstrip
    // new MatrixWLED(scheduler, 138, 1, false, false, '192.168.13.247'),
    //
    // pixelflut nurdspace
    // new MatrixPixelflut(scheduler, "10.208.42.159", 5003, 128, 32),
    // new MatrixPixelflut(scheduler, "10.208.42.159", 5008, 64, 24),

    // new MatrixRPIleftright(scheduler, 75, 4, 2, 1),
    // new DisplayLedstream( 2, 75, 8, "esp32-240ac4973068.local", 65000), //smokeplastic


//normaal
let mapper = new OffsetMapper(75, 8, true)
mapper.zigZagX()
export let displayList=[
    new DisplayLedstream( 2, 75, 8, ["esp32-f008d161492c.local"], 65000, mapper), //geverft
]

//verticaal
// let mapper = new OffsetMapper(8, 75, false)
// mapper.zigZagY()
// export let displayList=[
//     new DisplayLedstream( 2, 8, 75, ["esp32-f008d161492c.local"], 65000, mapper), //geverft
// ]

export let nodename="somename"
export let mqttHost='mqtt://mqttserver.com'
export let mqttOpts={

    username: 'abc',
    password: '12345',
}

export let animationName="TestMatrix"
export let presetName=""
// export let animationName="Test"
// export let presetName=""
// export let animationName="Marquee"
// export let presetName="OPEN"
