import {Matrix} from "./Matrix.js";

export class ControlSet
{
  controls: Array<Control>;

  constructor() {
    this.controls=[]
  }

  clear()
  {
    this.controls=[];
  }

  addControl(control: Control)
  {
    this.controls.push(control);
  }



}

export class Control
{
  name: string;

  constructor(matrix: Matrix, name) {
    this.name=name;
    matrix.controlSet.addControl(this);

  }
}

