import * as path from "path";
import {readFile, writeFile, rm, mkdir} from "fs/promises";
import * as animations from "./animations/all.js";
import {PresetStore} from "./PresetStore.js";
import {MatrixApng} from "./MatrixApng.js";
import {Scheduler} from "./Scheduler.js";
import {Matrix} from "./Matrix.js";


export class PreviewStore {

    cachePath: string
    matrix: Matrix
    presetStore: PresetStore

    constructor(presetStore: PresetStore, cachePath:string) {
      this.cachePath=cachePath
      this.presetStore=presetStore

      let scheduler=new Scheduler();
      this.matrix=new MatrixApng(scheduler, 40,8,60)

    }

  /**
   * Renders preview and returns path to APNG file
   */
  async renderPreview(animationName, presetName)
  {
    const animationClass=animations[animationName];

    this.matrix.clear()

    if (presetName)
      this.matrix.preset.load(await this.presetStore.load(animationClass.presetDir, presetName));

    new animationClass(this.matrix)
    let imageData=this.matrix.run()

    let pngFilename=path.join(this.cachePath, animationName+"_"+presetName+".png")
    await writeFile(pngFilename, Buffer.from(imageData))
    return(pngFilename)

  }

}
