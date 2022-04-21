import {writeFile} from "fs/promises";
import {MatrixApng} from "./drivers/MatrixApng.js";
import {Scheduler} from "../ledder/Scheduler.js";

//handles creation of previews
export class PreviewStore {

    matrix: MatrixApng
    constructor() {

      let scheduler=new Scheduler();
      this.matrix=new MatrixApng(scheduler, 40,8)

    }

  /**
   * Renders preview to APNG file
   */
  async render(filename, animationClass, preset)
  {
    console.log("Rendering preview "+filename);

    this.matrix.reset()

    if (preset)
      this.matrix.preset.load(preset);

    new animationClass(this.matrix)
    let imageData=await this.matrix.get(animationClass)

    await writeFile(filename, Buffer.from(imageData))
  }

}
