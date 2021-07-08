import {Matrix} from "./Matrix.js";
import * as animations from "./animations/all.js";



export class Runner {
    matrix: Matrix;

    constructor(matrix) {
        this.matrix = matrix;
    }

    /**
     * Loads and runs specified animation. Returns promise. Animations reside in animations directory.
     * @param category
     * @param animation
     */
    run(name: string) {
        this.matrix.clear();
        new animations[name](this.matrix);
    }
}
