import { ControlValue } from "./ControlValue.js";
import { ControlColor } from "./ControlColor.js";
import { PresetValues } from "./PresetValues.js";
import { sveltePresets } from "../svelteStore.js";
/**
 * Manages a collection of preset controls, saves and loads values to Preset.
 * Does browser-html stuff
 */
export class PresetControl {
    constructor() {
        this.controls = {};
        this.clear();
    }
    clear() {
        for (const [name, control] of Object.entries(this.controls)) {
            control.destroy();
        }
        this.controls = {};
        this.presetValues = new PresetValues();
        if (this.enableHtml) {
            sveltePresets.set([]);
        }
    }
    /**
     * Add control to set
     * @param control
     */
    add(control) {
        this.controls[control.name] = control;
        //already has a preset in values?
        if (control.name in this.presetValues.values)
            control.load(this.presetValues.values[control.name]);
        //html generation enabled?
        // if (this.htmlContainer!==undefined)
        // {
        //   control.html(this.htmlContainer, this.valuesChangedCallback);
        //   // $(".ledder-control-counter").text(Object.keys(this.controls).length);
        //   // $(".ledder-show-control-page").removeClass("disabled");
        // }
        if (this.htmlEnabled) {
            sveltePresets.update(p => {
                p.push(control);
                console.log("na push", p);
                return p;
            });
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
    value(name, value, min, max, step = 1) {
        if (!(name in this.controls)) {
            this.add(new ControlValue(name, value, min, max, step));
        }
        // @ts-ignore
        return this.controls[name];
    }
    /**
     * Get or create color-control with specified name
     */
    color(name, r = 128, g = 128, b = 128, a = 1) {
        if (!(name in this.controls)) {
            this.add(new ControlColor(name, r, g, b, a));
        }
        // @ts-ignore
        return this.controls[name];
    }
    /**
     * Enable generating actual html controls in specified container.
     */
    // enableHtml(container: HTMLElement,   changedCallback: (controlName, values)=>void) {
    enableHtml() {
        this.htmlEnabled = true;
        // this.valuesChangedCallback=changedCallback
    }
    /**
     * Save current control values to current preset and return it
     * Note: loading and saving is setup in a way so that unused values will never be deleted. It doesnt matter if controls do not yet exists for specific values.
     */
    save() {
        for (const [name, control] of Object.entries(this.controls)) {
            this.presetValues.values[name] = control.save();
        }
        return this.presetValues;
    }
    /**
     * Set different preset
     * @param values
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
//# sourceMappingURL=PresetControl.js.map