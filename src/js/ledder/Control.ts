/**
 * Base class for all controls. Keep in mind that a control has to function properly both in and outside the browser.
 */
export class Control
{
  name: string;
  type: string;
  changedCallback: (controlName, values)=>void

  constructor(name) {
    this.name=name;

  }

  /**
   */
  setChangedCallback(changedCallback)
  {
    this.changedCallback=changedCallback;

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

