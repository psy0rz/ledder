import {Control} from "./Control.js";
import {ControlValue} from "./ControlValue.js";
import {ControlColor} from "./ControlColor.js";

export class Preset {
  controls: Record<string, Control>
  htmlContainer: HTMLElement;
  values: { };

  constructor() {
    this.controls = {}
    this.values={}
  }

  clear() {
    for (const [name, control] of Object.entries(this.controls)) {
      control.destroy();
    }
    this.controls = {}
    this.values = {};
  }

  /**
   * Add control to set
   * @param control
   */
  add(control: Control)
  {
    this.controls[control.name]=control;

    //already has a preset in values?
    if (control.name in this.values)
      control.load(this.values[control.name]);

    //html generation enabled?
    if (this.htmlContainer!==undefined)
      control.html(this.htmlContainer);
  }

  /**
   * Get or create value-control with specified name
   * @param name Name of the control
   * @param value Initial value
   * @param min Minimum value (inclusive)
   * @param max Maximum value (inclusive)
   * @param step Step size
   */
  value(name: string, value: number, min: number, max: number, step: number = 1) {
    if (!(name in this.controls)) {
      this.add(new ControlValue(name, value, min, max, step));
    }

    return this.controls[name];
  }

  color(name: string, r: number, g: number, b: number, a: number = 1) {
    if (!(name in this.controls)) {
      this.add(new ControlColor(name, r, g, b, a));
    }
    return this.controls[name];

  }


  /**
   * Enable generating actual html controls in specified container.
   */
  enableHtml(container: HTMLElement) {

    this.htmlContainer = container;
  }

  /**
   * Note: loading and saving is setup in a way so that unused values will never be deleted. It doesnt matter if controls do not yet exists for specific values.
   */
  save()
  {
    //update values array with current
    for (const [name, control] of Object.entries(this.controls))
    {
      this.values[name]=control.save();
    }

    return this.values
  }

  load(values)
  {
    this.values=values;

    for (const [name, control] of Object.entries(this.controls))
    {
      if (name in this.values)
        control.load(this.values[name]);

    }
  }

}
