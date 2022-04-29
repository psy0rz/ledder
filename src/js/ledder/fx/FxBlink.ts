import {Fx} from "../Fx.js";
import {ControlValue} from "../ControlValue.js";
import {Matrix} from "../Matrix.js";
import {Pixel} from "../Pixel.js";
import {PixelContainer} from "../PixelContainer.js";
import {ColorInterface} from "../ColorInterface.js";

export default class FxBlink extends Fx {

    static title = "Blink pixels via alpha channel. (always starts with on, ends with off)"

    onDelay: ControlValue
    offDelay: ControlValue
    repeat: ControlValue

    constructor(matrix: Matrix, controlPrefix: string, onDelay=60, offDelay=60, repeat=0) {
        super(matrix, controlPrefix)

        this.onDelay = matrix.preset.value(controlPrefix + ' on delay', onDelay, 1, 120, 1)
        this.offDelay = matrix.preset.value(controlPrefix + ' off delay', offDelay, 1, 120, 1)
        this.repeat = matrix.preset.value(controlPrefix + ' repeat', repeat, 0, 120, 1)
    }

    run(...colors:Array<ColorInterface>) {

        this.running = true

        let on=false
        let count=this.offDelay.value
        let repeated=0
        this.promise = this.matrix.scheduler.interval(1, (frameNr) => {
            if (on)
            {
                if (count>=this.onDelay.value) {
                    on = false
                    count=0
                    for (const c of colors)
                        c.a = 0
                    repeated=repeated+1
                }
            }
            else
            {
                if (count>=this.offDelay.value) {
                    on = true
                    count=0
                    for (const c of colors)
                        c.a = 1
                }
            }

            count=count+1
            return ( (this.repeat.value==0 || repeated<this.repeat.value) && this.running)
        })


        return (this.promise)
    }
}
