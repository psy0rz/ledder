import {PixelContainer} from "./PixelContainer.js";

export class Matrix extends PixelContainer {
    width: number;
    height: number;

    constructor(width, height) {
        super();
        this.width=width;
        this.height=height;
    }

    render()
    {
      console.log("Stub, subclass this thing.");
    }
}

