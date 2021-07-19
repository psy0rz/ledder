import $ from "jquery";
import {progressDone, progressStart} from "./util.js";
import {RpcClient} from "./RpcClient.js";

/*
 * Manage browser html list of categories.
 */
export class HtmlCategories {
  container: JQuery

  constructor(callback) {
    this.container = $("#ledder-category-container");

    this.container.on('click', '.item', (e) => {
      e.stopPropagation();
      let categoryName=e.currentTarget.dataset.category
      $(".ledder-selected-category").text(categoryName);
      callback(categoryName)
    })
  }


  async reload(rpc) {
    let categories=await rpc.request("presetStore.getCategories")
    this.update(categories);
  }

  update(categories: object) {
    this.container.empty();

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
      this.container.append(element)

    }
  }
}
