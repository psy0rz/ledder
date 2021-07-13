/**
 * Handles loading/saving of presets to disk. Can only be used server-side.
 */

// import {join} from "path";

import * as path from "path";
import * as fs from "fs";

import pkg from 'glob';

const {glob} = pkg;


export class PresetStore {
  presetPath: string;

  constructor(presetPath: string) {
    this.presetPath = presetPath;
  }

  /**
   * Get all preset basenames for specified animation
   */
  getFiles(animationName: string) {

    return (new Promise((resolve, reject) => {
      const pattern = path.join(this.presetPath, animationName, "*.json");
      glob(pattern, {}, (err, files) => {
        if (err) reject(err);
        let names = [];
        for (const file of files) {
          names.push(path.basename(file, ".json"));
        }
        resolve(names);
      })
    }));
  }

  presetFilename(animationName: string, presetName: string) {
    return (path.join(this.presetPath, animationName, presetName + ".json"));
  }

  load(animationName: string, presetName: string, callback) {
    fs.readFile(this.presetFilename(animationName, presetName), (err, data) => {
      if (err)
        throw(err);

      // @ts-ignore
      callback(JSON.parse(data));
    });

  }


}
