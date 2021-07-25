import rison from "rison-node"

/**
 * Stores state in browser url/history (after the #)
 */
export class HistoryState {
    private changedCallback: (state) => void;

    /**
     * Changed callback is always called: on initial load, on push() and on history back/forward.
     */
    constructor(changedCallback: (state) => void) {
        this.changedCallback = changedCallback;

        window.addEventListener('hashchange', () => {
            changedCallback(this.get())
        }, false);

        changedCallback(this.get())
    }

    get() {
        try {
            return (rison.decode(document.location.hash.substring(1)))
        } catch (e) {
            // console.log("Ignored url hash: ",e)
        }
    }

    push(state) {
        let s = rison.encode(state)
        this.changedCallback(state)
        history.pushState(undefined, "", "#" + s)
    }
}
