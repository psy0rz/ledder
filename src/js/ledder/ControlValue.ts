import {Control} from "./Control.js";
import {numberCheck} from "./util.js";

export class ControlValue extends Control {
  value: number;
  min: number;
  max: number;
  step: number;

  /**
   * Controls a value, step determines the minimum resolution.
   * @param name Name of the control
   * @param value Initial value
   * @param min Minimum value (inclusive)
   * @param max Maximum value (inclusive)
   * @param step Step size NOTE: step 0.1 might make the browser slow. usually its better to disable stepping by setting it to 0
   */
  constructor( name: string, value: number, min: number, max: number, step: number = 1) {
    super( name);

    numberCheck(`${name} value`, value)
    numberCheck(`${name} min`, min)
    numberCheck(`${name} max`, max)
    numberCheck(`${name} step`, step,0.0001)

    this.value = value;
    this.min = min;
    this.max = max;
    this.step = step;


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

  }
}

