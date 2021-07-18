import {Control} from "./Control.js";
import {ControlValue} from "./ControlValue.js";
import {ControlColor} from "./ControlColor.js";
import {PresetValues} from "./PresetValues.js";


/**
 * Manages a collection of preset controls, saves and loads values to Preset
 */
export class PresetControl {
  controls: Record<string, Control>
  htmlContainer: HTMLElement;
  presetValues: PresetValues;
  valuesChangedCallback: (controlName, values)=>void


  constructor() {
    this.controls={};
    this.clear();
  }

  clear() {
    for (const [name, control] of Object.entries(this.controls)) {
      control.destroy();
    }
    this.controls = {}
    this.presetValues = new PresetValues();

    if (this.htmlContainer!==undefined)
    {
      $(".control-counter").text(0);
      $(".toggle-controls").addClass("disabled");
    }

  }


  /**
   * Add control to set
   * @param control
   */
  add(control: Control)
  {
    this.controls[control.name]=control;

    //already has a preset in values?
    if (control.name in this.presetValues.values)
      control.load(this.presetValues.values[control.name]);

    //html generation enabled?
    if (this.htmlContainer!==undefined)
    {
      control.html(this.htmlContainer, this.valuesChangedCallback);
      $(".control-counter").text(Object.keys(this.controls).length);
      $(".toggle-controls").removeClass("disabled");
    }
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
  enableHtml(container: HTMLElement,   changedCallback: (controlName, values)=>void) {

    this.htmlContainer = container;
    this.valuesChangedCallback=changedCallback;
  }

  /**
   * Save current control values to current preset and return it
   * Note: loading and saving is setup in a way so that unused values will never be deleted. It doesnt matter if controls do not yet exists for specific values.
   */
  save()
  {
    for (const [name, control] of Object.entries(this.controls))
    {
      this.presetValues.values[name]=control.save();
    }

    return this.presetValues
  }

  /**
   * Set different preset
   * @param values
   */
  load(preset)
  {
    this.presetValues=preset;

    for (const [name, control] of Object.entries(this.controls))
    {
      if (name in this.presetValues.values)
        control.load(this.presetValues.values[name]);
    }
  }

  /**
   * Update values of a specific controlled. (called by browser to update server)
   * @param controlName
   * @param values
   */
  updateValue(controlName, values)
  {
    this.presetValues.values[controlName]=values;
    this.controls[controlName].load(values);
  }

}
