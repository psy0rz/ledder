import {Control, ControlMeta, Values} from "./Control.js"
import {ControlValue} from "./ControlValue.js"
import {ControlColor} from "./ControlColor.js"
import {ControlInput} from "./ControlInput.js"
import {ControlSwitch} from "./ControlSwitch.js";
import {Choices, ControlSelect} from "./ControlSelect.js";


type ControlMap = Map<string, Control>

interface ControlsMeta extends ControlMeta {
    // controls:  {[key: string]: Control}
    controls: ControlMap
}

/**
 * Manages a collection of preset controls, saves and loads values to Preset.
 * NOTE: This structure is recursive, a Controls() can contain other sub Controls()
 */
export class ControlGroup extends Control {
    meta: ControlsMeta
    loadedValues: Values

    //Added controls are send to the webinterface via the addControlCallback.
    //This is because controls usually are added on the fly in an async fasion.
    addControlCallback: (controls: ControlGroup) => void

    //remove all controls and reset
    resetCallback: () => void

    constructor(name: string = 'root', restartOnChange: boolean = false) {
        super(name, 'controls', restartOnChange)

        this.clear();

    }

    clear() {
        this.meta.controls = new Map()
        this.loadedValues = {}

        if (this.resetCallback) {
            this.resetCallback()
        }
    }


    /**
     * Add control to set
     * @param control
     */
    add(control: Control) {
        this.meta.controls[control.meta.name] = control;

        //already has a preset in values?
        if (control.meta.name in this.loadedValues)
            control.load(this.loadedValues[control.meta.name]);

        if (this.addControlCallback)
            this.addControlCallback(this)

    }

    /**
     * Get or create value-control with specified name
     * @param name Name of the control
     * @param value Initial value
     * @param min Minimum value (inclusive)
     * @param max Maximum value (inclusive)
     * @param step Step size
     * @param resetOnChange Reset animation when value has changed
     */
    value(name: string, value: number, min: number, max: number, step: number = 1, resetOnChange: boolean = false): ControlValue {
        if (!(name in this.meta.controls)) {
            this.add(new ControlValue(name, value, min, max, step, resetOnChange));
        }


        return this.meta.controls[name];
    }

    /**
     * Get or create color-control with specified name
     */
    color(name: string, r: number = 128, g: number = 128, b: number = 128, a: number = 1, resetOnChange: boolean = false): ControlColor {
        if (!(name in this.meta.controls)) {
            this.add(new ControlColor(name, r, g, b, a, resetOnChange));
        }


        return this.meta.controls[name];
    }

    input(name: string, text: string, resetOnChange: boolean = false): ControlInput {
        if (!(name in this.meta.controls)) {
            this.add(new ControlInput(name, text, resetOnChange));
        }

        return this.meta.controls[name];
    }

    switch(name: string, enabled: boolean, resetOnChange: boolean = true): ControlSwitch {
        if (!(name in this.meta.controls)) {
            this.add(new ControlSwitch(name, enabled, resetOnChange));
        }

        return this.meta.controls[name];
    }

    select(name: string, selected: string, choices: Choices, resetOnChange: boolean = false): ControlSelect {
        if (!(name in this.meta.controls)) {
            this.add(new ControlSelect(name, selected, choices, resetOnChange));
        }

        return this.meta.controls[name];
    }

    //sub Controls group instance.
    group(name: string, reloadOnChange: boolean = false) {
        if (!(name in this.meta.controls)) {
            this.add(new ControlGroup(name, reloadOnChange));
        }

        return this.meta.controls[name];

    }


    setCallbacks(reset, addControl) {
        this.resetCallback = reset
        this.addControlCallback = addControl
        // this.updateValuesCallback=updateValues
    }

    /**
     * Return current control values
     * Note: loading and saving is setup in a way so that unused values will never be deleted. It doesnt matter if controls do not yet exists for specific values.
     */
    save() {
        for (const [name, control] of Object.entries(this.meta.controls)) {
            this.loadedValues[name] = control.save();
        }

        return this.loadedValues
    }

    /**
     * Set different preset
     */
    load(values: Values) {
        this.loadedValues = values

        //update existing controls
        for (const [name, control] of Object.entries(this.meta.controls)) {
            if (name in this.loadedValues)
                control.load(this.loadedValues[name]);
        }
    }

    updateValue(path: [string], values: Values):boolean {
        if(this.meta.controls[path[0]]!==undefined)
        {

            return (this.meta.controls[path[0]].updateValue(path.slice(1), values)|| this.meta.restartOnChange)
        }
        return false

    }

    /**
     * Update values of a specific control. (called by browser to update server)
     * @return True if animation should be restarted/reset
     */
    // updateValue(controlPath: ControlPath, values) {
    //
    //
    //     this.loadedValues[controlName] = values;
    //     this.meta.controls[controlName].load(values);
    //
    //     return (this.meta.controls[controlName].meta.resetOnChange)
    // }

}
