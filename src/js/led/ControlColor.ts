import {Control} from "./Control.js";
import {ColorInterface} from "./ColorInterface.js";
// import iro from "@jaames/iro";
// import ColorPicker = iro.ColorPicker;

export class ControlColor extends Control implements ColorInterface {
  r: number;
  g: number;
  b: number;
  a: number;

  //html stuff
  // jqueryElement: JQuery;
  // picker: ColorPicker;

  constructor(name: string, r: number=128, g: number=128, b: number=128, a: number = 1) {
    super(name);
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }


  html(container: HTMLElement, changedCallback) {

    super.html(container, changedCallback);

//     this.jqueryElement = $(`
//      <div class="ui padded  segment ">
//       <div class="ui top attached label">${this.name}</div>
//       <div class="colorpicker"></div>
// <!--      <button class="ui icon button">-->
// <!--        <i class="undo icon"></i>-->
// <!--      </button>-->
//     </div>
//    `);
//
//     $(container).append(this.jqueryElement);
//
//     const colorElement = $('.colorpicker', this.jqueryElement)[0];
//
//     this.picker = ColorPicker(colorElement, {
//       width: 200,
//       color: this,
//       layout: [
//         {
//           component: iro.ui.Wheel,
//         },
//         {
//           component: iro.ui.Slider,
//         },
//         {
//           component: iro.ui.Slider,
//           options: {
//             sliderType: 'alpha'
//
//           }
//         }
//       ]
//
//     });
//
//     this.picker.on("color:change", (color) => {
//       this.r = color.rgba.r;
//       this.g = color.rgba.g;
//       this.b = color.rgba.b;
//       this.a = color.rgba.a;
//       this.changed();
//
//     });

  }

  // destroy() {
  //   // if (this.jqueryElement !== undefined)
  //   //   this.jqueryElement.remove();
  // }

  save() {
    return {
      r: this.r,
      g: this.g,
      b: this.b,
      a: this.a
    }
  }

  load(values) {
    this.r = values.r;
    this.g = values.g;
    this.b = values.b;
    this.a = values.a;

    // if (this.picker !== undefined) {
    //   this.picker.color = values;
    // }
  }
}
