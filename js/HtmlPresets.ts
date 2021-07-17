import $ from "jquery";
import {progressDone, progressStart} from "./util.js";

/** Manage list of clickable presets
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
            <div class="description">${animation.description}</div>
            <div class="ui list"></div>
          </div>
       </div>
      `);
      $(this.selector).append(element)

      const presetContainer = $('.list', element);

      for (const [presetName, preset] of Object.entries(animation.presets as object)) {
        let element = $(`
           <div class="item" data-animation="${animationName}" data-preset="${presetName}">
<!--              <div class="right floated content">-->
<!--                   <div class="ui button">play</div>-->
<!--              </div>-->
              <i class="folder icon"></i>
              <div class="content">
                <div class="header">${preset.title}</div>
                <div class="description">${preset.description}</div>
              </div>
           </div>
        `);
        presetContainer.append(element);

      }
    }
  }
}
