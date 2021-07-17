import {JSONRPCClient, JSONRPCServer, JSONRPCServerAndClient} from "json-rpc-2.0";
import {Rpc} from "./Rpc.js";

/***
 * Browser-side rpc client that connect to server handles rpc calls to/from server.
 */
export class RpcClient extends Rpc {

  serverAndClient: JSONRPCServerAndClient;
  openHandler: () => void;
  closeHandler: () => void;

  constructor(openHandler, closeHandler = undefined) {
    super();

    this.openHandler = openHandler;
    this.closeHandler = closeHandler;

    this.connect();
  }

  connect()
  {
    console.log("startt")

    let ws_url;
    if (location.protocol === 'http:')
      ws_url = "ws://" + location.host + "/ws";
    else
      ws_url = "wss://" + location.host + "/ws";

    const webSocket = new WebSocket(ws_url);

    this.serverAndClient = new JSONRPCServerAndClient(
      new JSONRPCServer(),
      new JSONRPCClient((request) => {
        try {
          webSocket.send(JSON.stringify(request));
          return Promise.resolve();
        } catch (error) {
          return Promise.reject(error);
        }
      })
    );

    webSocket.onmessage = (event) => {
      this.serverAndClient.receiveAndSend(JSON.parse(event.data.toString()));
    };

    // On close, make sure to reject all the pending requests to prevent hanging.
    webSocket.onclose = (event) => {
      this.serverAndClient.rejectAllPendingRequests(
        `Connection is closed (${event.reason}).`
      );

      console.log("disc")
      setTimeout(()=> this.connect(), 1000);

      if (this.closeHandler !== undefined)
        this.closeHandler();

    };

    this.serverAndClient.addMethod("echo", (text) => {
      console.log("echo", text);

    });

    webSocket.onopen = () => {
      this.openHandler();
    };
  }

  addMethod(name, method) {
    this.serverAndClient.addMethod(name, method);
  }

  request(name, ...params) {
    try {

      return (this.serverAndClient.request(name, params));
    }
    catch(e)
    {
      console.error("hier" , e);
    }
  }


}
