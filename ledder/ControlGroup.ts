//NOTE: controls are used by browser side as well, so dont import server-only stuff!
import {Control, type ControlMeta, type Values} from "./Control.js"
import ControlValue from "./ControlValue.js"
import ControlColor from "./ControlColor.js"
import ControlInput from "./ControlInput.js"
import ControlSwitch from "./ControlSwitch.js"
import ControlSelect, {type Choices} from "./ControlSelect.js"
import ControlRange from "./ControlRange.js"
import CallbackManager from "../util/CallbackManager.js"
import type BoxInterface from "./BoxInterface.js";


type ControlMap = Record<string, Control>


interface ControlGroupMeta extends ControlMeta {
    controls: ControlMap
    collapsed: boolean
    switchable: boolean
}

/**
 * Manages a collection of preset controls, saves and loads values to Preset.
 * NOTE: This structure is recursive, a ControlGroup() can contain a sub ControlGroup()
 */
export default class ControlGroup extends Control {
    declare meta: ControlGroupMeta
    private __loadedValues: Values

    //this is used in case of a switchable controlgroup: it then has a switch to enable/disable the group.
    //NOTE: this is an actual user controllable value , instead of the control.meta.enabled which is user to programmically enable/disable controls.
    //Its basically the same as a ControlSwitch
    enabled: boolean;


    public __updateMetaCallbacks: CallbackManager<() => void>
    public __resetCallbacks: CallbackManager<() => void>

    toJSON(): any {
        return {
            meta: this.meta,
            enabled: this.enabled
        }
    }

    constructor(name: string = 'root', restartOnChange: boolean = false, collapsed = false, switchable = false, enabled = false) {
        super(name, 'controls', restartOnChange)

        this.__resetCallbacks = new CallbackManager()
        this.__updateMetaCallbacks = new CallbackManager()

        this.meta.collapsed = collapsed
        this.meta.switchable = switchable
        this.__clear()

        if (switchable)
            this.enabled = enabled
        else
            this.enabled = true


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

        //pass through callbacks
        control.__onRestartRequired(this.__onRestartRequiredCallback)
        control.onChange((c) => {
            if (this.__onChangeCallback)
                this.__onChangeCallback(c)
        })

        this.__updateMetaCallbacks.trigger()

    }

    /** Delete control from set **/
    public remove(control: string | Control) {
        if (typeof control === 'string') {
            delete this.meta.controls[control]
        }
        if (control instanceof Control) {
            delete this.meta.controls[control.meta.name]
        }
        this.__updateMetaCallbacks.trigger()
    }

    /** Disable a control by graying it out **/
    public disable(control: string | Control) {
        if (typeof control === 'string') {
            if (control in this.meta.controls) {
                control = this.meta.controls[control]
            } else {
                return
            }
        }

        if (control.meta.enabled) {
            control.meta.enabled = false
            this.__updateMetaCallbacks.trigger()
        }

    }

    /** Re-enable grayed out control **/
    public enable(control: string | Control) {
        if (typeof control === 'string') {
            if (control in this.meta.controls) {
                control = this.meta.controls[control]
            } else {
                return
            }
        }
        if (!control.meta.enabled) {
            control.meta.enabled = true
            this.__updateMetaCallbacks.trigger()
        }
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

    /** Text input control
     *
     */
    input(name: string, text: string, restartOnChange: boolean = false): ControlInput {
        if (!(name in this.meta.controls)) {
            this.__add(new ControlInput(name, text, restartOnChange))
        }

        return this.meta.controls[name] as ControlInput
    }

    /** Enable/disable switch control
     */
    switch(name: string, enabled: boolean, restartOnChange: boolean = true): ControlSwitch {
        if (!(name in this.meta.controls)) {
            this.__add(new ControlSwitch(name, enabled, restartOnChange))
        }

        return this.meta.controls[name] as ControlSwitch
    }


    /** Select control with predefined choices
     */
    select(name: string, selected: string, choices: Choices, restartOnChange: boolean = false): ControlSelect {
        if (!(name in this.meta.controls)) {
            this.__add(new ControlSelect(name, selected, choices, restartOnChange))
        }

        return this.meta.controls[name] as ControlSelect
    }

    /** Relative position control
     */
    position(name: string, box: BoxInterface, origin = "top-left", xOffset = 0, yOffset = 0, restartOnChange = true): ControlGroup {
        let group = this.group(name, restartOnChange)
        group.select("Origin", "top-left", [
            {
                "id": "top-left",
                "name": "Top Left",
            },
            {
                "id": "top-right",
                "name": "Top Right",
            },
            {
                "id": "bottom-left",
                "name": "Bottom Left",
            },
            {
                "id": "bottom-right",
                "name": "Bottom Right",
            },
            {
                "id": "center",
                "name": "Center",
            }
        ])

        group.value("X Offset", 0, 0, box.xMax - box.xMin)
        group.value("Y Offset", 0, 0, box.yMax - box.yMin)
        return group

    }

    //sub Controls group instance.
    group(name: string, restartOnChange: boolean = false, collapsed = false, switchable = false, enabled=false): ControlGroup {
        if (!(name in this.meta.controls)) {
            const controlGroup = new ControlGroup(name, restartOnChange, collapsed, switchable,enabled)
            this.__add(controlGroup)

            //make a copy, since "this" will be proxied and detached later
            const resetCallbacks = this.__resetCallbacks
            const addCallbacks = this.__updateMetaCallbacks

            //pass through
            controlGroup.__resetCallbacks.register(() => {
                resetCallbacks.trigger()

            })

            controlGroup.__updateMetaCallbacks.register(() => {
                addCallbacks.trigger()
            })

        }

        return this.meta.controls[name] as ControlGroup

    }


    /**
     * Return current control values
     * Note: loading and saving is setup in a way so that unused values will never be deleted. It doesnt matter if controls do not yet exists for specific values.
     */
    save() {
        for (const [name, control] of Object.entries(this.meta.controls)) {
            this.__loadedValues[name] = control.save()
        }

        this.__loadedValues['Enabled'] = {
            'enabled': this.enabled
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

        this.enabled = this.__loadedValues['Enabled'].enabled
    }

    //return true if animation should be restarted
    updateValue(path: Array<string>, values: Values) {
        console.log("ControlGroup.updateValue path", path)
        console.log("ControlGroup.updateValue values", values)
        //its for ourself
        if (path.length === 0) {
            this.enabled = values.enabled
            if (this.meta.restartOnChange) {
                if (this.__onRestartRequiredCallback)
                    this.__onRestartRequiredCallback()
            }
            return
        }

        //pass through to sub control
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
