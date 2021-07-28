import {Control} from "./Control.js";

export class ControlValue extends Control {
  value: number;
  min: number;
  max: number;
  step: number;
  jqueryElement: JQuery;

  /**
   * Controls a value, step determines the minimum resolution.
   * @param matrix
   * @param name Name of the control
   * @param value Initial value
   * @param min Minimum value (inclusive)
   * @param max Maximum value (inclusive)
   * @param step Step size
   */
  constructor( name: string, value: number, min: number, max: number, step: number = 1) {
    super( name);

    this.value = value;
    this.min = min;
    this.max = max;
    this.step = step;


  }

  html(container: HTMLElement, changedCallback) {

    super.html(container, changedCallback);

    this.jqueryElement=$(`
     <div class="ui padded  segment ">
      <div class="ui top attached label">${this.name}</div>
      <div class="ui labeled ticked slider"></div>
<!--      <button class="ui icon button">-->
<!--        <i class="undo icon"></i>-->
<!--      </button>-->
    </div>
   `);

    $(container).append(this.jqueryElement);

    // @ts-ignore
    $('.slider', this.jqueryElement).slider({
      min: this.min,
      max: this.max,
      step: this.step,
      start: this.value,
      onMove: (value)=>
      {
        this.value=value;
        this.changed();
      }

    });
  }

  destroy()
  {
    if (this.jqueryElement!==undefined)
      this.jqueryElement.remove();
  }

  save()
  {
    return {
      value: this.value
    }
  }

  load(values)
  {
    this.value=values.value;

    //update gui as well?
    if (this.jqueryElement!==undefined)
      { // @ts-ignore
        $('.slider', this.jqueryElement).slider("set value", values.value, false);
      }
  }
}

