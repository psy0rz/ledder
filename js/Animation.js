import { PixelContainer } from "./PixelContainer.js";
export class Animation extends PixelContainer {
    constructor(matrix) {
        super();
        this.nextFrame = 0;
        this.matrix = matrix;
    }
    //override this in your class to do one-time setup stuff.
    //(if you prefer that over doing it in the constructor)
    setup(matrix) {
    }
    //override this in your class to do the actual animation. this is called with every X frames. (depending on interval)
    loop(frameNr) {
    }
}
//# sourceMappingURL=Animation.js.map