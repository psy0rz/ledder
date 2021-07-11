import {Matrix} from "./Matrix.js";


export class Control
{
  name: string;

  constructor(matrix: Matrix, name) {
    this.name=name;
    matrix.controlSet.addControl(this);

  }

  generate(container: HTMLElement)
  {

  }
}

