/**
 * Handles loading/saving of presets to disk. Can only be used server-side.
 */


import * as path from "path";
import {readFile, writeFile} from "fs/promises";
import glob from "glob-promise";
import {Preset} from "./Preset.js";


export class PresetStore {
  presetPath: string;

  constructor(presetPath: string) {
    this.presetPath = presetPath;
  }

  /**
   * Get all presets for specified animation
   */
  async getPresets(animationName: string) {
    const pattern = path.join(this.presetPath, animationName, "*.json");

    let names = [];
    for (const file of await glob(pattern)) {
      names.push(path.basename(file, ".json"))
    }

    return names
  }

  private presetFilename(animationName: string, presetName: string) {
    return (path.join(this.presetPath, animationName, presetName + ".json"));
  }

  async load(animationName: string, presetName: string) {
    return JSON.parse(await readFile(this.presetFilename(animationName, presetName), 'utf8'))
  }

  save(animationName: string, presetName: string, preset:Preset) {
    return writeFile(this.presetFilename(animationName, presetName), JSON.stringify(preset, undefined, ' '), 'utf8')
  }

}
