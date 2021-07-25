import {MatrixCanvas} from "./MatrixCanvas.js";
import {RpcClient} from "./RpcClient.js";
import {Scheduler} from "./Scheduler.js";

//jquery
import $ from "jquery";
import {HtmlPresets} from "./HtmlPresets.js";
import {progressDone, progressReset, progressStart} from "./util.js";
import {RunnerBrowser} from "./RunnerBrowser.js";
import {HtmlCategories} from "./HtmlCategories.js";
import {HistoryState} from "./HistoryState.js";

// @ts-ignore
window.$ = $;
// @ts-ignore
window.jQuery = $;

require("fomantic-ui-css/semantic");


let rpc;
let historyState;
let runnerBrowser: RunnerBrowser;

window.addEventListener('load',
  () => {

    let scheduler = new Scheduler();
    let matrix = new MatrixCanvas(scheduler, 40, 8, '#ledder-preview');
    matrix.run();


    let htmlPresets = new HtmlPresets(async (animationName, presetName) => {
      //user has clicked on a animation/preset
      await runnerBrowser.run(animationName, presetName);
    })

    let htmlCategories = new HtmlCategories(async (categoryName) => {
      //user has clicked on a category
      await htmlPresets.reload(rpc, categoryName);
      historyState.push({page: "#ledder-preset-page"})
    });

    let reload = false
    progressReset()
    progressStart()
    rpc = new RpcClient(async () => {
      if (reload) {
        //reload page to make animation development easier
        window.location.reload();
      } else {
        progressDone()
        htmlCategories.reload(rpc)
      }
    }, () => {
      reload = true
      progressReset()
      progressStart()
      matrix.clear()
    });


    runnerBrowser = new RunnerBrowser(matrix, rpc);

    matrix.preset.enableHtml(document.querySelector("#ledder-controls"), (controlName, values) => {
      if (runnerBrowser.live)
        rpc.notify("matrix.preset.updateValue", controlName, values)
    })


    $("#ledder-save-preset").on('click', async () => {
      if (runnerBrowser.presetName)
        await runnerBrowser.presetSave();
      else
        await runnerBrowser.presetSaveAs();
      return (htmlPresets.reload(rpc))
    })

    $("#ledder-copy-preset").on('click', async () => {
      await runnerBrowser.presetSaveAs();
      return (htmlPresets.reload(rpc))
    })


    $(".ledder-delete-preset").on('click', async () => {
      await runnerBrowser.presetDelete();
      return (htmlPresets.reload(rpc))
    })


    //Page switching
    if (!historyState.get()['page'])
      historyState.push({page: "#ledder-category-page"})
    $(".ledder-show-preset-page").on('click', () => historyState.push({page: "#ledder-preset-page"}))
    $(".ledder-show-control-page").on('click', () => historyState.push({page: "#ledder-control-page"}))
    $(".ledder-show-category-page").on('click', () => historyState.push({page: "#ledder-category-page"}))
    $(".ledder-back").on('click', ()=>history.back())
  })


/**
 * Handle page-change events
 */
historyState = new HistoryState(changedFields => {
  if ('page' in changedFields) {
    $(".ledder-page").hide();
    $(changedFields['page']).show();
    $(window).trigger("resize");
  }

})
