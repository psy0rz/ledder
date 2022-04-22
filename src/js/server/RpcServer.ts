import express from "express";
import expressWs from "express-ws";
import {JSONRPCClient, JSONRPCServer, JSONRPCServerAndClient} from "json-rpc-2.0";
import {Rpc} from "../Rpc.js";
import {monitorEventLoopDelay} from "perf_hooks";

let vite
if (process.env.NODE_ENV == 'development')
    vite = await import("vite")


// import {createServer} from "vite"

/**
 * Nodejs server-side webserver that handles static files and json-rpc-2.0 requests via websocket.
 */
export class RpcServer extends Rpc {

    serverAndClient: JSONRPCServer;

    constructor() {
        super();

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

        this.serverAndClient = new JSONRPCServer()

        //new JSONRPCServer()
        // new JSONRPCClient((request) => {
        //     try {
        //         request.send(JSON.stringify(request));
        //         return Promise.resolve();
        //     } catch (error) {
        //         return Promise.reject(error);
        //     }
        // })
        // );

        app.ws('/ws', (ws, req) => {
            // lastWs = ws;
            console.log("JO SOCKET")
            ws.on('message', async (msg) => {
                const response = await this.serverAndClient.receive(JSON.parse(msg.toString()));
                if (response)
                    ws.send(JSON.stringify(response))
                // else
                //     ws.respond(204);


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

    addMethod(name, method: ([...params]) => void) {
        this.serverAndClient.addMethod(name, method);
    }

    request(name, ...params) {
        // return (this.serverAndClient.request(name, params));
    }

}

