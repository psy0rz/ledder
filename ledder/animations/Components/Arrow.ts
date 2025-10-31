import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import DrawLine from "../../draw/DrawLine.js";

export default class Arrow extends Animator {
    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        // User specifies tip (x, y), angle, arrow length, flank length, flank angle
        let colorControl = controls.color('Color', 255,255,0,1);

        // Controls for tip position
        let tipX = controls.value("Tip X", Math.round(box.middleX()), box.xMin, box.xMax, 1, true);
        let tipY = controls.value("Tip Y", Math.round(box.middleY()), box.yMin, box.yMax, 1, true);
        let angle = controls.value("Angle", 0, 0, 360, 1, true);

        // Arrow and flank lengths
        let arrowLength = controls.value("Arrow length", 12, 1, Math.max(box.xMax - box.xMin, box.yMax - box.yMin), 1, true);
        let flankLength = controls.value("Flank length", 6, 1, 20, 1, true);
        let flankAngle = controls.value("Flank angle", 30, 5, 85, 1, true); // degrees from main line

        // Wobble controls
        let wobbleGroup = controls.group("Wobble", true, true, true, true);
        let wobbleAmplitude = controls.value("Wobble amplitude (px)", 2, 0, 50, 1, true);
        let wobbleSpeed = controls.value("Wobble speed (Hz)", 1, 0.1, 10, 0.1, true);

        // Calculate animated tip position if wobble is enabled
        await scheduler.interval(1, (frameNr)=>{
            box.clear()
            let animatedTipX = tipX.value;
            let animatedTipY = tipY.value;
            let theta = angle.value * Math.PI / 180;
            if (wobbleGroup.enabled && wobbleAmplitude.value > 0 && wobbleSpeed.value > 0) {
                // Time in seconds
                let t = frameNr/60;
                let offset = Math.sin(2 * Math.PI * wobbleSpeed.value * t) * wobbleAmplitude.value;
                // Move tip along the arrow's direction
                animatedTipX = Math.round(tipX.value + Math.cos(theta) * offset);
                animatedTipY = Math.round(tipY.value + Math.sin(theta) * offset);
            }

            // Convert flank angles to radians
            let flankTheta1 = (angle.value + flankAngle.value) * Math.PI / 180;
            let flankTheta2 = (angle.value - flankAngle.value) * Math.PI / 180;

            // Calculate base of arrow (start of main line)
            let baseX = Math.round(animatedTipX - Math.cos(theta) * arrowLength.value);
            let baseY = Math.round(animatedTipY - Math.sin(theta) * arrowLength.value);

            // Calculate flank endpoints
            let flank1X = Math.round(animatedTipX - Math.cos(flankTheta1) * flankLength.value);
            let flank1Y = Math.round(animatedTipY - Math.sin(flankTheta1) * flankLength.value);
            let flank2X = Math.round(animatedTipX - Math.cos(flankTheta2) * flankLength.value);
            let flank2Y = Math.round(animatedTipY - Math.sin(flankTheta2) * flankLength.value);

            // Draw main arrow line (from tip to base)
            let mainLine = new DrawLine(animatedTipX, animatedTipY, baseX, baseY, colorControl);
            box.add(mainLine);
            // Draw flanks (from tip to each flank endpoint)
            let flank1 = new DrawLine(animatedTipX, animatedTipY, flank1X, flank1Y, colorControl);
            box.add(flank1);
            let flank2 = new DrawLine(animatedTipX, animatedTipY, flank2X, flank2Y, colorControl);
            box.add(flank2);

            //stop animating if wobble is disabled
            if (!wobbleGroup.enabled)
                return false
        })
    }
}
