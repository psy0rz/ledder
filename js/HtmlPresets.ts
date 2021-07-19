import $ from "jquery";
import {progressDone, progressStart} from "./util.js";
import {RpcClient} from "./RpcClient.js";

/** Manage browser html list of animations and presets
 *
 */
export class HtmlPresets {

  container: JQuery

  constructor(callback) {
    this.container=$("#ledder-preset-container");

    this.container.on('click', '.item', (e) => {
      e.stopPropagation();
      callback(e.currentTarget.dataset.animation, e.currentTarget.dataset.preset)
    });

  }

  async reload(rpc, categoryName)
  {
    let animations=await rpc.request("presetStore.getPresets", categoryName)
    this.update(animations)

  }

  update(animations: object) {
    this.container.empty();

    for (const [animationName, animation] of Object.entries(animations)) {
      let element = $(`
       <div class="item" data-animation="${animationName}">
          <i class="folder icon"></i>
          <div class="content">
            <div class="header">${animation.title}</div>
            <div class="description">${animation.description} [${animationName}]</div>
            <div class="ui list"></div>
          </div>
       </div>
      `);
      this.container.append(element)

      const presetContainer = $('.list', element);

      for (const [presetName, preset] of Object.entries(animation.presets as object)) {
        let element = $(`
           <div class="item" data-animation="${animationName}" data-preset="${presetName}">
              <i class="folder icon"></i>
              <div class="content">
                <div class="header">${preset.title}</div>
                <div class="description">${preset.description} [${presetName}]</div>
              </div>
           </div>
        `);
        presetContainer.append(element);

      }
    }
  }
}
