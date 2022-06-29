import {writeFile} from "fs/promises";
import {MatrixApng} from "./drivers/MatrixApng.js";
import {Scheduler} from "../ledder/Scheduler.js";
import {Animation} from "../ledder/Animation.js";
import {PresetValues} from "../ledder/PresetValues.js";
import {ControlGroup} from "../ledder/ControlGroup.js";

//handles creation of previews
export class PreviewStore {

    matrix: MatrixApng
    controlGroup: ControlGroup
    scheduler: Scheduler

    constructor() {

        this.controlGroup = new ControlGroup('Root controls')
        this.scheduler = new Scheduler();
        this.matrix = new MatrixApng(40, 8)
        this.matrix.scheduler=this.scheduler
    }

    clear()
    {
        this.scheduler.clear()
        this.matrix.clear()
        this.controlGroup.clear()
    }

    /**
     * Renders preview to APNG file
     */
    async render(filename: string, animationClass: typeof Animation, preset: PresetValues) {
        console.log("Rendering preview " + filename);

        this.clear()

        if (preset)
            this.controlGroup.load(preset.values);

        const fpsControl = this.controlGroup.value("FPS", 60, 1, 120)
        this.matrix.setFps(fpsControl.value)

        let animation: Animation = new animationClass()
        animation.run(this.matrix, this.scheduler, this.controlGroup).then(() => {
            console.log(`PreviewStore: ${filename} finished.`)
        }).catch((e) => {
            if (e != 'abort') {
                console.error(`PreviewStore: ${filename} error`, e)
                if (process.env.NODE_ENV === 'development')
                    throw(e)
            }
        })

        //previews shouldnt have a higher than 60fps rate, so just divide more frames above 60fps
        const divider = ~~((this.matrix.fps - 1) / 60) + animationClass.previewDivider
        const fps = ~~(this.matrix.fps / divider )

        //skip frames, just run scheduler
        for (let i = 0; i < animationClass.previewSkip; i++)
            await this.scheduler.step();

        //render frames
        for (let i = 0; i < animationClass.previewFrames; i++) {
            for (let d = 0; d < divider; d++) {
                await this.scheduler.step()
            }

            this.matrix.render(this.matrix)
            this.matrix.frame()
        }

        //generate and store APNG
        let imageData = await this.matrix.get(fps)
        await writeFile(filename, Buffer.from(imageData))

        this.clear()
    }
}
