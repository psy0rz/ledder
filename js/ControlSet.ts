import {Control} from "./Control.js";

export class ControlSet {
  controls: Array<Control>;

  constructor() {
    this.controls = []
  }

  clear() {
    this.controls = [];
  }

  addControl(control: Control) {
    this.controls.push(control);
  }

  /**
   * Generate actual GUI controls in browser
   */
  generate(container: HTMLElement)
  {

    $(container).empty();

    this.controls.forEach((control)=>
    {
      control.generate(container);
    });
  }

}
