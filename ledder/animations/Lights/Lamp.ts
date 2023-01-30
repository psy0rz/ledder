import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import DrawBox from "../../draw/DrawBox.js"
import Animation from "../../Animation.js"

export default class Lamp extends  Animation
{


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const controlWidth=controls.value('Width', 2,1, box.width(), 1 , true)
        const controlHeight=controls.value('Height', 2,1, box.height(), 1 , true)
        const controlXspacing=controls.value('X spacing', 4,0, box.width(), 1 , true)
        const controlYspacing=controls.value('Y spacing', 4,0, box.height(), 1 , true)

        const color=controls.color()

        for (let x=box.xMin; x<box.xMax; x=x+controlXspacing.value+controlWidth.value)
            for (let y=box.yMin; y<box.yMax; y=y+controlYspacing.value+controlHeight.value)
                box.add(new DrawBox(x,y,controlWidth.value, controlHeight.value, color))



    }
}
