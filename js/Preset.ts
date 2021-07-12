import {Control} from "./Control.js";

export class Preset {
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

    /**
     * Generate actual GUI controls in browser
     */
    html(container: HTMLElement) {

        $(container).empty();

        this.controls.forEach((control) => {
            control.html(container);
        });
    }

}
