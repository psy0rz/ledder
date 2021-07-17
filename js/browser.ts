import {MatrixCanvas} from "./MatrixCanvas.js";
import {RpcClient} from "./RpcClient.js";
import {Scheduler} from "./Scheduler.js";

//jquery
import $ from "jquery";
import {HtmlPresets} from "./HtmlPresets.js";
import {error, progressStart} from "./util.js";
// @ts-ignore
window.$ = $;
// @ts-ignore
window.jQuery = $;

require("fomantic-ui-css/semantic");


let rpc;

async function run(animationName, presetName) {
  try {
    await rpc.request("runner.run", animationName, presetName);
    console.log("klar");
  } catch (e) {
    error("Can't start animation", e);
  }
}

window.addEventListener('load',
  () => {
    const container = document.querySelector('#container') as HTMLElement;
    const menu = document.querySelector('#menu') as HTMLElement;

    container.style.paddingTop = menu.offsetHeight + "px";


    rpc = new RpcClient(() => {

      let scheduler = new Scheduler();
      let matrix = new MatrixCanvas(scheduler, 37, 8, '#matrix', 5, 16);
      matrix.preset.enableHtml(document.querySelector("#controlContainer"));
      matrix.run();

      rpc.request("presetStore.getPresets").then(presets => {
        htmlPresets.update(presets);
      })

      let htmlPresets = new HtmlPresets("#presetContainer", run);

    });
  })
