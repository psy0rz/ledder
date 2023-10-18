import Pixel from "../../Pixel.js";
import PixelList from "../../PixelList.js";
import {patternSelect} from "../../ColorPatterns.js"
import Color from "../../Color.js";
import Animator from "../../Animator.js";
export default class RhodoneaRoseDemo extends Animator {

  async run(box, scheduler, controls) {
    const nControl = controls.value("N-Value", 7, 1, 7, 1);
    const aControl = controls.value("Amplitude", 6, 2, 16, 1);
    const pControl = controls.value("Pixels", 200, 50, 200, 1);
    let colors = patternSelect(controls, 'Fire colors', 'Doom fire')
    let xPixels = [];
    let yPixels = [];
    let t = 0;
    scheduler.interval(1, () => {
      box.clear();
      xPixels.push((aControl.value * Math.cos(nControl.value * t) * Math.cos(t)) + box.width() / 2);
      yPixels.push((aControl.value * Math.cos(nControl.value * t) * Math.sin(t)) + box.height() / 2);
      while (xPixels.length > pControl.value) {
        xPixels.shift();
        yPixels.shift();
      }
      for (let i = 0; i < xPixels.length; i++) {
        box.add(new Pixel(xPixels[i], yPixels[i], colors[Math.round(i/2)]))
      }    
      t += 0.01;
      if (t > 50) t = 0;
    });
  }
}

RhodoneaRoseDemo.title = "WallieOnline RhodoneaRose";
RhodoneaRoseDemo.description = "RhodoneaRose function demo";
