
//gamma brightness and max brightness correction
//maps from 0-255

import ControlGroup from "../../ControlGroup.js"
import ControlValue from "../../ControlValue.js"


export default class GammaMapper extends Array {
  gammaControl: ControlValue
  brightnessControl: ControlValue

  //Same table as this Array itself, for drivers that do a lookup per channel per pixel: indexing an
  //Array subclass makes V8 fall back to a generic element load, while a Uint8Array indexed by an
  //int32 compiles to a plain byte load. Always 256 entries, so it is also safe to index without a
  //bounds check as long as the caller clamps to 0-255.
  //Kept in sync by setGamma(); zeroed (=black) until the first setGamma(), just like the Array is
  //empty until then.
  readonly table: Uint8Array = new Uint8Array(256)

  constructor(controlGroup:ControlGroup)
  {
    super()

    this.gammaControl = controlGroup.value("Gamma", 2.8, 0, 5, 0.1, true)
    this.brightnessControl = controlGroup.value("Brightness", 255, 0, 255, 1, true)

    controlGroup.onChange(() =>
    {
      this.setGamma()
    })

  }

  setGamma() {
    this.length=0
    for (let c = 0; c <= 255; c++) {
      const mapped = Math.round(Math.pow(c / 255,  this.gammaControl.value) * this.brightnessControl.value)
      this.push(mapped)
      this.table[c] = mapped
    }
  }
}

