/**
 * Handles loading/saving of presets to disk. Can only be used server-side.
 */

import * as path from "path";
import {mkdir, readFile, rm, stat, writeFile} from "fs/promises";
import glob from "glob-promise";
import {PresetValues} from "../ledder/PresetValues.js";
import {PreviewStore} from "./PreviewStore.js";
import {Animation} from "../ledder/Animation.js";


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
    animationPath: string;

    constructor(animationPath: string = "src/js/ledder/animations", presetPath: string = "presets") {
        this.presetPath = presetPath;
        this.animationPath = animationPath


    }

    //scan animation dir and return list of all javascript names (short form without path and extension)
    async scanAnimationDir():Promise<Array<string>> {
        let ret = []
        const pattern = path.join(this.animationPath, "*.js");
        for (const file of await glob(pattern)) {
            ret.push(path.basename(file, ".js"))
        }
        return (ret)
    }

    //dynamicly loads an animation class from disk and returns the Class
    async loadAnimation(animationName: string): Promise<typeof Animation> {
        //hack: this path is relative to the current file instead of current working dir.
        let filename = "../ledder/animations/" + animationName + ".js"
        console.log("Loading javascript ", filename)
        let module = await import(filename)

        if (!(module.default.prototype instanceof Animation))

            throw ("Not a valid Animation")

        return module.default
    }


    /**
     * Get all presetnames for specified presetDir
     */
    async scanPresetNames(presetDir: string) {
        const pattern = path.join(this.presetPath, presetDir, "*.json");
        let names = [];
        for (const file of await glob(pattern)) {
            names.push(path.basename(file, ".json"))
        }
        return names
    }

    /**
     * Return preset in PresetValues format.

     */
    async load(animationClass: typeof Animation, presetName: string) {
        return JSON.parse(await readFile(this.presetFilename(animationClass.presetDir, presetName), 'utf8'))
    }

    async delete(animationClass: typeof Animation, presetName: string) {
        await rm(this.presetFilename(animationClass.presetDir, presetName))
        await rm(this.previewFilename(animationClass.presetDir, presetName))

    }


    /**
     * Save preset to disk
     */
    async save(animationClass: typeof Animation, presetName: string, preset: PresetValues) {

        const presetFileName = this.presetFilename(animationClass.presetDir, presetName)
        await createParentDir(presetFileName);
        await writeFile(
            presetFileName,
            JSON.stringify(preset, undefined, ' '), 'utf8'
        )
        // await this.updateAnimationPresetList()
    }

    /**
     * Render preview of a preset and save it to disk
     */
    async createPreview(animationClass: typeof Animation, presetName: string, preset: PresetValues) {
        let previewStore = new PreviewStore()


        const previewFilename = this.previewFilename(animationClass.presetDir, presetName)
        await createParentDir(previewFilename)
        await previewStore.render(previewFilename, animationClass, preset)
    }


    /**
     * Update all previews for all presets that need it. (either presetfile-mtime or animationfile-mtime is newer)
     * @param animationName
     * @param animationClass
     * @param animationMtime
     * @param force
     */
    async updatePresetPreviews(animationClass: typeof Animation, animationMtime: number, force: boolean) {

        const presetNames = await this.scanPresetNames(animationClass.presetDir)
        for (const presetName of presetNames) {
            const previewFilename = this.previewFilename(animationClass.presetDir, presetName)
            const presetFilename = this.presetFilename(animationClass.presetDir, presetName)
            const previewMtime = await getMtime(previewFilename)
            if (force || animationMtime == 0 || previewMtime < animationMtime || previewMtime < await getMtime(presetFilename)) {
                const preset = await this.load(animationClass, presetName);
                try {
                    await this.createPreview(animationClass, presetName, preset)
                } catch (e) {
                    console.error("Error while rendering preset preview: ", e)
                }
            }
        }

    }


    /**
     * Update all previews for all animation/preset combinations that need it, according to mtime
     */
    async updateAnimationPreviews(force: boolean) {

        console.log("Rendering previews...")

        for (let animationName of await this.scanAnimationDir()) {
            try {

                let animationClass = await this.loadAnimation(animationName)
                const previewFilename = this.previewFilename(animationClass.presetDir, "")
                const animationFilename = path.join("src", "js", "ledder", "animations", animationName + ".js")
                const animationMtime = await getMtime(animationFilename)
                if (animationMtime == 0)
                    console.warn("Cant find " + animationFilename + ", always re-creating all previews. (check if filename matches classname)")

                if (force || animationMtime == 0 || await getMtime(previewFilename) <= animationMtime) {
                    try {
                        await this.createPreview(animationClass, "", undefined)
                    } catch (e) {
                        console.error("Error while rendering animation preview: ", e)
                    }
                }

                await this.updatePresetPreviews(animationClass, animationMtime, force)
            } catch (e) {
                console.log(`Ignored ${animationName}: ${e}`)
            }

        }
        console.log("Preview rendering complete")
    }


    // async getCategories() {
    //     let cat = new Set();
    //     for (const [animationName, animation] of Object.entries(animations)) {
    //
    //         cat.add(animation.category)
    //     }
    //
    //     return ([...cat]);
    // }

    // Gets stripped list of all presets for animation, and adds previewUrl
    async scanPresetList(animationClass: typeof Animation) {
        let ret = []
        const presetNames = await this.scanPresetNames(animationClass.presetDir)
        for (const presetName of presetNames) {
            const preset = await this.load(animationClass, presetName);
            const previewFilename = this.previewFilename(animationClass.presetDir, presetName)

            let strippedPreset = {
                title: preset.title,
                description: preset.description,
                name: presetName,
                previewFile: previewFilename + "?" + await getMtime(previewFilename)
            }
            // console.log(strippedPreset)
            ret.push(strippedPreset)
        }
        return (ret)
    }

    // scans and loads all animations and returns the grand preset list
    async scanAnimationPresetList() {
        let ret = [];

        for (const animationName of await this.scanAnimationDir()) {

            try {
                let animationClass: typeof Animation
                animationClass = await this.loadAnimation(animationName)


                const previewFilename = this.previewFilename(animationClass.presetDir, "");

                let presets = await this.scanPresetList(animationClass)
                ret.push({
                    name: animationName,
                    title: animationClass.title,
                    description: animationClass.description,
                    presets: presets,
                    //add preview url, browsercache aware
                    previewFile: previewFilename + '?' + await getMtime(previewFilename)

                })
            } catch (e) {
                console.log(`Ignored ${animationName}: ${e}`)
            }

        }
        return (ret)
    }

    //load animation preset list from disk (cached)
    async loadAnimationPresetList() {
        return JSON.parse(await readFile(path.join(this.presetPath, 'index.json'), 'utf8'))
    }

    //update stored animation preset list
    async updateAnimationPresetList() {
        console.log("Updating animation preset list...")
        await writeFile(
            path.join(this.presetPath, 'index.json'),
            JSON.stringify(await this.scanAnimationPresetList(), undefined, ' '), 'utf8'
        )
        console.log("done")
    }

    private presetFilename(presetDir: string, presetName: string) {
        return (path.join(this.presetPath, presetDir, presetName + ".json"));
    }

    private previewFilename(presetDir: string, presetName: string) {
        return (path.join(this.presetPath, presetDir, presetName + "_.png"));
    }
}
