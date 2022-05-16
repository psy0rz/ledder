/** Actual preset-values
 * (jsonable)
 */
import {Values} from "./Control.js";


export class PresetValues {
    values: Values
    title: string;
    description: string;

    constructor() {
      this.values={};
      this.title="";
      this.description="";
    }
}





