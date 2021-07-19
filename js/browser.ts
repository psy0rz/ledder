import {MatrixCanvas} from "./MatrixCanvas.js";
import {RpcClient} from "./RpcClient.js";
import {Scheduler} from "./Scheduler.js";

//jquery
import $ from "jquery";
import {HtmlPresets} from "./HtmlPresets.js";
import {error, progressReset} from "./util.js";
import {RunnerBrowser} from "./RunnerBrowser.js";
import {HtmlCategories} from "./HtmlCategories.js";
// @ts-ignore
window.$ = $;
// @ts-ignore
window.jQuery = $;

require("fomantic-ui-css/semantic");


let rpc;
let runnerBrowser: RunnerBrowser;

async function run(animationName, presetName) {
  try {
    runnerBrowser.run(animationName, presetName);
  } catch (e) {
    error("Can't start animation", e);
  }
}



function showPage(selector) {
  $(".ledder-page").hide();
  $(selector).show();
  $(window).trigger("resize");
}

window.addEventListener('load',
  () => {
    // const container = document.querySelector('#ledder-container') as HTMLElement;
    // const topMenu = document.querySelector('#top-menu') as HTMLElement;


    let scheduler = new Scheduler();
    let matrix = new MatrixCanvas(scheduler, 40, 8, '#ledder-preview');
    matrix.run();

    let htmlPresets = new HtmlPresets("#ledder-preset-container", run);

    let htmlCategories = new HtmlCategories("#ledder-category-container", async (categoryName)=>
    {
      htmlPresets.update(await rpc.request("presetStore.getPresets", categoryName))
      showPage("#ledder-preset-page");
    });

    rpc = new RpcClient(() => {

      progressReset();
      rpc.request("presetStore.getCategories").then(categories => {
        console.log("Categories: ", categories);
        htmlCategories.update(categories);
      })
    }, () => {
      matrix.clear();
    });




    runnerBrowser = new RunnerBrowser(matrix, rpc);
    matrix.preset.enableHtml(document.querySelector("#ledder-control-container"), (controlName, values) => {
      if (runnerBrowser.live)
        rpc.request("matrix.preset.updateValue", controlName, values)
    });

    // container.style.paddingTop = topMenu.offsetHeight + "px";


    $("#ledder-send-once").on('click', () => {
      runnerBrowser.send();
    });

    $("#ledder-send-live").on('click', () => {
      runnerBrowser.live = !runnerBrowser.live;
      $("#ledder-send-once").toggleClass("disabled");
      $("#ledder-send-live").toggleClass("red");
      runnerBrowser.send();
    });


    //Page switching
    showPage("#ledder-category-page");
    $(".ledder-show-preset-page").on('click', () => showPage("#ledder-preset-page"))
    $(".ledder-show-controls-page").on('click', () => showPage("#ledder-controls-page"))
    $(".ledder-show-category-page").on('click', () =>
    {
      console.log("ch")
      showPage("#ledder-category-page");
    })

  })

