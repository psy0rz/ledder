/**
 * Handles loading/saving of presets to disk. Can only be used server-side.
 */


import * as path from "path";


import {readFile} from "fs/promises";
import glob from "glob-promise";


export class PresetStore {
  presetPath: string;

  constructor(presetPath: string) {
    this.presetPath = presetPath;
  }

  /**
   * Get all preset basenames for specified animation
   */
  getFiles(animationName: string) {
    const pattern = path.join(this.presetPath, animationName, "*.json");

    return glob(pattern)
      .then((files) => {
        let names = [];
        for (const file of files) {
          names.push(path.basename(file, ".json"));
        }
        return names

      })
  }


  presetFilename(animationName: string, presetName: string) {
    return (path.join(this.presetPath, animationName, presetName + ".json"));
  }

  load(animationName: string, presetName: string) {
    return readFile(this.presetFilename(animationName, presetName))
      .then((data) => {
        // @ts-ignore
        return JSON.parse(data);
      })
  }

}
