import {JSONRPCClient, JSONRPCServer, JSONRPCServerAndClient} from "json-rpc-2.0";
import {Rpc} from "./Rpc.js";
import {RpcServer} from "./RpcServer.js";
import {error, progressDone, progressStart} from "./led/util.js";

/***
 * Browser-side rpc client that connect to server handles rpc calls to/from server.
 */
class RpcClient extends Rpc {

  serverAndClient: JSONRPCServerAndClient;
  openHandler: () => void;
  closeHandler: () => void;
  url: string

  constructor() {
    super();
  }

  init(openHandler, closeHandler = undefined, ws_url=undefined) {

    this.openHandler = openHandler;
    this.closeHandler = closeHandler;

  }

  connect(ip=undefined) {

    let ws_url

    if (ip===undefined)
    {
      if (location.protocol === 'http:')
        ws_url = "ws://" + location.host + "/ws";
      else
        ws_url = "wss://" + location.host + "/ws";
      this.url=`${location.protocol}//${location.host}`
      console.log("Preview url is", this.url)
    }
    else {
      ws_url = `ws://${ip}:3000/ws`
      this.url=`http://${ip}:3000`
    }



    console.log(`Connecting to websocket ${ws_url}`)


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
      console.log("WS Closed", webSocket)
      this.serverAndClient.rejectAllPendingRequests(
        `Connection is closed (${event.reason}).`
      );

      setTimeout(() => this.connect(ip), 1000);

      if (this.closeHandler !== undefined)
        this.closeHandler();

    };


    webSocket.onopen = () => {
      console.log("WS open")
      this.openHandler();
    };
  }

  addMethod(name, method) {
    this.serverAndClient.addMethod(name, method);
  }

  /**
   * Makes a request to the server. Also shows progress-indicator and shows execptions to the user. (slower)
   * @param name
   * @param params
   */
  async request(name, ...params) {

    try {
      progressStart()
      // console.log("RPC request", name, params)
      let result=await this.serverAndClient.request(name, params)
      console.log("RPC",name, params,result)
      progressDone()
      return(result)
    } catch (e) {
      progressDone()
      error("RPC request failed", e)
      console.error("RPC error", name, params, e)
      throw(e)
    }
  }

  /**
   * Make a request to server, without any extra processing and exception handling (faster)
   * @param name
   * @param params
   */
  async requestRaw(name, ...params) {
      return(this.serverAndClient.request(name, params))
  }

  /** Send a notify, doesnt return anything. (fastest)
   *
   * @param name
   * @param params
   */
  async notify(name, ...params)
  {
    this.serverAndClient.notify(name, params)
  }

}

export let rpc=new RpcClient()
