//run an animation from within another animation.
import Display from "../Display.js"
import AnimationManager from "./AnimationManager.js"
import {mkdir, stat} from "fs/promises"
import path from "path"


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
        await mkdir(path.dirname(fileName), {recursive: true})
    } catch (e) {
        //exists
    }

}



/*
Pre-render animation non-realtime. (e.g. a preview or static rendered animation)
 */
export  function preRender(display: Display, animationManager: AnimationManager) {

    //set default fps (animation can change this)
    animationManager.scheduler.setFrameTime(display.defaultFrameTime)

    //skip first frames, just run scheduler
    for (let i = 0; i < animationManager.animationClass.previewSkip; i++)
        animationManager.scheduler.step()

    //render frames
    let displayTime = 0
    let frameTime = 0
    for (let i = 0; i < animationManager.animationClass.previewFrames; i++) {

        for (let d = 0; d < animationManager.animationClass.previewDivider; d++) {
            frameTime = frameTime + animationManager.scheduler.step()
        }

        frameTime=~~(frameTime/display.frameRounding)*display.frameRounding

        //skip frames until frameTime is more than minimum allowed
        if (frameTime >= display.minFrameTime) {
            displayTime += frameTime
            frameTime = 0
            display.render(animationManager.box)
            display.frame(displayTime)
        }
    }

}
