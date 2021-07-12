import {Matrix} from "./Matrix.js";


export class Control
{
  name: string;

  constructor(matrix: Matrix, name) {
    this.name=name;
    matrix.preset.addControl(this);

  }

  html(container: HTMLElement)
  {

  }
}

