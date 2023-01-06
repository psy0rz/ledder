//NOTE: controls are used by browser side as well, so dont import server-only stuff!

/**
 * Base class for all controls.
 */

export type  Values= Record< string , any>



export interface ControlMeta  {
    name: string
    type: string
    restartOnChange: boolean
}

//meta contains all the meta data, all other properties are values that can be accessed/changed by the user and program.

export  class Control {
    meta: ControlMeta

    // changedCallback: (controlName, values) => void

    //type is used in webfront end to render correct controls gui

    constructor(name: string, type: string, restartOnChange: boolean = false) {
        this.meta= {
            name :name,
            type :type,
            restartOnChange :restartOnChange
        }

    }



    save?():Values;

    load?(values: Values)

    //return true if animation should be restarted
    updateValue(path:Array<string>,value:Values):boolean
    {
        this.load(value)

        return (this.meta.restartOnChange)
    }

    // changed() {
    //     if (this.changedCallback !== undefined)
    //         this.changedCallback(this.meta.name, this.save());
    //
    // }


}

