/**
 * Base class for all controls. Keep in mind that a control has to function properly both in and outside the browser.
 */
export class Control {
    constructor(name) {
        this.name = name;
    }
    /**
     * Generate html code for this control and enable browser interaction.
     * @param container
     * @param changedCallback
     */
    html(container, changedCallback) {
        this.changedCallback = changedCallback;
    }
    destroy() {
    }
    save() {
        return {};
    }
    load(values) {
    }
    changed() {
        if (this.changedCallback !== undefined)
            this.changedCallback(this.name, this.save());
    }
}
//# sourceMappingURL=Control.js.map