import {writeFile} from "fs/promises";
import {DisplayApng} from "./drivers/DisplayApng.js";
import Scheduler from "../Scheduler.js";
import Animation from "../Animation.js";
import {PresetValues} from "../PresetValues.js";
import ControlGroup from "../ControlGroup.js";
import PixelBox from "../PixelBox.js"



//handles creation of previews
export class PreviewStore {

    display: DisplayApng
    controlGroup: ControlGroup
    scheduler: Scheduler
    private box: PixelBox

    constructor() {

        this.controlGroup = new ControlGroup('Root controls')
        this.display = new DisplayApng(40, 8)
        this.resetAnimation()
    }

    //reset animation, by creating new objects. This ensures that animation that still have some async call running cannot interfere with the next one.
    resetAnimation() {
        this.scheduler = new Scheduler();
        this.box=new PixelBox(this.display)
        this.scheduler = new Scheduler()
        this.controlGroup.clear()
    }

    /**
     * Renders preview to APNG file
     */
    async render(filename: string, animationClass: typeof Animation, preset: PresetValues) {
        console.log("> " + filename);

        this.resetAnimation()

        if (preset)
            this.controlGroup.load(preset.values);

        const fpsControl = this.controlGroup.value("FPS", 60, 1, 120)
        this.display.setFps(fpsControl.value)

        let animation: Animation = new animationClass()
        animation.run(this.box, this.scheduler, this.controlGroup).then(() => {
            // console.log(`PreviewStore: ${filename} finished.`)
        }).catch((e) => {
            if (e != 'abort') {
                console.error(`PreviewStore: ${filename} error`, e)
                if (process.env.NODE_ENV === 'development')
                    throw(e)
            }
        })

        //previews shouldnt have a higher than 60fps rate, so just divide more frames above 60fps
        const divider = ~~((this.display.fps - 1) / 60) + animationClass.previewDivider
        const fps = ~~(this.display.fps / divider)

        //skip frames, just run scheduler
        for (let i = 0; i < animationClass.previewSkip; i++)
            await this.scheduler.step();

        //render frames
        for (let i = 0; i < animationClass.previewFrames; i++) {
            for (let d = 0; d < divider; d++) {
                await this.scheduler.step()
            }

            this.display.render(this.box)
            this.display.frame()
        }

        //generate and store APNG
        let imageData = await this.display.get(fps)
        await writeFile(filename, Buffer.from(imageData))

        this.resetAnimation()
    }
}
