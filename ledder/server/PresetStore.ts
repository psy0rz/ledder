/**
 * Handles loading/saving of presets to disk. Can only be used server-side.
 */

import * as path from "path"
import {mkdir, readdir, readFile, rm, stat, writeFile} from "fs/promises"
import glob from "glob-promise"
import {PresetValues} from "../PresetValues.js"
import {PreviewStore} from "./PreviewStore.js"
import Animation from "../Animation.js"
import {AnimationList, PresetList} from "../AnimationLists.js"


/***
 * Get mtime of filename, returns 0 if it doesnt exist.
 * @param fileName
 */
export async function getMtime(fileName: string) {
    try {
        const s = await stat(fileName)
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
    presetPath: string
    animationPath: string
    private previewStore: PreviewStore

    constructor(animationPath: string = "ledder/animations", presetPath: string = "presets") {
        this.presetPath = presetPath
        this.animationPath = animationPath
        this.previewStore = new PreviewStore()


    }

    private presetFilename(animationName: string, presetName: string) {
        return (path.join(this.presetPath, animationName, presetName + ".json"))
    }

    private previewFilename(animationName: string, presetName: string) {
        return (path.join(this.presetPath, animationName, presetName + ".png"))
    }

    private animationFilename(animationName: string) {
        return path.join(this.animationPath, animationName + ".js")
    }


    //recursively scan animation dir and return list of all javascript names (short form without base path and extension)
    // async scanAnimationDir(basePath: string = ""): Promise<AnimationList> {
    //     let ret = {
    //         name: basePath,
    //         entries: []
    //     }
    //     const startPath = path.join(this.animationPath, basePath)
    //     for (const entry of await readdir(startPath, {withFileTypes: true})) {
    //         if (entry.isDirectory())
    //             //recurse
    //             ret.entries.push(await this.scanAnimationDir(path.join(basePath, entry.name)))
    //         else {
    //             if (path.extname(entry.name) == '.js') {
    //                 ret.entries.push({
    //                     name: path.basename(entry.name, ".js")
    //                 })
    //             }
    //         }
    //     }
    //     return (ret)
    // }

    //dynamicly loads an animation class from disk and returns the Class
    async loadAnimation(animationName: string): Promise<typeof Animation> {
        //note: this path is relative to this javascript module instead of current working dir.
        const importFilename=path.join("..","..",this.animationFilename(animationName))

        let module = await import(importFilename+ "?" + Date.now()) //prevent caching

        if (module.default === undefined || !(module.default.prototype instanceof Animation))

            throw ("Not a valid Animation")

        return module.default
    }


    /**
     * Get all presetnames for specified animationName
     */
    async scanPresetNames(animationName: string) {
        const pattern = path.join(this.presetPath, animationName, "*.json")
        let names = []
        for (const file of await glob(pattern)) {
            //ignore default, since that one is explicit
            const name = path.basename(file, ".json")
            if (name !== "default")
                names.push(name)
        }
        return names
    }

    /**
     * Load a preset and return it in PresetValues format.

     */
    async load(animationName: string, presetName: string): Promise<PresetValues> {

        try {
            return JSON.parse(await readFile(this.presetFilename(animationName, presetName), 'utf8'))
        } catch (e) {
            //default doesnt have to exist
            if (presetName !== "default")
                throw(e)

            return {
                title: "",
                description: "",
                values: {}
            }

        }

    }

    async delete(animationName: string, presetName: string) {
        await rm(this.presetFilename(animationName, presetName))
        await rm(this.previewFilename(animationName, presetName))

    }


    /**
     * Save preset to disk
     */
    async save(animationName: string, presetName: string, preset: PresetValues) {

        const presetFileName = this.presetFilename(animationName, presetName)
        await createParentDir(presetFileName)
        await writeFile(
            presetFileName,
            JSON.stringify(preset, undefined, ' '), 'utf8'
        )
        // await this.updateAnimationPresetList()
    }

    /**
     * Render preview of a preset and save it to disk
     */
    async createPreview(animationClass: typeof  Animation, animationName: string, presetName: string, preset: PresetValues) {


        const previewFilename = this.previewFilename(animationName, presetName)
        await createParentDir(previewFilename)
        // const animationClass = await this.loadAnimation(animationName)
        await this.previewStore.render(previewFilename, animationClass, preset)
    }


    /**
     * Update all previews for all presets that need it. (either presetfile-mtime or animationfile-mtime is newer)
     */
    // async updatePresetPreviews(animatonName: string, animationMtime: number, force: boolean) {
    //
    //     const presetNames = await this.scanPresetNames(animatonName)
    //
    //     presetNames.push("default")
    //
    //     for (const presetName of presetNames) {
    //         const previewFilename = this.previewFilename(animatonName, presetName)
    //         const presetFilename = this.presetFilename(animatonName, presetName)
    //         const previewMtime = await getMtime(previewFilename)
    //         if (force || animationMtime == 0 || previewMtime < animationMtime || previewMtime < await getMtime(presetFilename)) {
    //             const preset = await this.load(animatonName, presetName)
    //             try {
    //                 await this.createPreview(animatonName, presetName, preset)
    //             } catch (e) {
    //                 console.error(` ${animatonName} / ${presetName}: `, e)
    //             }
    //         }
    //     }
    //
    // }


    /**
     * Update all previews for all animation/preset combinations that need it, according to mtime
     */
    // async updateAnimationPreviews(force: boolean) {
    //
    //     console.log("Rendering previews...")
    //
    //     for (let animationName of await this.scanAnimationDir()) {
    //         try {
    //
    //             // let animationClass = await this.loadAnimation(animationName)
    //             // const previewFilename = this.previewFilename(animationName, "")
    //             const animationFilename = path.join("ledder", "animations", animationName + ".js")
    //             const animationMtime = await getMtime(animationFilename)
    //             if (animationMtime == 0)
    //                 console.warn("Cant find " + animationFilename + ", always re-creating all previews. (check if filename matches classname)")
    //
    //
    //             // if (force || animationMtime == 0 || await getMtime(previewFilename) <= animationMtime) {
    //             //     try {
    //             //         await this.createPreview(animationClass, "default", undefined)
    //             //     } catch (e) {
    //             //         console.error(` ${animationName}: `, e)
    //             //         // throw(e)
    //             //     }
    //             // }
    //
    //             await this.updatePresetPreviews(animationName, animationMtime, force)
    //         } catch (e) {
    //             console.error(` ${animationName}: ${e}`)
    //             // throw(e)
    //         }
    //
    //     }
    //     // console.log("Preview rendering complete")
    // }


    // async getCategories() {
    //     let cat = new Set();
    //     for (const [animationName, animation] of Object.entries(animations)) {
    //
    //         cat.add(animation.category)
    //     }
    //
    //     return ([...cat]);
    // }

    async previewOutdated(animationName: string, presetName: string) {
        const previewMtime = await getMtime(this.previewFilename(animationName, presetName))
        const animationMtime = await getMtime(this.animationFilename(animationName))
        const presetMtime = await getMtime(this.presetFilename(animationName, presetName))

        return (previewMtime == 0 || previewMtime < animationMtime || previewMtime < presetMtime)
    }

    // Gets stripped list of all presets for animation, and adds previewUrl
    async buildPresetList(animationClass: typeof Animation, animationName: string, updatePreview: boolean, forcePreview: boolean): Promise<PresetList> {
        let ret: PresetList = []
        const presetNames = await this.scanPresetNames(animationName)
        for (const presetName of presetNames) {
            const preset = await this.load(animationName, presetName)

            if (updatePreview) {
                if (forcePreview || await this.previewOutdated(animationName, presetName)) {
                    try {
                        console.log(` - Rendering ${presetName} ...`)
                        await this.createPreview(animationClass, animationName, presetName, preset)
                    } catch (e) {
                        console.error(` ${animationName} -> ${presetName}: `, e)
                    }
                }
            }

            const previewFilename = this.previewFilename(animationName, presetName)
            ret.push({
                name: presetName,
                title: preset.title,
                description: preset.description,
                previewFile: previewFilename + "?" + await getMtime(previewFilename)
            })
        }
        return (ret)
    }


    // scans and loads all animations and returns the grand preset list
    async buildAnimationPresetList(dir: string = ""): Promise<AnimationList> {
        let ret: AnimationList = []


        const startPath = path.join(this.animationPath, dir)
        for (const entry of await readdir(startPath, {withFileTypes: true})) {
            if (entry.isDirectory())

                //recurse
                ret.push({
                    name: entry.name,
                    entries: await this.buildAnimationPresetList(entry.name)
                })
            else {
                //actual animation?
                if (path.extname(entry.name) == '.js') {

                    const animationName = path.join(dir, path.basename(entry.name, ".js"))
                    console.log(`Loading ${animationName}:`)
                    try {
                        const animationClass = await this.loadAnimation(animationName)

                        ret.push({
                            name: animationName,
                            title: animationClass.title,
                            description: animationClass.description,
                            presets: await this.buildPresetList(animationClass, animationName, true ,false)
                        })
                    } catch (e) {
                        console.error(`${animationName}: `, e)
                    }
                }
            }

        }

        return (ret)


        // for (const animationName of) {
        //
        //     try {
        //         let animationClass: typeof Animation
        //         animationClass = await this.loadAnimation(animationName)
        //
        //
        //
        //         let presets = await this.scanPresetList(animationName)
        //         ret.push({
        //             name: animationName,
        //             title: animationClass.title,
        //             description: animationClass.description,
        //             presets: presets,
        //             //add preview url, browsercache aware
        //             previewFile: previewFilename + '?' + await getMtime(previewFilename)
        //
        //         })
        //     } catch (e) {
        //         console.error(` ${animationName}: `, e)
        //     }
        //
        // }
        // return (ret)
    }

    //load animation preset list from disk (cached)
    async loadAnimationPresetList() {
        return JSON.parse(await readFile(path.join(this.presetPath, 'index.json'), 'utf8'))
    }

    //update stored animation preset list
    async storeAnimationPresetList() {
        await writeFile(
            path.join(this.presetPath, 'index.json'),
            JSON.stringify(await this.buildAnimationPresetList(), undefined, ' '), 'utf8'
        )
    }


}
