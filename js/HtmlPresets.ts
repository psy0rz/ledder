import $ from "jquery";
import {progressDone, progressStart} from "./util.js";

/** Manage browser html list of animations and presets
 *
 */
export class HtmlPresets {

  selector: string

  constructor(selector, callback) {
    this.selector = selector;

    $(selector).on('click', '.item', (e) => {
      progressStart();
      e.stopPropagation();
      callback(e.currentTarget.dataset.animation, e.currentTarget.dataset.preset).finally((e) => {
        progressDone();
      })
    });

  }

  update(animations: object) {
    $(this.selector).empty();

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
      $(this.selector).append(element)

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
