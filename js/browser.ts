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
  container: HTMLElement;
  rpc: RpcClient;

  constructor (container, rpc )
  {
    this.container=container;
    this.rpc=rpc;
    this.reload();
  }

  async reload()
  {
    let presets=await this.rpc.request("runner.presets");

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


      rpc.request("presetStore.load",  "geert" , "keutel" )
        .then( res=>console.log(res))

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
new AnimationMovingStarsL(matrix);
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

