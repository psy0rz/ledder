// import Bundler from "parcel-bundler";
import express from "express";
import expressWs from "express-ws";
import {JSONRPCClient, JSONRPCServer, JSONRPCServerAndClient} from "json-rpc-2.0";
import {Rpc} from "./Rpc.js";


/**
 * Nodejs server-side webserver that handles static files and json-rpc-2.0 requests via websocket.
 */
export class RpcServer extends Rpc {

  serverAndClient: JSONRPCServerAndClient;

  constructor() {
    super();
    // let bundler = new Bundler('index.html');

    const app = express()
    const port = 3000

    expressWs(app);

    let lastWs;

    this.serverAndClient = new JSONRPCServerAndClient(
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

    app.ws('/ws', (ws, req) => {
      lastWs = ws;
      ws.on('message', (msg) => {
        this.serverAndClient.receiveAndSend(JSON.parse(msg.toString()));
      });
    });

    //allow acces to presets dir to get preview-files
    app.use("/presets", express.static("presets"));

    //automatic run parcel bundler on filesystem changes
    // app.use(bundler.middleware());
    app.use(express.static("dist"));

    app.listen(port, () => {
      console.log(`Listening at http://localhost:${port}`)
    })


  }

  addMethod(name, method)
  {
    this.serverAndClient.addMethod(name, method);
  }

  request(name, ...params)
  {
    return(this.serverAndClient.request(name, params));
  }

}

