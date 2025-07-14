//NOTE: controls are used by browser side as well, so dont import server-only stuff!

/**
 * Base class for all controls.
 */

export type  Values = Record<string, any>


export interface ControlMeta {
    name: string
    type: string
    restartOnChange: boolean
    enabled: boolean
}

//meta contains all the meta data, all other properties are values that can be accessed/changed by the user and program.

export class Control {
    meta: ControlMeta

    //called when a control is changed by the user.
    protected __onChangeCallback: (control: Control) => void

    //called when restart is required
    protected __onRestartRequiredCallback: ()=> void


    constructor(name: string, type: string, restartOnChange: boolean = false) {
        this.meta = {
            name: name,
            type: type,
            restartOnChange: restartOnChange,
            enabled: true
        }


    }


    //Is called when user changes something via the controls.
    //Can be used by user.
    public onChange(callback?: (Control) => void) {
        this.__onChangeCallback = callback

        //always call it the first time:
        if (this.__onChangeCallback !== undefined)
            this.__onChangeCallback(this)

    }

    //internal use only.
    public __onRestartRequired(callback)
    {
        this.__onRestartRequiredCallback=callback
    }

    //remove all references to user stuff/animations. (used when restarting an animation)
    public __detach()
    {

        this.__onChangeCallback=undefined
        // this.onRestartRequiredCallback=undefined
    }

    save?(): Values

    load?(values: Values)

    //update values, return true if animation should be restarted
    updateValue(path: Array<string>, value: Values) {

        this.load(value)
        // console.log("CHANGE en", this.onChangeCallback)
        if (this.__onChangeCallback !== undefined) {
            this.__onChangeCallback(this)
        }

        if (this.meta.restartOnChange)
            if (this.__onRestartRequiredCallback)
                this.__onRestartRequiredCallback()

    }

}

