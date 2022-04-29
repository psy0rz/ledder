import {writeFile} from "fs/promises";
import {MatrixApng} from "./drivers/MatrixApng.js";
import {Scheduler} from "../ledder/Scheduler.js";
import {Animation} from "../ledder/Animation.js";

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
      this.matrix.control.load(preset);

    let animation:Animation=new animationClass(this.matrix)
    animation.run(this.matrix, this.matrix.scheduler, this.matrix.control).then( ()=>{
      console.log(`PreviewStore: ${filename} finished.`)
    }).catch ( (e)=>{
      console.error(`PreviewStore: ${filename} error`,e )
    })


    let imageData=await this.matrix.get(animationClass)

    await writeFile(filename, Buffer.from(imageData))
  }

}
