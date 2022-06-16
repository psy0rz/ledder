import {writeFile} from "fs/promises";
import {MatrixApng} from "./drivers/MatrixApng.js";
import {Scheduler} from "../ledder/Scheduler.js";
import {Animation} from "../ledder/Animation.js";
import {PresetValues} from "../ledder/PresetValues.js";
import {ControlGroup} from "../ledder/ControlGroup.js";

//handles creation of previews
export class PreviewStore {

    matrix: MatrixApng
    controls: ControlGroup
    scheduler: Scheduler

    constructor() {

        this.controls = new ControlGroup('Root controls')
        this.scheduler = new Scheduler();
        this.matrix = new MatrixApng(40, 8)
        this.matrix.scheduler=this.scheduler
    }

    clear()
    {
        this.scheduler.clear()
        this.matrix.reset()
        this.controls.clear()
    }

    /**
     * Renders preview to APNG file
     */
    async render(filename: string, animationClass: typeof Animation, preset: PresetValues) {
        console.log("Rendering preview " + filename);

        this.clear()

        if (preset)
            this.controls.load(preset.values);

        let animation: Animation = new animationClass(this.matrix)
        animation.run(this.matrix, this.scheduler, this.controls).then(() => {
            console.log(`PreviewStore: ${filename} finished.`)
        }).catch((e) => {
            console.error(`PreviewStore: ${filename} error`, e)
        })

        //FIXME: fps control
        let fpsControl={ value: 60}
        //previews shouldnt have a higher than 60fps rate, so just divide more frames above 60fps
        const divider = ~~((fpsControl.value - 1) / 60) + animationClass.previewDivider
        const fps = ~~(fpsControl.value / divider )

        //skip frames, just run scheduler
        for (let i = 0; i < animationClass.previewSkip; i++)
            this.scheduler.step();

        //render frames
        for (let i = 0; i < animationClass.previewFrames; i++) {
            for (let d = 0; d < divider; d++)
                this.scheduler.step()

            this.matrix.render()
            this.matrix.frame()
        }

        //generate and store APNG
        let imageData = await this.matrix.get(fps)
        await writeFile(filename, Buffer.from(imageData))

        this.clear()
    }
}
