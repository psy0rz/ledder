/**
 * Base class for all controls.
 */

export type Values= Record< string , any>



export interface ControlMeta  {
    name: string
    type: string
    restartOnChange: boolean
}

export class Control {
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

    /**
     */
    // setChangedCallback(changedCallback) {
    //     this.changedCallback = changedCallback;
    //
    // }


    save?():Values;

    load?(values: Values)

    // changed() {
    //     if (this.changedCallback !== undefined)
    //         this.changedCallback(this.meta.name, this.save());
    //
    // }


}

