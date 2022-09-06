import {Control, ControlMeta, Values} from "./Control.js"
import {ControlValue} from "./ControlValue.js"
import {ControlColor} from "./ControlColor.js"
import {ControlInput} from "./ControlInput.js"
import {ControlSwitch} from "./ControlSwitch.js";
import {Choices, ControlSelect} from "./ControlSelect.js";
import { change } from "dom7";


type ControlMap = Map<string, Control>

interface ControlsMeta extends ControlMeta {
    // controls:  {[key: string]: Control}
    controls: ControlMap
    collapsed: boolean
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

    //changed callback. called when a control is changed that has restartOnChange set.
    changedCallback:  () => void

    constructor(name: string = 'root', restartOnChange: boolean = false, collapsed=false) {
        super(name, 'controls', restartOnChange)

        this.clear();
        this.meta.collapsed=collapsed

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
     * @param restartOnChange Reset animation when value has changed
     */
    value(name: string, value = 0, min = 0, max = 100, step: number = 1, restartOnChange: boolean = false): ControlValue {
        if (!(name in this.meta.controls)) {
            this.add(new ControlValue(name, value, min, max, step, restartOnChange));
        }


        return this.meta.controls[name];
    }

    /**
     * Get or create color-control with specified name
     */
    color(name: string, r: number = 128, g: number = 128, b: number = 128, a: number = 1, restartOnChange: boolean = false): ControlColor {
        if (!(name in this.meta.controls)) {
            this.add(new ControlColor(name, r, g, b, a, restartOnChange));
        }


        return this.meta.controls[name];
    }

    input(name: string, text: string, restartOnChange: boolean = false): ControlInput {
        if (!(name in this.meta.controls)) {
            this.add(new ControlInput(name, text, restartOnChange));
        }

        return this.meta.controls[name];
    }

    switch(name: string, enabled: boolean, restartOnChange: boolean = true): ControlSwitch {
        if (!(name in this.meta.controls)) {
            this.add(new ControlSwitch(name, enabled, restartOnChange));
        }

        return this.meta.controls[name];
    }

    select(name: string, selected: string, choices: Choices, restartOnChange: boolean = false): ControlSelect {
        if (!(name in this.meta.controls)) {
            this.add(new ControlSelect(name, selected, choices, restartOnChange));
        }

        return this.meta.controls[name];
    }

    //sub Controls group instance.
    group(name: string, restartOnChange: boolean = false, collapsed=false): ControlGroup {
        if (!(name in this.meta.controls)) {
            const controlGroup = new ControlGroup(name, restartOnChange, collapsed)
            this.add(controlGroup);
            controlGroup.setCallbacks(
                () => {
                    this.clear()
                },
                () => {
                    if (this.addControlCallback)
                        this.addControlCallback(this)
                }                
            )
        }

        return this.meta.controls[name];

    }


    setCallbacks(reset, addControl) {
        this.resetCallback = reset
        this.addControlCallback = addControl
    }

    setChangedCallback(callback?: ()=>void)
    {
        this.changedCallback = callback
        
        //always call it the first time:
        if (this.changedCallback!==undefined)
            this.changedCallback()
        
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

    updateValue(path: [string], values: Values): boolean {
        let changed=false

        if (this.meta.controls[path[0]] !== undefined) {

            changed=(this.meta.controls[path[0]].updateValue(path.slice(1), values) || this.meta.restartOnChange)
        }

        if (changed && this.changedCallback !== undefined)
        {
            this.changedCallback()
        }

        return changed

    }


}
