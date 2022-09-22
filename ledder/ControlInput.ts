import {Control} from "./Control.js";


export default class ControlInput extends Control {
  text: string;

  /**
   * Text input control
   * @param name Name of the control
   * @param text Initial value
   * @param resetOnChange Reset animation when value has changed
   */
  constructor( name: string, text: string, resetOnChange: boolean) {
    super( name, 'input', resetOnChange)

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

