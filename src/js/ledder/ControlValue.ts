import {Control, ControlMeta} from "./Control.js";
import {numberCheck} from "./util.js";



interface ControlValueMeta extends ControlMeta
{
  min: number,
  max:number,
  value: number
  step: number
}

export class ControlValue extends Control {
  meta: ControlValueMeta

  value: number;

  /**
   * Controls a value, step determines the minimum resolution.
   * @param name Name of the control
   * @param value Initial value
   * @param min Minimum value (inclusive)
   * @param max Maximum value (inclusive)
   * @param step Step size NOTE: step 0.1 might make the browser slow. usually its better to disable stepping by setting it to 0
   * @param resetOnChange Reset animation when value has changed
   */
  constructor( name: string, value: number, min: number, max: number, step: number = 1, resetOnChange=false) {
    super( name, 'value', resetOnChange)

    numberCheck(`${name} value`, value)
    numberCheck(`${name} min`, min)
    numberCheck(`${name} max`, max)
    numberCheck(`${name} step`, step,0.0001)

    this.meta.min=min
    this.meta.max=max
    this.meta.step=step

    this.value = value


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

