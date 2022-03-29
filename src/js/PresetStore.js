/**
 * Handles loading/saving of presets to disk. Can only be used server-side.
 */
import * as path from "path";
import { mkdir, readFile, rm, stat, writeFile } from "fs/promises";
import glob from "glob-promise";
import * as animations from "./led/animations/all.js";
import { PreviewStore } from "./led/PreviewStore.js";
// import {getMtime} from "./util.js";
/***
 * Get mtime of filename, returns 0 if it doesnt exist.
 * @param fileName
 */
export async function getMtime(fileName) {
    try {
        const s = await stat(fileName);
        return (s.mtimeMs);
    }
    catch (e) {
        return (0);
    }
}
export async function createParentDir(fileName) {
    try {
        await mkdir(path.dirname(fileName));
    }
    catch (e) {
        //exists
    }
}
export class PresetStore {
    constructor(presetPath) {
        this.presetPath = presetPath;
        this.previewStore = new PreviewStore(this);
    }
    /**
     * Get all presetnames for specified animation
     */
    async getPresetNames(presetDir) {
        const pattern = path.join(this.presetPath, presetDir, "*.json");
        let names = [];
        for (const file of await glob(pattern)) {
            names.push(path.basename(file, ".json"));
        }
        return names;
    }
    /**
     * Return preset in PresetValues format.
     * @param presetDir
     * @param presetName
     */
    async load(presetDir, presetName) {
        return JSON.parse(await readFile(this.presetFilename(presetDir, presetName), 'utf8'));
    }
    /**
     * Save preset to disk
     * @param presetDir
     * @param presetName
     * @param preset
     */
    async save(presetDir, presetName, preset) {
        const presetFileName = this.presetFilename(presetDir, presetName);
        await createParentDir(presetFileName);
        await writeFile(presetFileName, JSON.stringify(preset, undefined, ' '), 'utf8');
    }
    /**
     * Render preview of a preset and save it to disk (usually called after save())
     */
    async createPreview(animationName, presetName, preset) {
        const animationClass = animations[animationName];
        const previewFilename = this.previewFilename(animationClass.presetDir, presetName);
        await createParentDir(previewFilename);
        return (this.previewStore.render(previewFilename, animationClass, preset));
    }
    /**
     * Update all previews for all presets that need it. (either presetfile-mtime or animationfile-mtime is newer)
     * @param animationName
     * @param animationClass
     * @param animationMtime
     * @param force
     */
    async updatePresetPreviews(animationName, animationClass, animationMtime, force) {
        const presetNames = await this.getPresetNames(animationClass.presetDir);
        for (const presetName of presetNames) {
            const previewFilename = this.previewFilename(animationClass.presetDir, presetName);
            const presetFilename = this.presetFilename(animationClass.presetDir, presetName);
            const previewMtime = await getMtime(previewFilename);
            if (force || animationMtime == 0 || previewMtime < animationMtime || previewMtime < await getMtime(presetFilename)) {
                const preset = await this.load(animationClass.presetDir, presetName);
                try {
                    await this.createPreview(animationName, presetName, preset);
                }
                catch (e) {
                    console.error("Error while rendering preset preview: ", e);
                }
            }
        }
    }
    /**
     * Update all previews for all animation/preset combinations that need it, according to mtime
     */
    async updateAnimationPreviews(force) {
        for (const [animationName, animationClass] of Object.entries(animations)) {
            const previewFilename = this.previewFilename(animationClass.presetDir, "");
            const animationFilename = path.join("src", "js", "led", "animations", animationName + ".ts");
            const animationMtime = await getMtime(animationFilename);
            if (animationMtime == 0)
                console.warn("Cant find " + animationFilename + ", always re-creating all previews. (check if filename matches classname)");
            if (force || animationMtime == 0 || await getMtime(previewFilename) <= animationMtime) {
                try {
                    await this.createPreview(animationName, "", undefined);
                }
                catch (e) {
                    console.error("Error while rendering animation preview: ", e);
                }
            }
            await this.updatePresetPreviews(animationName, animationClass, animationMtime, force);
        }
    }
    async delete(presetDir, presetName) {
        await rm(this.presetFilename(presetDir, presetName));
        await rm(this.previewFilename(presetDir, presetName));
    }
    async getCategories() {
        let cat = new Set();
        for (const [animationName, animation] of Object.entries(animations)) {
            cat.add(animation.category);
        }
        return ([...cat]);
    }
    /*
     * Gets stripped list of all presets for animation, and adds previewUrl
     */
    async getPresetList(animationClass, animationName) {
        let ret = [];
        const presetNames = await this.getPresetNames(animationClass.presetDir);
        for (const presetName of presetNames) {
            const preset = await this.load(animationClass.presetDir, presetName);
            const previewFilename = this.previewFilename(animationClass.presetDir, presetName);
            let strippedPreset = {
                title: preset.title,
                description: preset.description,
                name: presetName,
                previewFile: previewFilename + "?" + await getMtime(previewFilename)
            };
            // console.log(strippedPreset)
            ret.push(strippedPreset);
        }
        return (ret);
    }
    /**
     * Returns list of all animations and all stripped presets, in jsonable format
     * NOTE: slow, cache?
     */
    async getAnimationList() {
        let ret = [];
        for (const [animationName, animationClass] of Object.entries(animations)) {
            const previewFilename = this.previewFilename(animationClass.presetDir, "");
            let presets = await this.getPresetList(animationClass, animationName);
            ret.push({
                name: animationName,
                title: animationClass.title,
                description: animationClass.description,
                presets: presets,
                //add preview url, browsercache aware
                previewFile: previewFilename + '?' + await getMtime(previewFilename)
            });
        }
        // console.log("getAnimationList", ret)
        return (ret);
    }
    //FIXME: make secure
    presetFilename(presetDir, presetName) {
        return (path.join(this.presetPath, presetDir, presetName + ".json"));
    }
    //FIXME: make secure
    previewFilename(presetDir, presetName) {
        return (path.join(this.presetPath, presetDir, presetName + "_.png"));
    }
}
//# sourceMappingURL=PresetStore.js.map