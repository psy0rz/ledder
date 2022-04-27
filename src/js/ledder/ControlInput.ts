import {Control} from "./Control.js";

export class ControlInput extends Control {
  text: string;

  /**
   * Text input control
   * @param name Name of the control
   * @param text Initial value
   */
  constructor( name: string, text: string) {
    super( name);

    this.meta.type='input'
    this.text = text

  }


  save()
  {
    return {
      text: this.text
    }
  }

  load(values)
  {
    this.text=values.text;

  }
}

