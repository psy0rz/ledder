import $ from "jquery";
import {progressDone, progressStart} from "./util.js";

/*
 * Manage browser html list of categories.
 */
export class HtmlCategories {
    selector: string;

    constructor(selector, callback) {
        this.selector = selector;

        $(selector).on('click', '.item', (e) => {
            progressStart();
            e.stopPropagation();
            callback(e.currentTarget.dataset.category).finally((e) => {
                progressDone();
            })
        });
    }

    update(categories: object) {
        $(this.selector).empty();

        for (const [categoryName, category] of Object.entries(categories)) {
            let element = $(`
       <div class="item" data-category="${categoryName}">
          <i class="list icon"></i>
          <div class="content">
            <div class="header">${categoryName}</div>
<!--            <div class="description">bla</div>-->
          </div>
       </div>
      `);
            $(this.selector).append(element)

        }
    }
}
