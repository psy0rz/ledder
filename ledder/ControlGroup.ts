//NOTE: controls are used by browser side as well, so dont import server-only stuff!
import {Control, ControlMeta, Values} from "./Control.js"
import ControlValue from "./ControlValue.js"
import ControlColor from "./ControlColor.js"
import ControlInput from "./ControlInput.js"
import ControlSwitch from "./ControlSwitch.js"
import ControlSelect, {Choices} from "./ControlSelect.js"
import ControlRange from "./ControlRange.js"
import CallbackManager from "../util/CallbackManager.js"


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
    private __loadedValues: Values


    public __addCallbacks: CallbackManager<() => void>
    public __resetCallbacks: CallbackManager<() => void>


    constructor(name: string = 'root', restartOnChange: boolean = false, collapsed = false) {
        super(name, 'controls', restartOnChange)

        this.__resetCallbacks = new CallbackManager()
        this.__addCallbacks = new CallbackManager()

        this.meta.collapsed = collapsed
        this.__clear()

    }


    public __clear() {
        this.meta.controls = {}
        this.__loadedValues = {}

        this.__resetCallbacks.trigger()
    }


    /**
     * Add control to set
     * @param control
     */
    private __add(control: Control) {
        this.meta.controls[control.meta.name] = control

        //already has a preset in values?
        if (control.meta.name in this.__loadedValues)
            control.load(this.__loadedValues[control.meta.name])

        control.__onRestartRequired(this.__onRestartRequiredCallback)
        control.onChange((c) => {
            if (this.__onChangeCallback)
                this.__onChangeCallback(c)
        })

        this.__addCallbacks.trigger()


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
            this.__add(new ControlValue(name, value, min, max, step, restartOnChange))
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
            this.__add(new ControlRange(name, from, to, min, max, step, restartOnChange))
        }
        return this.meta.controls[name] as ControlRange
    }


    /**
     * Get or create color-control with specified name
     */
    color(name: string = "Color", r: number = 128, g: number = 128, b: number = 128, a: number = 1, restartOnChange: boolean = false): ControlColor {
        if (!(name in this.meta.controls)) {
            this.__add(new ControlColor(name, r, g, b, a, restartOnChange))
        }


        return this.meta.controls[name] as ControlColor
    }

    input(name: string, text: string, restartOnChange: boolean = false): ControlInput {
        if (!(name in this.meta.controls)) {
            this.__add(new ControlInput(name, text, restartOnChange))
        }

        return this.meta.controls[name] as ControlInput
    }

    switch(name: string, enabled: boolean, restartOnChange: boolean = true): ControlSwitch {
        if (!(name in this.meta.controls)) {
            this.__add(new ControlSwitch(name, enabled, restartOnChange))
        }

        return this.meta.controls[name] as ControlSwitch
    }

    select(name: string, selected: string, choices: Choices, restartOnChange: boolean = false): ControlSelect {
        if (!(name in this.meta.controls)) {
            this.__add(new ControlSelect(name, selected, choices, restartOnChange))
        }

        return this.meta.controls[name] as ControlSelect
    }

    //sub Controls group instance.
    group(name: string, restartOnChange: boolean = false, collapsed = false): ControlGroup {
        if (!(name in this.meta.controls)) {
            const controlGroup = new ControlGroup(name, restartOnChange, collapsed)
            this.__add(controlGroup)

            const resetCallbacks=this.__resetCallbacks
            const addCallbacks=this.__addCallbacks

            //pass through
            controlGroup.__resetCallbacks.register(() => {
                    resetCallbacks.trigger()

            })

            controlGroup.__addCallbacks.register(() => {
                    addCallbacks.trigger()
            })

        }

        return this.meta.controls[name] as ControlGroup

    }


    // public __onReset(callback) {
    //     this.__onResetCallbacks.add(callback)
    //
    // }
    //
    // public __onResetUnregister(callback) {
    //     this.__onResetCallbacks.delete(callback)
    // }
    //
    // public __onAdd(callback) {
    //     this.__onAddCallbacks.add(callback)
    // }
    //
    // public __onAddUnregister(callback) {
    //     this.__onAddCallbacks.delete(callback)
    //
    // }


    /**
     * Return current control values
     * Note: loading and saving is setup in a way so that unused values will never be deleted. It doesnt matter if controls do not yet exists for specific values.
     */
    save() {
        for (const [name, control] of Object.entries(this.meta.controls)) {
            this.__loadedValues[name] = control.save()
        }

        return this.__loadedValues
    }

    /**
     * Set different preset
     */
    load(values: Values) {

        this.__loadedValues = values

        //update existing controls
        for (const [name, control] of Object.entries(this.meta.controls)) {
            if (name in this.__loadedValues)
                control.load(this.__loadedValues[name])
        }
    }

    //return true if animation should be restarted
    updateValue(path: Array<string>, values: Values) {
        const c = this.meta.controls[path[0]]
        if (c !== undefined) {

            c.updateValue(path.slice(1), values)

            if (!c.meta.restartOnChange && this.meta.restartOnChange)
                if (this.__onRestartRequiredCallback)
                    this.__onRestartRequiredCallback()

        }

    }

    public __detach() {
        super.__detach()
        for (const [name, control] of Object.entries(this.meta.controls)) {
            control.__detach()
        }
        // this.onResetCallback=undefined
        // this.onAddCallback=undefined

    }
}
