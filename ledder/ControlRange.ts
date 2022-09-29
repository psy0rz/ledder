//NOTE: controls are used by browser side as well, so dont import server-only stuff!
import {Control, ControlMeta} from "./Control.js";
import {numberCheck} from "./utils.js";



interface ControlRangeMeta extends ControlMeta
{
  min: number,
  max:number,
  from: number
  to: number
  step: number
}

export default class ControlRange extends Control {
  meta: ControlRangeMeta

  from: number;
  to: number;

  /**
   * Controls a range, step determines the minimum resolution.
   * @param name Name of the control
   * @param from Initial from value
   * @param to Initial to value
   * @param min Minimum value (inclusive)
   * @param max Maximum value (inclusive)
   * @param step Step size NOTE: step 0.1 might make the browser slow. usually its better to disable stepping by setting it to 0
   * @param resetOnChange Reset animation when value has changed
   */
  constructor( name: string, from: number, to:number, min: number, max: number, step: number = 1, resetOnChange=false) {
    super( name, 'range', resetOnChange)

    numberCheck(`${name} from`, from)
    numberCheck(`${name} to`, to)
    numberCheck(`${name} min`, min)
    numberCheck(`${name} max`, max)
    numberCheck(`${name} step`, step,0.0001)

    this.meta.min=min
    this.meta.max=max
    this.meta.step=step

    this.from=from
    this.to=to


  }


  save()
  {
    return {
      from: this.from,
      to: this.to
    }
  }

  load(values)
  {
    this.from=values.from
    this.to=values.to

  }
}

