import rison from "rison-node"

/**
 * Stores state in browser url/history (after the #)
 * When the state is changed (on page load, on pushing and on history forward/backwards), then
 * the callback is called with the changed fields as argument.
 */
export class HistoryState {
  private changedCallback: (newState, changedFields: {}) => void;
  private currentState: {};

  /**
   *
   */
  constructor(changedCallback: (newState, changedFields) => void) {
    this.changedCallback = changedCallback
    this.currentState = {}

    window.addEventListener('hashchange', () => {
      this.changed(this.get())
    }, false);


  }

  load()
  {
    //inital page load
    this.changed(this.get())
  }

  /**
   * determine changed fields and call callback
   */
  private changed(newState)
  {
    //determine what is changed compared to previous state, and call the handler
    let changedFields=[]
    for (const key of Object.keys(newState))
    {
      if (newState[key]!=this.currentState[key])
      {
        changedFields.push(key)
      }
    }

    if (changedFields.length)
      this.changedCallback(newState,changedFields)

    this.currentState=newState

  }

  /***
   * Get current state from url
   */
  get() {
    try {
      return (rison.decode(decodeURI(document.location.hash.substring(1))))
    } catch (e) {
      return ({})
    }
  }

  /**
   * Merge new fields with current state and push on history stack (changedCallback will be called)
   * @param updateFields
   */
  push(updateFields) {

    let newState={}
    Object.assign(newState, this.currentState)
    Object.assign(newState, updateFields)

    let s = rison.encode(newState)
    // history.pushState(undefined, "", "#" + s)
    // @ts-ignore
    window.location="#" +s;

    this.changed(newState)

  }
}
