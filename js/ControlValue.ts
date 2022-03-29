import {Control} from "./Control.js";

export class ControlValue extends Control {
  value: number
  loadedValue: number
  min: number
  max: number
  step: number

  jqueryElement: JQuery;

  /**
   * Controls a value, step determines the minimum resolution.
   * @param matrix
   * @param name Name of the control
   * @param value Initial value
   * @param min Minimum value (inclusive)
   * @param max Maximum value (inclusive)
   * @param step Step size NOTE: step 0.1 might make the browser slow. usually its better to disable stepping by setting it to 0
   */
  constructor(name: string, value: number, min: number, max: number, step: number = 1) {
    super(name);

    this.value = value
    this.loadedValue = value
    this.min = min
    this.max = max
    this.step = step


  }

  html(container: HTMLElement, changedCallback) {

    super.html(container, changedCallback);

    this.jqueryElement = $(`
     <div class="ui padded  segment ">
      <div class="ui top attached label">${this.name}</div>
      <div class="ui label current-value">${this.value}</div>
      <div class="ui labeled ticked slider"></div>
      <button class="ui icon disabled button undo-action">
        <i class="undo icon"></i>
      </button>
    </div>
   `);

    $(container).append(this.jqueryElement);

    //restore loaded value when clicking undo
    $('.undo-action', this.jqueryElement).on('click', () => {
console.log("undo", this.loadedValue)
      this.value = this.loadedValue
      this.updateHtml()
      this.changed()

    })


    // @ts-ignore
    $('.slider', this.jqueryElement).slider({
      min: this.min,
      max: this.max,
      step: this.step,
      start: this.value,

      onMove: (value) => {
        this.value = value;
        $('.current-value', this.jqueryElement).text(value)
        $('.undo-action', this.jqueryElement).removeClass('disabled')
        this.changed();
      }

    });
  }

  //update html with whats in this.value
  updateHtml()
  {
    //update gui as well?
    if (this.jqueryElement !== undefined) { // @ts-ignore
      $('.slider', this.jqueryElement).slider("set value", this.value, false);
      $('.current-value', this.jqueryElement).text(this.value)
      if (this.value==this.loadedValue)
        $('.undo-action', this.jqueryElement).addClass('disabled')
      else
        $('.undo-action', this.jqueryElement).removeClass('disabled')

    }
  }

  destroy() {
    if (this.jqueryElement !== undefined)
      this.jqueryElement.remove();
  }

  save() {
    return {
      value: this.value
    }
  }



  load(values) {
    this.value = values.value
    this.loadedValue = values.value

    this.updateHtml()
  }
}

