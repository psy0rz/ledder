//NOTE: controls are used by browser side as well, so dont import server-only stuff!
import {Control, ControlMeta, Values} from "./Control.js"
import ControlValue from "./ControlValue.js"
import ControlColor from "./ControlColor.js"
import ControlInput from "./ControlInput.js"
import ControlSwitch from "./ControlSwitch.js"
import ControlSelect, {Choices} from "./ControlSelect.js"
import ControlRange from "./ControlRange.js"


type ControlMap = Record<string, Control>


interface ControlGroupMeta extends ControlMeta {
    controls: ControlMap
    collapsed: boolean
}

/**
 * Manages a collection of preset controls, saves and loads values to Preset.
 * NOTE: This structure is recursive, a ControlGroup() can contain a sub ControlGroup()
 */
export default class ControlGroup extends Control {
    declare meta: ControlGroupMeta
    loadedValues: Values

    //called when controls have been added somewhere in the control tree
    addControlCallback: () => void

    //remove all controls and reset
    resetCallback: () => void


    constructor(name: string = 'root', restartOnChange: boolean = false, collapsed = false) {
        super(name, 'controls', restartOnChange)

        this.meta.collapsed = collapsed
        this.clear()

    }



    clear() {
        this.meta.controls = {}
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
        this.meta.controls[control.meta.name] = control

        //already has a preset in values?
        if (control.meta.name in this.loadedValues)
            control.load(this.loadedValues[control.meta.name])

        if (this.addControlCallback)
            this.addControlCallback()

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
            this.add(new ControlValue(name, value, min, max, step, restartOnChange))
        }
        return this.meta.controls[name] as ControlValue
    }


    /**
     * Get or create range-control with specified name
     * @param name Name of the control
     * @param from Initial from value
     * @param to Initial to value
     * @param min Minimum value (inclusive)
     * @param max Maximum value (inclusive)
     * @param step Step size
     * @param restartOnChange Reset animation when value has changed
     */
    range(name: string, from = 0, to = 100, min = 0, max = 100, step: number = 1, restartOnChange: boolean = false): ControlRange {
        if (!(name in this.meta.controls)) {
            this.add(new ControlRange(name, from, to, min, max, step, restartOnChange))
        }
        return this.meta.controls[name] as ControlRange
    }


    /**
     * Get or create color-control with specified name
     */
    color(name: string, r: number = 128, g: number = 128, b: number = 128, a: number = 1, restartOnChange: boolean = false): ControlColor {
        if (!(name in this.meta.controls)) {
            this.add(new ControlColor(name, r, g, b, a, restartOnChange))
        }


        return this.meta.controls[name] as ControlColor
    }

    input(name: string, text: string, restartOnChange: boolean = false): ControlInput {
        if (!(name in this.meta.controls)) {
            this.add(new ControlInput(name, text, restartOnChange))
        }

        return this.meta.controls[name] as ControlInput
    }

    switch(name: string, enabled: boolean, restartOnChange: boolean = true): ControlSwitch {
        if (!(name in this.meta.controls)) {
            this.add(new ControlSwitch(name, enabled, restartOnChange))
        }

        return this.meta.controls[name] as ControlSwitch
    }

    select(name: string, selected: string, choices: Choices, restartOnChange: boolean = false): ControlSelect {
        if (!(name in this.meta.controls)) {
            this.add(new ControlSelect(name, selected, choices, restartOnChange))
        }

        return this.meta.controls[name] as ControlSelect
    }

    //sub Controls group instance.
    group(name: string, restartOnChange: boolean = false, collapsed = false): ControlGroup {
        if (!(name in this.meta.controls)) {
            const controlGroup = new ControlGroup(name, restartOnChange, collapsed)
            this.add(controlGroup)

            //XXX: this is een proxy object :(
            controlGroup.setCallbacks(
                () => {
                    //ging mis als mqtt 2x gestart werd en this.controls.clear() deed
                    // this.clear()
                },
                this.addControlCallback
            )
        }

        return this.meta.controls[name] as ControlGroup

    }

    //NOTE: internal use only
    setCallbacks(reset, addControl) {


        this.resetCallback = reset
        this.addControlCallback = addControl
    }


    /**
     * Return current control values
     * Note: loading and saving is setup in a way so that unused values will never be deleted. It doesnt matter if controls do not yet exists for specific values.
     */
    save() {
        for (const [name, control] of Object.entries(this.meta.controls)) {
            this.loadedValues[name] = control.save()
        }

        return this.loadedValues
    }

    /**
     * Set different preset
     */
    load(values: Values) {

        this.loadedValues=values

        //update existing controls
        for (const [name, control] of Object.entries(this.meta.controls)) {
            if (name in this.loadedValues)
                control.load(this.loadedValues[name])
        }
    }

    //return true if animation should be restarted
    updateValue(path: Array<string>, values: Values): boolean {
        let changed = false

        if (this.meta.controls[path[0]] !== undefined) {

            changed = (this.meta.controls[path[0]].updateValue(path.slice(1), values) || this.meta.restartOnChange)
        }

        return changed

    }

    detach()
    {
        super.detach()
        for (const [name, control] of Object.entries(this.meta.controls)) {
            control.detach()
        }

    }
}
