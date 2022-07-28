// import {MatrixRPIupdown} from "./led/MatrixRPIupdown.js";
import {Scheduler} from "./src/js/ledder/Scheduler.js";
import {MulticastSync} from "./src/js/server/drivers/MulticastSync.js";
import {DisplayLedstream} from "./src/js/server/drivers/DisplayLedstream.js";
import OffsetMapper from "./src/js/server/drivers/OffsetMapper.js"

let scheduler = new Scheduler();

export const animationName="Cycle"
export const presetName=""

//hsd
// new MulticastSync('239.137.111.222',65001,1000)
new MulticastSync('239.137.111.1',65001,1000)

let mapper=new OffsetMapper(75,8)
mapper.zigZagX()


let mapperPascal=new OffsetMapper(64,8)
mapperPascal.snake()
mapperPascal.zigZagY()

export let displayList=[


    //led cone ding
    // new MatrixWLED(scheduler, 37, 8, false, false, '192.168.13.176')

    // 5 x  (8x32) matrix on raspberry
    // matrixList.push(new MatrixRPIupdown(scheduler, 32, 5));
    //
    // ceilingstrip
    // matrixList.push(new MatrixWLED(scheduler, 138, 1, false, false, '192.168.13.247'));
    //
    // pixelflut nurdspace
    // matrixList.push(new MatrixPixelflut(scheduler, "10.208.42.159", 5003, 128, 32))
    // matrixList.push(new MatrixPixelflut(scheduler, "10.208.42.159", 5008, 64, 24))

    // new MatrixRPIleftright(scheduler, 75, 4, 2, 1),

    // new MatrixLedstream(scheduler, 2, 75,8, '192.168.13.147', 65000) //testboard
    // new MatrixLedstream(scheduler, 2, 75,8, '192.168.13.169', 65000) //plastic
    // new MatrixLedstream(scheduler, 1, 37,8, '10.0.0.209', 65000), //cone
    // new MatrixLedstreamQuad(scheduler, 4, 18*4,18, '10.0.0.183', 50,65000) //quad

    // new MatrixLedstream( 2, 75,8, '10.10.10.18', 65000) //plastic via apmode
    // new MatrixLedstream( 2, 75,8, '192.168.39.33', 65000) //plastic via phone
    // new DisplayLedstream( 2, 75,8, 'esp32-240ac4973068.local', 65000, mapper), //plastic
    // new DisplayLedstream( 2, 75,8, 'esp32-f008d161492c.local', 65000, mapper)  //verf
    // new DisplayLedstream( 2, 75,8, [ 'esp32-240ac4973068.local', 'esp32-f008d161492c.local'], 65000, mapper),  //verf
    new DisplayLedstream( 2, 75,8, [  'esp32-f008d161492c.local'], 65000, mapper),

    // new DisplayLedstream( 2, 64,8, [ 'esp32-083af2522308.local'], 65000, mapperPascal)  //pascal


]

export let nodename="psyt14s"
export let mqttHost='mqtt://mqtt.hackerspace-drenthe.nl'
export let mqttOpts={

    username: 'HSD',
    password: 'xxx',
}
`
