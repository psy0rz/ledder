import {Control} from "./Control.js"
import {ControlValue} from "./ControlValue.js"
import {ControlColor} from "./ControlColor.js"
import {PresetValues} from "./PresetValues.js"
import {ControlInput} from "./ControlInput.js"


/**
 * Manages a collection of preset controls, saves and loads values to Preset.
 */
export class PresetControl {
    controls: Record<string, Control>
    presetValues: PresetValues
    resetCallback: () => void
    addControlCallback: (control) => void
    updateValuesCallback: (controlName, values) => void

    constructor() {

        this.controls = {};
        this.clear();
    }

    clear() {
        this.controls = {}
        this.presetValues = new PresetValues()

        if (this.resetCallback)
        {
            this.resetCallback()
        }
    }


    /**
     * Add control to set
     * @param control
     */
    add(control: Control) {
        this.controls[control.name] = control;

        //already has a preset in values?
        if (control.name in this.presetValues.values)
            control.load(this.presetValues.values[control.name]);

        if (this.updateValuesCallback)
            control.setChangedCallback(this.updateValuesCallback)

        if (this.addControlCallback)
            this.addControlCallback(control)

    }

    /**
     * Get or create value-control with specified name
     * @param name Name of the control
     * @param value Initial value
     * @param min Minimum value (inclusive)
     * @param max Maximum value (inclusive)
     * @param step Step size
     */
    value(name: string, value: number, min: number, max: number, step: number = 1): ControlValue {
        if (!(name in this.controls)) {
            this.add(new ControlValue(name, value, min, max, step));
        }

        // @ts-ignore
        return this.controls[name];
    }

    /**
     * Get or create color-control with specified name
     */
    color(name: string, r: number = 128, g: number = 128, b: number = 128, a: number = 1): ControlColor {
        if (!(name in this.controls)) {
            this.add(new ControlColor(name, r, g, b, a));
        }

        // @ts-ignore
        return this.controls[name];
    }

    input(name: string, text:string): ControlInput {
        if (!(name in this.controls)) {
            this.add(new ControlInput(name, text));
        }

        // @ts-ignore
        return this.controls[name];
    }




    setCallbacks(reset, addControl, updateValues) {
        this.resetCallback = reset
        this.addControlCallback=addControl
        this.updateValuesCallback=updateValues
    }

    /**
     * Save current control values to current preset and return it
     * Note: loading and saving is setup in a way so that unused values will never be deleted. It doesnt matter if controls do not yet exists for specific values.
     */
    save() {
        for (const [name, control] of Object.entries(this.controls)) {
            this.presetValues.values[name] = control.save();
        }

        return this.presetValues
    }

    /**
     * Set different preset
     */
    load(preset) {
        this.presetValues = preset;

        //update existing controls
        for (const [name, control] of Object.entries(this.controls)) {
            if (name in this.presetValues.values)
                control.load(this.presetValues.values[name]);
        }

    }

    /**
     * Update values of a specific controlled. (called by browser to update server)
     * @param controlName
     * @param values
     */
    updateValue(controlName, values) {
        this.presetValues.values[controlName] = values;
        this.controls[controlName].load(values);
    }


}
