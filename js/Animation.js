import { DrawContainer } from "./DrawContainer.js";
export class Animation extends DrawContainer {
    constructor() {
        super();
        this.nextFrame = 0;
    }
    //override this in your class to do one-time setup stuff.
    //(if you prefer that over doing it in the constructor)
    setup(matrix) {
    }
    //override this in your class to do the actual animation. this is called with every X frames. (depending on interval)
    loop(matrix, frameNr) {
    }
    //this should render the actual objects of this animation in their current state, to the matrix.
    render(matrix) {
        for (let i = 0, n = this.pixels.length; i < n; ++i) {
            const p = this.pixels[i];
            p.render(matrix);
        }
    }
}
//# sourceMappingURL=Animation.js.map