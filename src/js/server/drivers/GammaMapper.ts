
//gamma brightness and max brightness correction
//maps from 0-255


export default class GammaMapper extends Array {

  constructor(gamma=1, brightness= 255)
  {
    super()
    this.setGamma(gamma, brightness)
  }

  setGamma(gamma: number, brightness: number) {
    this.length=0
    for (let c = 0; c <= 255; c++) {
      this.push(Math.round(Math.pow(c / 255,  gamma) * brightness))
      // this.push(c)
    }
  }
}
