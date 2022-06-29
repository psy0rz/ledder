//dummy for testing
import {Display} from "../../ledder/Display.js";

export class DisplayDummy extends Display {
    constructor(width, height) {
        super(width, height);
    }

    setPixel(x, y, color) {
    }

    frame() {
    }
}
