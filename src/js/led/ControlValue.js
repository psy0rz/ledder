import { Control } from "./Control.js";
export class ControlValue extends Control {
    // jqueryElement: JQuery;
    /**
     * Controls a value, step determines the minimum resolution.
     * @param matrix
     * @param name Name of the control
     * @param value Initial value
     * @param min Minimum value (inclusive)
     * @param max Maximum value (inclusive)
     * @param step Step size NOTE: step 0.1 might make the browser slow. usually its better to disable stepping by setting it to 0
     */
    constructor(name, value, min, max, step = 1) {
        super(name);
        this.value = value;
        this.min = min;
        this.max = max;
        this.step = step;
    }
    html(container, changedCallback) {
        super.html(container, changedCallback);
        //     this.jqueryElement=$(`
        //      <div class="ui padded  segment ">
        //       <div class="ui top attached label">${this.name}</div>
        //       <div class="ui labeled ticked slider"></div>
        // <!--      <button class="ui icon button">-->
        // <!--        <i class="undo icon"></i>-->
        // <!--      </button>-->
        //     </div>
        //    `);
        //
        //     $(container).append(this.jqueryElement);
        //
        //     // @ts-ignore
        //     $('.slider', this.jqueryElement).slider({
        //       min: this.min,
        //       max: this.max,
        //       step: this.step,
        //       start: this.value,
        //
        //       onMove: (value)=>
        //       {
        //         this.value=value;
        //         this.changed();
        //       }
        //
        //     });
    }
    destroy() {
        // if (this.jqueryElement!==undefined)
        //   this.jqueryElement.remove();
    }
    save() {
        return {
            value: this.value
        };
    }
    load(values) {
        this.value = values.value;
        //update gui as well?
        // if (this.jqueryElement!==undefined)
        //   { // @ts-ignore
        //     $('.slider', this.jqueryElement).slider("set value", values.value, false);
        //   }
    }
}
//# sourceMappingURL=ControlValue.js.map