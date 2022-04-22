import express from "express";
import expressWs from "express-ws";
import {JSONRPCServer} from "json-rpc-2.0";
import {Rpc} from "../Rpc.js";
import {WsContext} from "./WsContext.js";
import {Scheduler} from "../ledder/Scheduler.js";
import {MatrixWebsocket} from "./drivers/MatrixWebsocket.js";

let vite
if (process.env.NODE_ENV == 'development')
    vite = await import("vite")



/**
 * Nodejs server-side webserver that handles static files and json-rpc-2.0 requests via websocket.
 */
export class RpcServer extends Rpc {

    serverAndClient: JSONRPCServer<WsContext>;
    m:MatrixWebsocket

    constructor(m) {
        super();
        this.m=m

        const app = express()
        const port = 3000


        // use vite's connect instance as middleware, when in dev mode
        if (process.env.NODE_ENV == 'development') {
            vite.createServer({
                server: {middlewareMode: "html"},

            }).then(vite => {
                app.use(vite.middlewares)
            })
        }
        expressWs(app);

        // let lastWs;

        this.serverAndClient = new JSONRPCServer<WsContext>()

        app.ws('/ws', (ws, req) => {

            let context=new WsContext()

                this.m.ws=ws


            ws.on('message', async (msg) => {
                const response = await this.serverAndClient.receive(JSON.parse(msg.toString()), context);
                if (response)
                    ws.send(JSON.stringify(response))

            });
        });

        //allow acces to presets dir to get preview-files
        app.use("/presets", express.static("presets"));

        if (process.env.NODE_ENV != 'development')
            app.use(express.static("www"));

        app.listen(port, () => {
            console.log(`Listening at http://localhost:${port}`)
        })


    }

    addMethod(name, method: (params: any[], context:WsContext) => void) {
        this.serverAndClient.addMethod(name, method);
    }

    request(name, ...params) {
        // return (this.serverAndClient.request(name, params));
    }

}

