import dgram from "dgram";

export class MulticastSync {
    socket: dgram.Socket;
    packet: Uint8Array;
    interval: number;

    startTime:bigint;
    startMillis:number;
    ourTime:number;

    constructor(groupIp, port, interval) {
        this.socket = dgram.createSocket('udp4')


        this.interval = interval;

        this.packet = new Uint8Array(4);

        this.socket.on('connect', () => {
            setInterval(() => this.pulse(), this.interval)
            // this.startTime=Date.now();
            // this.ourTime=Date.now();
            // this.pulse()
        })
        this.socket.connect(port, groupIp)
        // this.startTime=process.hrtime.bigint();
        // this.startMillis=Date.now();
    }

    pulse() {

        // let n=process.hrtime.bigint();
        // console.log((int)(n-this.startTime)/1000000n )
        // console.log(Date.now()-this.startMillis)

        // const diff=Date.now()-this.ourTime;
        // setTimeout( ()=>this.pulse(), this.interval-diff)
        // this.ourTime=this.ourTime+this.interval;
        // console.log(diff);


        // this.test=Date.now();
        const now = Date.now();

        this.packet[3] = ((now  >> 24) & 0xff)
        this.packet[2] = ((now  >> 16) & 0xff)
        this.packet[1] = ((now  >> 8) & 0xff)
        this.packet[0] = (now & 0xff)
        this.socket.send(this.packet);

    }

}
