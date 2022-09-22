import {Control} from "./Control.js";


export default class ControlSwitch extends Control {
    enabled: boolean;

    /**
     * Boolean on/off switch
     * @param name Name of the control
     * @param enabled Initial value
     * @param resetOnChange Reset animation when value has changed
     */
    constructor(name: string, enabled: boolean, resetOnChange: boolean) {
        super(name, 'switch', resetOnChange)

        this.enabled = enabled

    }


    save() {
        return {
            enabled: this.enabled
        }
    }

    load(values) {
        this.enabled = values.enabled

    }
}


