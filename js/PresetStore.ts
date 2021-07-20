/**
 * Handles loading/saving of presets to disk. Can only be used server-side.
 */


import * as path from "path";
import {readFile, writeFile, rm, mkdir} from "fs/promises";
import glob from "glob-promise";
import {PresetValues} from "./PresetValues.js";
import * as animations from "./animations/all.js";
import {PreviewStore} from "./PreviewStore.js";


export class PresetStore {
  presetPath: string;
  previewStore: PreviewStore

  constructor(presetPath: string) {
    this.presetPath = presetPath;

    this.previewStore=new PreviewStore(this)

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

  /**
   * Save preset to disk
   * @param presetDir
   * @param presetName
   * @param preset
   */
  async save(presetDir: string, presetName: string, preset: PresetValues) {

    //make sure dir exists
    const presetFileName=this.presetFilename(presetDir, presetName)

    try {
      await mkdir(path.dirname(presetFileName))
    }
    catch(e) {
      //exists
    }

    await writeFile(
      presetFileName,
      JSON.stringify(preset, undefined, ' '), 'utf8'
    )

  }

  /**
   * Render preview of a preset and save it to disk (usually called after save())
   */
  async createPreview(animationName, presetName: string, preset: PresetValues)
  {
    const animationClass=animations[animationName]
    const previewFilename=this.previewFilename(animationClass.presetDir, presetName)
    return(this.previewStore.render(previewFilename, animationClass, preset))
  }

  async delete(presetDir: string, presetName: string) {
    return rm(
      this.presetFilename(presetDir, presetName))
  }

  async getCategories() {
    let cat = {};
    for (const [animationName, animation] of Object.entries(animations)) {

      cat[animation.category]={}; //we can add more metadata if needed
    }
    return(cat);
  }


  /**
   * Returns list of all animations and all stripped presets, in jsonable format
   * NOTE: slow, cache?
   */
  async getPresets(categoryName: string) {
    let ret = {};

    for (const [animationName, animationClass] of Object.entries(animations)) {

      if (categoryName === animationClass.category) {

        ret[animationName] = {
          title: animationClass.title,
          description: animationClass.description,
          presets: {}
        };

        const presetNames = await this.getPresetNames(animationClass.presetDir)
        for (const presetName of presetNames) {
          const preset=ret[animationName].presets[presetName] = await this.load(animationClass.presetDir, presetName);

          //strip stuff to keep it smaller
          delete preset.values;

          //add preview file
          preset.previewFile=this.previewFilename(animationClass.presetDir, presetName)



        }
      }
    }
    return (ret);
  }

  //FIXME: make secure
  private presetFilename(presetDir: string, presetName: string) {
    return (path.join(this.presetPath, presetDir, presetName + ".json"));
  }

  //FIXME: make secure
  private previewFilename(presetDir: string, presetName: string) {
    return (path.join(this.presetPath, presetDir, presetName + ".png"));
  }
}
