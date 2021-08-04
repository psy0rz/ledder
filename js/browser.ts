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
let runnerBrowser: RunnerBrowser;

window.addEventListener('load', () => {

  let scheduler = new Scheduler();
  let matrix = new MatrixCanvas(scheduler, 40, 8, '#ledder-preview');
  matrix.run();

  let htmlPresets = new HtmlPresets(async (animationName, presetName) => {
    //user has clicked on a animation/preset
    historyState.push({animationName:animationName, presetName:presetName})
  })

  let htmlCategories = new HtmlCategories(async (categoryName) => {
    //user has clicked on a category
    historyState.push({page: "#ledder-preset-page", categoryName: categoryName})
  });

  //connect to server via websocket:
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
      historyState.load();
    }
  }, () => {
    reload = true
    progressReset()
    progressStart()
    matrix.clear()
  });

  //handle stuff that depends on the url #hash:
  let historyState = new HistoryState((newState, changedFields) => {
    //show page
    if (changedFields.includes('page')) {
      $(".ledder-page").hide();
      $(newState['page']).show();
      $(window).trigger("resize");
    }

    //load category
    if (changedFields.includes('categoryName')) {
      htmlPresets.reload(rpc, newState['categoryName']);
    }

    //run animation
    if (changedFields.includes('animationName') || changedFields.includes('presetName'))
    {
      runnerBrowser.run(newState['animationName'], newState['presetName']);
    }

  })


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
    await htmlPresets.reload(rpc)
  })


  //Page switching
  if (!historyState.get()['page'])
    historyState.push({page: "#ledder-category-page"})
  $(".ledder-show-preset-page").on('click', () => historyState.push({page: "#ledder-preset-page"}))
  $(".ledder-show-control-page").on('click', () => historyState.push({page: "#ledder-control-page"}))
  $(".ledder-show-category-page").on('click', () => historyState.push({page: "#ledder-category-page"}))
  $(".ledder-back").on('click', () => history.back())


  //statistics
  setInterval(()=>{
    $(".ledder-schedule-count").text(scheduler.intervals.length)
    $(".ledder-pixel-count").text(matrix.pixels.length)
  },1000)

})


