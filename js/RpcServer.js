import Bundler from "parcel-bundler";
import express from "express";
import expressWs from "express-ws";
import pkg from "json-rpc-2.0";
const {JSONRPC, JSONRPCResponse, JSONRPCServer, JSONRPCServerAndClient, JSONRPCClient} = pkg;

/**
 * Webserver that handles static files and json-rpc-2.0 requests via websocket.
 */
export class RpcServer {

  constructor() {
    let bundler = new Bundler('index.html');

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

    app.use(bundler.middleware());


    app.use(express.static("dist"));


    // app.get('/geert', (req, res) => {
    //   res.send('Hello World!')
    // })

    app.listen(port, () => {
      console.log(`Listening at http://localhost:${port}`)
    })
  }

  /**
   * Add a method to the rpc server
   * @param name Method name
   * @param callback Callback function with actual method.
   */
  addMethod(name, callback)
  {
    this.serverAndClient.addMethod(name, callback);
  }

  /**
   * Call a method on the browser side.
   * @param name Method name
   * @param params Parameters
   */
  request(name, params)
  {
    this.serverAndClient.request(name, params);
  }

}

