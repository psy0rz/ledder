/**
 * Handles loading/saving of presets to disk. Can only be used server-side.
 */


import * as path from "path";
import {readFile, writeFile} from "fs/promises";
import glob from "glob-promise";
import {PresetValues} from "./PresetValues.js";
import * as animations from "./animations/all.js";


export class PresetStore {
  presetPath: string;

  constructor(presetPath: string) {
    this.presetPath = presetPath;
  }

  /**
   * Get all presetnames for specified animation
   */
  async getPresetNames(presetDir: string) {
    const pattern = path.join(this.presetPath, presetDir, "*.json");
    let names = [];
    for (const file of await glob(pattern)) {
      names.push(path.basename(file, ".json"))
    }
    return names
  }

  /**
   * Return preset in PresetValues format
   * @param presetDir
   * @param presetName
   */
  async load(presetDir: string, presetName: string) {
    return JSON.parse(await readFile(this.presetFilename(presetDir, presetName), 'utf8'))
  }

  async save(animationName: string, presetName: string, preset: PresetValues) {
    return writeFile(this.presetFilename(animationName, presetName), JSON.stringify(preset, undefined, ' '), 'utf8')
  }

  /**
   * Returns list of all animations and all stripped presets, in jsonable format
   * NOTE: slow, cache?
   */
  async getPresets() {
    let ret = {};

    for (const [animationName, animation] of Object.entries(animations)) {
      ret[animationName] = {
        title: animation.title,
        description: animation.description,
        presets: {}
      };

      const presetNames = await this.getPresetNames(animation.presetDir)
      for (const presetName of presetNames) {
        ret[animationName].presets[presetName] = await this.load(animation.presetDir, presetName);
        //strip stuff to keep it smaller
        delete ret[animationName].presets[presetName].values;
      }
    }
    return (ret);
  }

  private presetFilename(presetDir: string, presetName: string) {
    return (path.join(this.presetPath, presetDir, presetName + ".json"));
  }

}
