import {Control} from "./Control.js";

export interface Choice {
    id: string;
    name: string;
}

export class ControlSelect extends Control {
    selected: string

    /**
     * Boolean on/off switch
     * @param name Name of the control
     * @param selected Initial value
     * @param choices Choices of select box (key->value)
     * @param resetOnChange Reset animation when value has changed
     */
    constructor(name: string, selected: string, choices: Array<Choice>, resetOnChange: boolean) {
        super(name, 'select', resetOnChange)

        this.selected = selected
        this.meta.choices = choices

    }


    save() {
        return {
            selected: this.selected
        }
    }

    load(values) {
        this.selected = values.selected

    }
}
