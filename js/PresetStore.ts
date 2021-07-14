/**
 * Handles loading/saving of presets to disk. Can only be used server-side.
 */


import * as path from "path";
import {readFile, writeFile} from "fs/promises";
import glob from "glob-promise";
import {Preset} from "./Preset.js";
import * as animations from "./animations/all.js";


export class PresetStore {
  presetPath: string;

  constructor(presetPath: string) {
    this.presetPath = presetPath;
  }

  /**
   * Get all presetnames for specified animation
   */
  async getPresetNames(animationName: string) {
    const pattern = path.join(this.presetPath, animationName, "*.json");

    let names = [];
    for (const file of await glob(pattern)) {
      names.push(path.basename(file, ".json"))
    }

    return names
  }

  async load(animationName: string, presetName: string) {
    return JSON.parse(await readFile(this.presetFilename(animationName, presetName), 'utf8'))
  }

  save(animationName: string, presetName: string, preset: Preset) {
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

      const presetNames = await this.getPresetNames(animationName)
      for (const presetName of presetNames) {
        ret[animationName].presets[presetName] = await this.load(animationName, presetName);
        //strip stuff

      }
    }
    return (ret);
  }

  private presetFilename(animationName: string, presetName: string) {
    return (path.join(this.presetPath, animationName, presetName + ".json"));
  }

}
