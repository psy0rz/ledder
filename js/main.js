import { MatrixCanvas } from "./MatrixCanvas.js";
import { AnimationTest } from "./AnimationTest.js";
import { Scheduler } from "./Scheduler.js";
let scheduler = new Scheduler();
let matrix = new MatrixCanvas(scheduler, 37, 8, '#matrix', 5, 16);
scheduler.interval(60, () => {
    scheduler.status();
    matrix.status();
});
new AnimationTest(matrix);
matrix.run();
console.log("ja");
import { JSONRPCServer, JSONRPCServerAndClient, JSONRPCClient } from "json-rpc-2.0";
// let ws_url;
// if (location.protocol === 'http:') {
//   ws_url = "ws://" + location.host + "/ws";
//   else
const webSocket = new WebSocket("");
const serverAndClient = new JSONRPCServerAndClient(new JSONRPCServer(), new JSONRPCClient((request) => {
    try {
        webSocket.send(JSON.stringify(request));
        return Promise.resolve();
    }
    catch (error) {
        return Promise.reject(error);
    }
}));
webSocket.onmessage = (event) => {
    serverAndClient.receiveAndSend(JSON.parse(event.data.toString()));
};
// On close, make sure to reject all the pending requests to prevent hanging.
webSocket.onclose = (event) => {
    serverAndClient.rejectAllPendingRequests(`Connection is closed (${event.reason}).`);
};
// serverAndClient.addMethod("echo", ({ text }) => text);
serverAndClient
    .request("add", { x: 1, y: 2 })
    .then((result) => console.log(`1 + 2 = ${result}`));
//# sourceMappingURL=main.js.map