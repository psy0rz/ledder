import {DrawContainer} from "./DrawContainer.js";

export abstract class Matrix extends DrawContainer {
    width: number;
    height: number;

    constructor(width, height) {
        super();
        this.width=width;
        this.height=height;
    }

    abstract render();

    abstract setPixel(x,y,r,g,b,a);
}

