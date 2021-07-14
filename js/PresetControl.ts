import {Control} from "./Control.js";
import {ControlValue} from "./ControlValue.js";
import {ControlColor} from "./ControlColor.js";
import {Preset} from "./Preset.js";


/**
 * Manages a collection of preset controls, saves and loads values to Preset
 */
export class PresetControl {
  controls: Record<string, Control>
  htmlContainer: HTMLElement;
  preset: Preset;

  constructor() {
    this.controls={};
    this.clear();
  }

  clear() {
    for (const [name, control] of Object.entries(this.controls)) {
      control.destroy();
    }
    this.controls = {}
    this.preset = undefined;
  }


  /**
   * Add control to set
   * @param control
   */
  add(control: Control)
  {
    this.controls[control.name]=control;

    //already has a preset in values?
    if (control.name in this.preset.values)
      control.load(this.preset.values[control.name]);

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

  /**
   * Get or create color-control with specified name
   */
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
   * Save current control values to current preset and return it
   * Note: loading and saving is setup in a way so that unused values will never be deleted. It doesnt matter if controls do not yet exists for specific values.
   */
  save()
  {
    for (const [name, control] of Object.entries(this.controls))
    {
      this.preset.values[name]=control.save();
    }

    return this.preset
  }

  /**
   * Set different preset
   * @param values
   */
  load(preset)
  {
    this.preset=preset;

    for (const [name, control] of Object.entries(this.controls))
    {
      if (name in this.preset.values)
        control.load(this.preset.values[name]);
    }
  }
}
