import {Control} from "./Control.js";
import {Matrix} from "./Matrix.js";

export class ControlValue extends Control {
  value: number;
  min: number;
  max: number;
  step: number;

  /**
   * Controls a value, step determines the minimum resolution.
   * @param matrix
   * @param name Name of the control
   * @param value Initial value
   * @param min Minimum value (inclusive)
   * @param max Maximum value (inclusive)
   * @param step Step size
   */
  constructor(matrix: Matrix, name: string, value: number, min: number, max: number, step: number = 1) {
    super(matrix, name);

    this.value = value;
    this.min = min;
    this.max = max;
    this.step = step;

  }

  html(container: HTMLElement) {

    const element=$(`
     <div class="ui padded  segment ">
      <div class="ui top attached label">${this.name}</div>
      <div class="ui labeled ticked slider"></div>
      <button class="ui icon button">
        <i class="undo icon"></i>
      </button>
    </div>
   `);

    $(container).append(element);

    // @ts-ignore
    $('.slider', element).slider({
      min: this.min,
      max: this.max,
      step: this.step,
      start: this.value,
      onMove: (value)=>
      {
        this.value=value;
      }

    });



  }
}

