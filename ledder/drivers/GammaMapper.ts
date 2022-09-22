
//gamma brightness and max brightness correction
//maps from 0-255

import { ControlGroup } from "../ControlGroup.js"
import { ControlValue } from "../ControlValue.js"


export default class GammaMapper extends Array {
  gammaControl: ControlValue
  brightnessControl: ControlValue

  constructor(controlGroup:ControlGroup)
  {
    super()

    this.gammaControl = controlGroup.value("Gamma", 2.8, 0, 5, 0.1, true)
    this.brightnessControl = controlGroup.value("Brightness", 255, 0, 255, 1, true)

    controlGroup.setChangedCallback(() =>
    {
      this.setGamma()
    })

  }

  setGamma() {
    this.length=0
    for (let c = 0; c <= 255; c++) {
      this.push(Math.round(Math.pow(c / 255,  this.gammaControl.value) * this.brightnessControl.value))
    }
  }
}

