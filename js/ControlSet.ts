import {Control} from "./Control.js";

export class ControlSet {
    controls: Array<Control>;

    constructor() {
        this.controls = []
    }

    clear() {
        this.controls = [];
    }

    addControl(control: Control) {
        this.controls.push(control);
    }


}
