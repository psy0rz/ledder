/**
 * Handles loading/saving of presets to disk. Can only be used server-side.
 */

import * as path from "path"
import {mkdir, readdir, readFile, rm, stat, writeFile} from "fs/promises"
import glob from "glob-promise"
import {type PresetValues} from "../PresetValues.js"
import Animator from "../Animator.js"
import {type AnimationListType, type AnimationListDirType, type AnimationListItemType, type PresetListType,type  PresetListItemType} from "../AnimationListTypes.js"
import {createParentDir, getMtime} from "./utils.js"



export class PresetStore {
    presetPath: string
    animationPath: string

    constructor(animationPath: string = "ledder/animations", presetPath: string = "presets") {
        this.presetPath = presetPath
        this.animationPath = animationPath


    }

    private presetFilename(animationName: string, presetName: string) {
        return (path.join(this.presetPath, animationName, presetName + ".json"))
    }

    public previewFilename(animationName: string, presetName: string) {
        return (path.join(this.presetPath, animationName, presetName + ".png"))
    }

    public animationFilename(animationName: string) {
        return path.join(this.animationPath, animationName + ".js")
    }



    //dynamicly loads an animation class from disk and returns the Class
    async loadAnimation(animationName: string): Promise<typeof Animator> {
        //note: this path is relative to this javascript module instead of current working dir.
        const importFilename = path.join("..", "..", this.animationFilename(animationName))

        let module = await import(importFilename + "?" + Date.now()) //prevent caching

        if (module.default === undefined || !(module.default.prototype instanceof Animator))

            throw ("Not a valid Animation")

        return module.default
    }


    /**
     * Get all presetnames for specified animationName
     */
    async scanPresetNames(animationName: string) {
        const pattern = path.join(this.presetPath, animationName, "*.json")
        let names = ["default"]
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




    async previewOutdated(animationName: string, presetName: string) {
        const previewMtime = await getMtime(this.previewFilename(animationName, presetName))
        const animationMtime = await getMtime(this.animationFilename(animationName))
        const presetMtime = await getMtime(this.presetFilename(animationName, presetName))

        return (previewMtime == 0 || previewMtime < animationMtime || previewMtime < presetMtime)
    }

    // Gets stripped list of all presets for animation, and adds previewUrl
    async buildPresetList(animationClass: typeof Animator, animationName: string): Promise<PresetListType> {
        let ret: PresetListType = []
        const presetNames = await this.scanPresetNames(animationName)
        for (const presetName of presetNames) {
            const preset = await this.load(animationName, presetName)

            const previewFilename = this.previewFilename(animationName, presetName)
            ret.push({
                name: presetName,
                title: preset.title,
                description: preset.description,
                previewFile: previewFilename + "?" + await getMtime(this.previewFilename(animationName, presetName))
            })
        }
        return (ret)
    }


    // scans and loads all animations and returns the grand preset list
    async buildAnimationPresetList(dir: string = ""): Promise<AnimationListType> {
        let ret: AnimationListType = []


        const startPath = path.join(this.animationPath, dir)
        for (const entry of await readdir(startPath, {withFileTypes: true})) {
            if (entry.isDirectory())

                //recurse
                ret.push({
                    name: entry.name,
                    animationList: await this.buildAnimationPresetList(entry.name)
                })
            else {
                //actual animation?
                if (path.extname(entry.name) == '.js') {

                    const animationName = path.join(dir, path.basename(entry.name, ".js"))
                    // console.log(`\nLoading ${animationName}:`)
                    try {
                        const animationClass = await this.loadAnimation(animationName)

                        ret.push({
                            name: animationName,
                            title: animationClass.title,
                            description: animationClass.description,
                            presets: await this.buildPresetList(animationClass, animationName)
                        })
                    } catch (e) {
                        // if (process.env.NODE_ENV === 'development') {
                        //     throw(e)
                        // }
                        // else
                            console.error(`${animationName}: `, e)
                    }
                }
            }

        }

        return (ret)


    }

    //load animation preset list from disk (cached)
    async loadAnimationPresetList() {
        //TODO:cache
        return JSON.parse(await readFile(path.join(this.presetPath, 'index.json'), 'utf8'))
    }

    //update stored animation preset list
    async storeAnimationPresetList() {
        console.log("Creating animation preset list...")
        await writeFile(
            path.join(this.presetPath, 'index.json'),
            JSON.stringify(await this.buildAnimationPresetList(""), undefined, ' '), 'utf8'
        )
        console.log("Completed animation list.")
    }


    //calls back for every animation,preset item.
    //e.g. traverse the whole list recursively.
    async forEachPreset(animationList:AnimationListType, callback: (animationListItem:AnimationListItemType, presetListItem:PresetListItemType)=>void) {

        for (const item of animationList) {
            const animationListItem = item as AnimationListItemType
            const animationListDir = item as AnimationListDirType
            if (animationListDir.animationList) {
                await this.forEachPreset(animationListDir.animationList, callback)
            } else {
                for (const presetListItem of animationListItem.presets) {
                    await callback(animationListItem, presetListItem)
                }
            }
        }
    }
}



export let presetStore=new PresetStore()