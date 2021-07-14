import {MatrixCanvas} from "./MatrixCanvas.js";
import {RpcClient} from "./RpcClient.js";
import {Scheduler} from "./Scheduler.js";
import {Runner} from "./Runner.js";
import {AnimationMovingStarsL} from "./animations/AnimationMovingStarsL.js";
import iro from "@jaames/iro";
import ColorPicker = iro.ColorPicker;

//jquery
import $ from "jquery";
import {AnimationMatrixtest} from "./animations/AnimationMatrixtest.js";
import {PresetStore} from "./PresetStore.js";
// @ts-ignore
window.$ = $;
// @ts-ignore
window.jQuery = $;

require("fomantic-ui-css/semantic");

/** Manage list of selectable presets
 *
 */
export class HtmlPresets
{

  html(container, presets)
  {

    for (const [animationName, presetNames] of Object.entries(presets))
    {
      let element=$(`
     <div class="ui padded  segment ">
      <div class="ui top attached label">${animationName}</div>
      <div class="ui labeled ticked slider"></div>
      <button class="ui icon button">
        <i class="undo icon"></i>
      </button>
    </div>
   `);

      $(container).append(element);

    }


  }
}

window.addEventListener('load',
  () => {
    const container = document.querySelector('#container') as HTMLElement;
    const menu = document.querySelector('#menu') as HTMLElement;

    container.style.paddingTop = menu.offsetHeight + "px";

    let rpc = new RpcClient(() => {
      // rpc.request("getFiles", {}).then((res) => {
      //   console.log("result", res);
      // });
      //
      // rpc.request("load", {}).then((res) => {
      //     console.log("result load", res)
      //   }
      // );


      // rpc.request("presetStore.load",  "geert" , "keutel" )
      //   .then( res=>console.log(res))

      let htmlPresets=new HtmlPresets();

      rpc.request("runner.presets").then(presets=>{
        console.log(presets);
        htmlPresets.html(document.querySelector("#presetContainer"), presets );

      })
      // htmlPresets.reload().then(res=>console.log(res));

    });
  })


let scheduler = new Scheduler();
//
//
let matrix = new MatrixCanvas(scheduler, 37, 8, '#matrix', 5, 16);

matrix.preset.enableHtml(document.querySelector("#controlContainer"));

// scheduler.interval(60, () => {
//   console.log("chop");
//   scheduler.status();
//   matrix.status();
//   console.log(matrix.controlSet.controls);
//   return(true);
// });
//
// new AnimationMovingStarsL(matrix);
// new AnimationMatrixtest(matrix);
matrix.run();
//

// const runner=new Runner(matrix);
//
//
// function bam(category, name)
// {
//   runner.run( name);
//   rpc.request("run", { name });
//
// }

// let rpc=new RpcClient(()=>
// {
//   bam("tests", "AnimationMovingStarsL");
//
// });

// runner.run( "AnimationMovingStarsL");


// ColorPicker(".color1", {});
// ColorPicker(".color2", {});

// @ts-ignore
// $('.ui.slider').slider();

