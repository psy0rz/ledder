import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Color from "../../Color.js"

const TWO_PI = Math.PI * 2

export default class Rainbowcross extends Animator {

    static description = "Rainbow rings around a center point, breathing in and out. Close to the center the rings collapse into a shimmering cross."

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const brightnessControl = controls.value("alpha/brightness", 0.9, 0.1, 1, 0.05)
        const intervalControl = controls.value("Fractal interval", 1, 1, 10, 0.1)

        //The ring pattern is sin(pulse / distance / wavelength): dividing by the distance is what
        //squeezes the rings together towards the center, the pulse makes them travel in and out.
        const ringControls = controls.group("Rings", false, true)
        const ringWavelengthControl = ringControls.value("Wavelength", 64, 1, 256, 1)
        const centerDistanceControl = ringControls.value("Center distance offset", 0.01, 0.01, 5, 0.01)

        const pulseControls = controls.group("Pulse", false, true)
        const pulseSpeedControl = pulseControls.value("Speed", 0.001, 0, 0.02, 0.0001)
        const pulseAmplitudeControl = pulseControls.value("Amplitude", 10000, 100, 50000, 100)

        //Identical phases give a single hue sweep, a quarter turn apart (the original blue cosine)
        //gives rainbows.
        const phaseControls = controls.group("Color phase (turns)", false, true)
        const redPhaseControl = phaseControls.value("Red", 0, 0, 1, 0.01)
        const greenPhaseControl = phaseControls.value("Green", 0, 0, 1, 0.01)
        const bluePhaseControl = phaseControls.value("Blue", 0.25, 0, 1, 0.01)

        const centerPosition = controls.position("Center", box, false, "center", 0, "middle", 0)
        const centerDotControl = controls.switch("White center dot", true, false)

        //The bouncing center the original had commented out. Off by default, so the defaults still
        //render the static pattern.
        const bounceControls = controls.group("Bounce center", false, true, true, false)
        const bounceSpeedXControl = bounceControls.value("Speed X", -0.5, -3, 3, 0.1)
        const bounceSpeedYControl = bounceControls.value("Speed Y", 0.7, -3, 3, 0.1)

        const displayWidth = box.width()
        const displayHeight = box.height()

        //One pixel object per coordinate, created once: every frame only updates the colors.
        const rasterPixels = box.raster(box, new Color(0, 0, 0, 1))

        //Distance to the center only changes when the center moves, so keep it out of the frame
        //loop: that is one sqrt per pixel per frame saved.
        const distances = new Float64Array(displayWidth * displayHeight)
        let distancesCenterX = NaN
        let distancesCenterY = NaN

        const updateDistances = (centerX: number, centerY: number, centerDistanceOffset: number) => {
            let index = 0
            for (let x = 0; x < displayWidth; x++) {
                const difX = x - centerX
                for (let y = 0; y < displayHeight; y++) {
                    const difY = y - centerY
                    distances[index++] = Math.sqrt(difX * difX + difY * difY) + centerDistanceOffset
                }
            }
            distancesCenterX = centerX
            distancesCenterY = centerY
        }

        let bouncePositionX = centerPosition.x
        let bouncePositionY = centerPosition.y
        let bounceDirectionX = 1
        let bounceDirectionY = 1
        let pulsePhase = 0
        let previousCenterDistanceOffset = NaN

        scheduler.intervalControlled(intervalControl, () => {

            pulsePhase = pulsePhase + pulseSpeedControl.value
            const pulse = Math.sin(pulsePhase) * pulseAmplitudeControl.value

            let centerX = centerPosition.x
            let centerY = centerPosition.y

            if (bounceControls.enabled) {
                bouncePositionX = bouncePositionX + bounceSpeedXControl.value * bounceDirectionX
                bouncePositionY = bouncePositionY + bounceSpeedYControl.value * bounceDirectionY

                if (bouncePositionX > displayWidth - 1 || bouncePositionX < 0) {
                    bounceDirectionX = -bounceDirectionX
                    bouncePositionX = Math.min(Math.max(bouncePositionX, 0), displayWidth - 1)
                }
                if (bouncePositionY > displayHeight - 1 || bouncePositionY < 0) {
                    bounceDirectionY = -bounceDirectionY
                    bouncePositionY = Math.min(Math.max(bouncePositionY, 0), displayHeight - 1)
                }

                centerX = bouncePositionX
                centerY = bouncePositionY
            } else {
                bouncePositionX = centerX
                bouncePositionY = centerY
            }

            centerX = Math.round(centerX)
            centerY = Math.round(centerY)

            const centerDistanceOffset = centerDistanceControl.value
            if (centerX != distancesCenterX || centerY != distancesCenterY || centerDistanceOffset != previousCenterDistanceOffset) {
                updateDistances(centerX, centerY, centerDistanceOffset)
                previousCenterDistanceOffset = centerDistanceOffset
            }

            const amplitude = 127 * brightnessControl.value
            const ringWavelength = ringWavelengthControl.value
            const redPhase = redPhaseControl.value * TWO_PI
            const greenPhase = greenPhaseControl.value * TWO_PI
            const bluePhase = bluePhaseControl.value * TWO_PI

            let index = 0
            for (let x = 0; x < displayWidth; x++) {
                const column = rasterPixels[x]
                for (let y = 0; y < displayHeight; y++) {

                    const wave = pulse / distances[index++] / ringWavelength

                    const color = column[y].color
                    color.r = Math.sin(wave + redPhase) * amplitude + amplitude
                    color.g = Math.sin(wave + greenPhase) * amplitude + amplitude
                    color.b = Math.sin(wave + bluePhase) * amplitude + amplitude
                }
            }

            if (centerDotControl.enabled) {
                const centerColumn = rasterPixels[centerX]
                if (centerColumn !== undefined && centerColumn[centerY] !== undefined) {
                    const centerColor = centerColumn[centerY].color
                    centerColor.r = 255
                    centerColor.g = 255
                    centerColor.b = 255
                }
            }
        })
    }
}
