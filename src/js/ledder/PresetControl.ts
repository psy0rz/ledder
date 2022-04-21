import {Control} from "./Control.js"
import {ControlValue} from "./ControlValue.js"
import {ControlColor} from "./ControlColor.js"
import {PresetValues} from "./PresetValues.js"

//TODO: remove from this file and use callbacks
import { sveltePresets } from "../web/svelteStore.js"

/**
 * Manages a collection of preset controls, saves and loads values to Preset.
 */
export class PresetControl {
  controls: Record<string, Control>
  htmlEnabled: boolean
  presetValues: PresetValues
  valuesChangedCallback: (controlName, values)=>void

  constructor() {
    this.controls={};
    this.clear();
  }

   clear() {
    this.controls = {}
    this.presetValues = new PresetValues()

    if (this.htmlEnabled)
    {
      sveltePresets.set([])

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
    if (this.htmlEnabled)
    {
      control.html(this.valuesChangedCallback)

      //add preset to svelte preset list
      sveltePresets.update(p=>{
        p.push(control)
        return p
      })
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
  value(name: string, value: number, min: number, max: number, step: number = 1):ControlValue {
    if (!(name in this.controls)) {
      this.add(new ControlValue(name, value, min, max, step));
    }

    // @ts-ignore
    return this.controls[name];
  }

  /**
   * Get or create color-control with specified name
   */
  color(name: string, r: number=128, g: number=128, b: number=128, a: number = 1):ControlColor {
    if (!(name in this.controls)) {
      this.add(new ControlColor(name, r, g, b, a));
    }

    // @ts-ignore
    return this.controls[name];
  }


  /**
   * Enable generating actual html controls in specified container.
   */
    enableHtml(changedCallback: (controlName, values)=>void) {

    this.htmlEnabled=true
    this.valuesChangedCallback=changedCallback
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

    //update existing controls
    for (const [name, control] of Object.entries(this.controls))
    {
      if (name in this.presetValues.values)
        control.load(this.presetValues.values[name]);
    }

    // if (this.htmlEnabled)
    //   sveltePresets.update(p=>p)
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
