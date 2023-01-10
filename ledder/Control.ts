//NOTE: controls are used by browser side as well, so dont import server-only stuff!

/**
 * Base class for all controls.
 */

export type  Values = Record<string, any>


export interface ControlMeta {
    name: string
    type: string
    restartOnChange: boolean
}

//meta contains all the meta data, all other properties are values that can be accessed/changed by the user and program.

export class Control {
    meta: ControlMeta

    //called when a control is changed by the user.
    protected onChangeCallback: (control: Control) => void

    //called when restart is required
    protected onRestartRequiredCallback: ()=> void


    constructor(name: string, type: string, restartOnChange: boolean = false) {
        this.meta = {
            name: name,
            type: type,
            restartOnChange: restartOnChange
        }

    }

    //Is called when user changes something via the controls.
    //Can be used by user.
    onChange(callback?: (Control) => void) {
        this.onChangeCallback = callback

        //always call it the first time:
        if (this.onChangeCallback !== undefined)
            this.onChangeCallback(this)

    }

    //internal use only.
    onRestartRequired(callback)
    {
        this.onRestartRequiredCallback=callback
    }

    //remove all references to user stuff/animations. (used when restarting an animation)
    detach()
    {

        this.onChangeCallback=undefined
        // this.onRestartRequiredCallback=undefined
    }

    save?(): Values

    load?(values: Values)

    //return true if animation should be restarted
    updateValue(path: Array<string>, value: Values) {

        this.load(value)
        if (this.onChangeCallback !== undefined) {
            this.onChangeCallback(this)
        }

        if (this.meta.restartOnChange)
            if (this.onRestartRequiredCallback)
                this.onRestartRequiredCallback()

    }

}

