import { RpcServer } from "./RpcServer.js";
import { RunnerServer } from "./RunnerServer.js";
import { PresetStore } from "./PresetStore.js";
import { matrixList, mqttHost, mqttOpts, nodename } from "../../matrixconf.js";
import mqtt from 'mqtt';
console.log("starting..");
let startupAnimation = "AnimationMarquee";
let startupPresetDir = "Marquee";
let startupPresetName = "slow";
//init preset store
const presetStore = new PresetStore();
// let startupPreset = new PresetValues()
// try {
//     startupPreset = await presetStore.load(startupPresetDir, startupPresetName)
// } catch (e) {
//     console.error(e)
// }
//create run all the matrixes
let runners = [];
let primary = true;
for (const matrix of matrixList) {
    //first one is primary scheduler
    matrix.runScheduler = primary;
    primary = false;
    matrix.run();
    let runner = new RunnerServer(matrix, presetStore);
    runner.runName(startupAnimation, startupPresetName);
    runners.push(runner);
}
/////////////////////////mqtt stuff
const client = mqtt.connect(mqttHost, mqttOpts);
client.on('connect', function () {
    client.subscribe(`/HACKERSPACE/${nodename}/run`, function (err) {
    });
});
client.on('message', async (topic, message) => {
    let str = message.toString();
    console.log("MQTT received: ", str);
    let pars = str.split('/', 2);
    for (const runner of runners) {
        await runner.runName(...pars);
    }
});
//RPC bindings
let rpc = new RpcServer();
// rpc.addMethod("presetStore.getCategories", (params) => presetStore.getCategories(...params))
rpc.addMethod("presetStore.loadAnimationPresetList", (params) => presetStore.loadAnimationPresetList());
// @ts-ignore
rpc.addMethod("presetStore.load", (params) => presetStore.load(...params));
// @ts-ignore
rpc.addMethod("presetStore.save", (params) => presetStore.save(...params));
// @ts-ignore
rpc.addMethod("presetStore.createPreview", (params) => presetStore.createPreview(...params));
// @ts-ignore
rpc.addMethod("presetStore.delete", (params) => presetStore.delete(...params));
// @ts-ignore
rpc.addMethod("runner.run", (params) => {
    for (const runner of runners) {
        runner.run(...params);
    }
});
//todo: make multi-matrix
// @ts-ignore
rpc.addMethod("matrix.preset.updateValue", (params) => {
    for (const matrix of matrixList) {
        matrix.preset.updateValue(...params);
    }
});
//# sourceMappingURL=server.js.map