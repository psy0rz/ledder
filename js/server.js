
import {MatrixWLED} from "./MatrixWLED.js";
import {Scheduler} from "./Scheduler.js";
import express from "express";
import Bundler from "parcel-bundler";
import expressWs from "express-ws";
import pkg from 'json-rpc-2.0';
const {JSONRPC, JSONRPCResponse, JSONRPCServer, JSONRPCServerAndClient, JSONRPCClient} = pkg;


let bundler = new Bundler('index.html');


const app = express()
const port = 3000

expressWs(app);

let lastWs;

const serverAndClient = new JSONRPCServerAndClient(
  new JSONRPCServer(),
  new JSONRPCClient((request) => {
    try {
      lastWs.send(JSON.stringify(request));
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  })
);

serverAndClient.addMethod('add', (params)=>
{
  console.log("adding", params);
  serverAndClient.request('echo', "moi");
  return(5);
});

app.ws('/ws', (ws, req) => {
  lastWs=ws;
  ws.on('message', function(msg) {
    serverAndClient.receiveAndSend(JSON.parse(msg.toString()));
  });
});

app.use(bundler.middleware());


app.use(express.static("dist"));


// app.get('/geert', (req, res) => {
//   res.send('Hello World!')
// })

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})


let scheduler = new Scheduler();
let matrix=new MatrixWLED(scheduler, 37,8, false, false, '192.168.13.176');

import("./AnimationTest.js")
  .then((module) => {
    // new module.AnimationTest(matrix);
    matrix.run();
  });








