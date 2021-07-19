import $ from "jquery";
import {progressDone, progressStart} from "./util.js";
import {RpcClient} from "./RpcClient.js";

/*
 * Manage browser html list of categories.
 */
export class HtmlCategories {
  container: JQuery
  rpc: RpcClient

  constructor(rpc, callback) {
    this.rpc=rpc;
    this.container = $("#ledder-category-container");
    this.reload();

    this.container.on('click', '.item', (e) => {
      e.stopPropagation();
      callback(e.currentTarget.dataset.category)
    })
  }


  async reload() {
    this.rpc.request("presetStore.getCategories").then(categories => {
      this.update(categories);
    })
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
