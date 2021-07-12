import {Control} from "./Control.js";
import {ColorInterface} from "./ColorInterface.js";
import iro from "@jaames/iro";
import ColorPicker = iro.ColorPicker;

export class ControlColor extends Control implements ColorInterface {
  r: number;
  g: number;
  b: number;
  a: number;
  jqueryElement: JQuery;

  constructor(name: string, r: number, g: number, b: number, a: number = 1) {
    super(name);
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }


  html(container: HTMLElement) {

    this.jqueryElement = $(`
     <div class="ui padded  segment ">
      <div class="ui top attached label">${this.name}</div>
      <div class="colorpicker"></div>
      <button class="ui icon button">
        <i class="undo icon"></i>
      </button>
    </div>
   `);

    $(container).append(this.jqueryElement);

    const colorElement=$('.colorpicker', this.jqueryElement)[0];

    const picker=ColorPicker(colorElement,{
      color: this,
    });

    picker.on("color:change", (color)=> {
      this.r=color.rgba.r;
      this.g=color.rgba.g;
      this.b=color.rgba.b;
      this.a=color.rgba.a;

    });
  }

  destroy() {
    if (this.jqueryElement !== undefined)
      this.jqueryElement.remove();
  }


}
