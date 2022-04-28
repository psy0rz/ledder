/**
 * Base class for all controls. Keep in mind that a control has to function properly both in and outside the browser.
 */
export class Control {
    meta: Record<string, any>

    changedCallback: (controlName, values) => void

    //type is used in webfront end to render correct controls gui
    constructor(name: string, type: string, resetOnChange: boolean = false) {
        this.meta = {}
        this.meta.name = name
        this.meta.type = type
        this.meta.resetOnChange = resetOnChange


    }

    /**
     */
    setChangedCallback(changedCallback) {
        this.changedCallback = changedCallback;

    }


    save() {
        return {}

    }

    load(values) {

    }

    changed() {
        if (this.changedCallback !== undefined)
            this.changedCallback(this.meta.name, this.save());

    }


}

