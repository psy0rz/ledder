import express, {Express} from "express"
import expressWs from "express-ws";

import {JSONRPCClient, JSONRPCServer, JSONRPCServerAndClient} from "json-rpc-2.0";
import {Rpc} from "../../src/js/Rpc.js";
import {WsContext} from "./WsContext.js";

let vite
if (process.env.NODE_ENV == 'development')
    vite = await import("vite")


/**
 * Nodejs server-side webserver that handles static files and json-rpc-2.0 requests via websocket.
 */
export class RpcServer extends Rpc {

    server: JSONRPCServerAndClient<WsContext, WsContext>;
    idCount: number
    public app: Express



    constructor() {
        super();

        console.log("Creating RPC server")

        this.app = express()

        const port = 3000

        this.idCount=0

        // use vite's connect instance as middleware, when in dev mode
        if (process.env.NODE_ENV == 'development') {
            vite.createServer({
                server: {middlewareMode: "html"},

            }).then(vite => {
                this.app.use(vite.middlewares)
            })
        }
        expressWs(this.app);

        // let lastWs;

        this.server = new JSONRPCServerAndClient<WsContext, WsContext>(
            new JSONRPCServer<WsContext>(),
            new JSONRPCClient<WsContext>((request, context) => {
                try {
                    context.ws.send(JSON.stringify(request));
                    return Promise.resolve();
                } catch (error) {
                    return Promise.reject(error);
                }
            })
        );

        // @ts-ignore
        this.app.ws('/ws', (ws, req) => {
            this.idCount++
            let context = new WsContext(ws, this.server, this.idCount)

            ws.on('message', async (msg) => {
                // console.log("RPC request: ", msg)
                const request = JSON.parse(msg.toString())
                // console.log("RPC request: ", request)

                const response = await this.server.receiveAndSend(request, context, context);


            })

            ws.on('close', ()=>
            {
                context.closed()
            })


        })


        //allow acces to presets dir to get preview-files
        this.app.use("/presets", express.static("presets"));

        if (process.env.NODE_ENV != 'development')
            this.app.use(express.static("www"));

        this.app.listen(port, () => {
            console.log(`Listening at http://localhost:${port}`)
        })


    }

    addMethod(name, method
        :
        (params: any[], context: WsContext) => void
    ) {
        this.server.addMethod(name, method);
    }

    request(name, ...params) {
        throw("Use wsContext.request to send request to the proper client.")
    }
}

