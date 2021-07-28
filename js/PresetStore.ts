/**
 * Handles loading/saving of presets to disk. Can only be used server-side.
 */


import * as path from "path";
import {mkdir, readFile, rm, stat, writeFile} from "fs/promises";
import glob from "glob-promise";
import {PresetValues} from "./PresetValues.js";
import * as animations from "./animations/all.js";
import {PreviewStore} from "./PreviewStore.js";

// import {getMtime} from "./util.js";

/***
 * Get mtime of filename, returns 0 if it doesnt exist.
 * @param fileName
 */
export async function getMtime(fileName: string) {
  try {
    const s = await stat(fileName);
    return (s.mtimeMs)
  } catch (e) {
    return (0)
  }
}

export async function createParentDir(fileName: string) {
  try {
    await mkdir(path.dirname(fileName))
  } catch (e) {
    //exists
  }

}


export class PresetStore {
  presetPath: string;
  previewStore: PreviewStore

  constructor(presetPath: string) {
    this.presetPath = presetPath;

    this.previewStore = new PreviewStore(this)

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
   * Return preset in PresetValues format.
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

    const presetFileName = this.presetFilename(presetDir, presetName)
    await createParentDir(presetFileName);
    await writeFile(
      presetFileName,
      JSON.stringify(preset, undefined, ' '), 'utf8'
    )
  }

  /**
   * Render preview of a preset and save it to disk (usually called after save())
   */
  async createPreview(animationName, presetName: string, preset: PresetValues) {
    const animationClass = animations[animationName]
    const previewFilename = this.previewFilename(animationClass.presetDir, presetName)
    await createParentDir(previewFilename);
    return (this.previewStore.render(previewFilename, animationClass, preset))
  }


  /**
   * Update all previews for all presets that need it. (either presetfile-mtime or animationfile-mtime is newer)
   * @param animationName
   * @param animationClass
   * @param animationMtime
   * @param force
   */
  async updatePresetPreviews(animationName, animationClass, animationMtime: number, force:boolean) {

    const presetNames = await this.getPresetNames(animationClass.presetDir)
    for (const presetName of presetNames) {
      const previewFilename = this.previewFilename(animationClass.presetDir, presetName)
      const presetFilename = this.presetFilename(animationClass.presetDir, presetName)
      const previewMtime = await getMtime(previewFilename)
      if (force || animationMtime==0 || previewMtime < animationMtime || previewMtime < await getMtime(presetFilename)) {
        const preset = await this.load(animationClass.presetDir, presetName);
        try {
          await this.createPreview(animationName, presetName, preset)
        }
        catch(e)
        {
          console.error("Error while rendering preset preview: ",e)
        }
      }
    }

  }


  /**
   * Update all previews for all animation/preset combinations that need it, according to mtime
   */
  async updateAnimationPreviews(force: boolean) {

    for (const [animationName, animationClass] of Object.entries(animations)) {
      const previewFilename = this.previewFilename(animationClass.presetDir, "")
      const animationFilename = path.join("js","animations", animationName + ".ts")
      const animationMtime = await getMtime(animationFilename)
      if (animationMtime==0)
        console.warn("Cant find "+animationFilename+", always re-creating all previews. (check if filename matches classname)")

      if (force || animationMtime==0 || await getMtime(previewFilename) <= animationMtime) {
        try {
          await this.createPreview(animationName, "", undefined)
        }
        catch(e)
        {
          console.error("Error while rendering animation preview: ",e)
        }
      }

      await this.updatePresetPreviews(animationName, animationClass, animationMtime, force)

    }
  }

  async delete(presetDir: string, presetName: string) {
    await rm(this.presetFilename(presetDir, presetName))
    await rm(this.previewFilename(presetDir, presetName))
  }

  async getCategories() {
    let cat = {};
    for (const [animationName, animation] of Object.entries(animations)) {

      cat[animation.category] = {}; //we can add more metadata if needed
    }
    return (cat);
  }

  /*
   * Gets stripped list of all presets for animation, and adds previewUrl
   */
  async getPresetList(animationClass, animationName) {
    let ret = {}
    const presetNames = await this.getPresetNames(animationClass.presetDir)
    for (const presetName of presetNames) {
      const preset = ret[presetName] = await this.load(animationClass.presetDir, presetName);

      //strip stuff to keep it smaller
      delete preset.values;

      //add preview url, browsercache aware
      const previewFilename=this.previewFilename(animationClass.presetDir, presetName)
      preset.previewFile = previewFilename + "?" + await getMtime(previewFilename)
    }
    return (ret)

  }


  /**
   * Returns list of all animations and all stripped presets, in jsonable format
   * NOTE: slow, cache?
   */
  async getAnimationList(categoryName: string) {
    let ret = {};

    console.log("getAnimationList", categoryName)

    for (const [animationName, animationClass] of Object.entries(animations)) {

      if (categoryName === animationClass.category) {

        const previewFilename=await this.previewFilename(animationClass.presetDir, "");

        ret[animationName] = {
          title: animationClass.title,
          description: animationClass.description,
          presets: await this.getPresetList(animationClass, animationName),
          //add preview url, browsercache aware
          previewFile: previewFilename + '?' + await getMtime(previewFilename)

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
    return (path.join(this.presetPath, presetDir, presetName + "_.png"));
  }
}
