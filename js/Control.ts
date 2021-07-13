import {Matrix} from "./Matrix.js";


/**
 * Base class for all controls. Keep in mind that a control has to function properly both in and outside the browser.
 */
export class Control
{
  name: string;

  constructor(name) {
    this.name=name;

  }

  /**
   * Generate html code for this control and enable browser interaction.
   * @param container
   */
  html(container: HTMLElement)
  {

  }

  destroy()
  {

  }

  save()
  {

  }

  load(values)
  {

  }

}

