import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelSet from "../../PixelSet.js"
import DrawAsciiArt from "../../draw/DrawAsciiArt.js"
import FxMovie from "../../fx/FxMovie.js"
import FxRotate from "../../fx/FxRotate.js"
import Animation from "../../Animation.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"


export default class Pacman extends Animation {
    static category = "Misc"
    static title = "Pacman"
    static description = "blabla"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, x = 0, y = 0) {


        const frames = new PixelSet()
        frames.add(new DrawAsciiArtColor(x, y, `
        00yyyy0.
        0yyyyyy.
        yyyyyyyy
        yyyyyyyy
        yyyyyyyy
        yyyyyyyy
        0yyyyyy.
        00yyyy0.
        `))
        frames.add(new DrawAsciiArtColor(x, y, `
        00yyyy00
        0yyyyyy.
        yyyyyyyy
        yyyy....
        yyy.....
        yyyy....
        0yyyyyy.
        00yyyy0.
        `))
        frames.add(new DrawAsciiArtColor(x, y, `
        00yyyy0.
        0yyyyyy.
        yyyyy...
        yyyy....
        yyy.....
        yyyy....
        0yyyy...
        00yyyy..
        `))
        frames.add(new DrawAsciiArtColor(x, y, `
        00yyyy0.
        0yyyyyy.
        yyyyy...
        yyyy....
        yyy.....
        yyyy....
        0yyyy...
        00yyyy..
        `))
        frames.add(new DrawAsciiArtColor(x, y, `
        00yyyy0.
        0yyyyyy.
        yyyyyyyy
        yyyy....
        yyy.....
        yyyy....
        0yyyyyy.
        00yyyy0.
        `))
        // frames.add(new DrawAsciiArt(3,display.height, colorGreen,`
        // ...yy...
        // .yyyyyy.
        // .yyyyyy.
        // yyyy....
        // yyyyy...
        // .yyyyyy.
        // .yyyyyy.
        // ...yy...
        // `))
        //
        // frames.add(new DrawAsciiArt(3,display.height-1, colorGreen,`
        // ..y.yyy..
        // .yy.yyyy
        // `))

        frames.centerV(box)

        let pacmanBox=new PixelBox(box)
        box.add(pacmanBox)

        new FxMovie(scheduler, controls, 4, 0).run(frames, pacmanBox)

        new FxRotate(scheduler, controls, 1).run(frames, pacmanBox)


    }
}
