import { Scheduler } from "./Scheduler.js";
import { MatrixWLED } from "./MatrixWLED.js";
import { RpcServer } from "./RpcServer.js";
let rpc = new RpcServer();
let scheduler = new Scheduler();
let matrix = new MatrixWLED(scheduler, 37, 8, false, false, '192.168.13.176');
rpc.addMethod("run", ({ name }) => {
    matrix.clear();
    return import("./" + name + ".js")
        .then((module) => {
        new module[name](matrix);
    });
});
matrix.run();
//# sourceMappingURL=server.js.map