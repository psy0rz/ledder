//dummy for testing
import Display from "../Display.js";

export class DisplayDummy extends Display {
    constructor(width, height) {
        super(width, height);
    }

    setPixel(x, y, color) {
    }

    frame() {
    }
}
