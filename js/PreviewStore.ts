import * as path from "path";
import {readFile, writeFile, rm, mkdir} from "fs/promises";
import * as animations from "./animations/all.js";
import {PresetStore} from "./PresetStore.js";
import {MatrixApng} from "./MatrixApng.js";
import {Scheduler} from "./Scheduler.js";
import {Matrix} from "./Matrix.js";


export class PreviewStore {

    matrix: Matrix
    presetStore: PresetStore

    constructor(presetStore: PresetStore) {
      this.presetStore=presetStore

      let scheduler=new Scheduler();
      this.matrix=new MatrixApng(scheduler, 40,8,600)

    }

  /**
   * Renders preview to APNG file
   */
  async render(filename, animationClass, preset)
  {

    this.matrix.clear()

    if (preset)
      this.matrix.preset.load(preset);

    new animationClass(this.matrix)
    let imageData=this.matrix.run()

    await writeFile(filename, Buffer.from(imageData))
  }

}
