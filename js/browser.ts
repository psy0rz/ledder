import {MatrixCanvas} from "./MatrixCanvas.js";
import {RpcClient} from "./RpcClient.js";
import {Scheduler} from "./Scheduler.js";

//jquery
import $ from "jquery";
import {HtmlPresets} from "./HtmlPresets.js";
import {error, progressReset, progressStart} from "./util.js";
import {RunnerBrowser} from "./RunnerBrowser.js";
// @ts-ignore
window.$ = $;
// @ts-ignore
window.jQuery = $;

require("fomantic-ui-css/semantic");


let rpc;
let runnerBrowser;

async function run(animationName, presetName) {
  try {
    runnerBrowser.run(animationName, presetName);
  } catch (e) {
    error("Can't start animation", e);
  }
}

window.addEventListener('load',
  () => {
    const container = document.querySelector('#container') as HTMLElement;
    const menu = document.querySelector('#menu') as HTMLElement;

    container.style.paddingTop = menu.offsetHeight + "px";

    let scheduler = new Scheduler();
    let matrix = new MatrixCanvas(scheduler, 37, 8, '#matrix', 5, 16);
    matrix.preset.enableHtml(document.querySelector("#controlContainer"));
    matrix.run();

    let htmlPresets = new HtmlPresets("#presetContainer", run);

    rpc = new RpcClient(() => {

      progressReset();

      rpc.request("presetStore.getPresets").then(presets => {
        htmlPresets.update(presets);
      })

    }, () => {
      matrix.clear();
    });

    runnerBrowser = new RunnerBrowser(matrix, rpc);

    $("#send-once").on('click', ()=>{
      runnerBrowser.send();
    });

    $("#send-live").on('click', ()=>{
      runnerBrowser.live=!runnerBrowser.live;
      $("#send-once").toggleClass("disabled");
      $("#send-live").toggleClass("red");
      runnerBrowser.send();
    });

  })
