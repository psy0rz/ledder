import {Matrix} from "./Matrix.js";


/**
 * Base class for all controls. Keep in mind that a control has to function properly both in and outside the browser.
 */
export class Control
{
  name: string;
  changedCallback: (controlName, values)=>void

  constructor(name) {
    this.name=name;

  }

  /**
   * Generate html code for this control and enable browser interaction.
   * @param container
   * @param changedCallback
   */
  html(container: HTMLElement, changedCallback)
  {
    this.changedCallback=changedCallback;

  }

  destroy()
  {

  }

  save()
  {
    return {}

  }

  load(values)
  {

  }

  changed()
  {
    if (this.changedCallback!==undefined)
      this.changedCallback(this.name, this.save());

  }

}

