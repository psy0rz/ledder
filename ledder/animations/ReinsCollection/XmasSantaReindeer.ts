import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import FxMovie from "../../fx/FxMovie.js"
import Animator from "../../Animator.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"
import FxRotate from "../../fx/FxRotate.js"

export default class XmasSantaReindeer extends Animator {
    static category = "Misc"
    static title = "XmasSantaReindeer"
    static description = "xmas theme, santa + sled + reindeers"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, x =0, y =  box.height()-13, reindeers=1) {


        const santaSled = new PixelList()
        santaSled.add(new DrawAsciiArtColor(x, y, `
       .wr................
       ..rrr..............
       ...rrrr............
       ...rwbw............
       ...rwwww...........
       ....ww5............
       ...rrrrrrrw........
       yy.rrrrw...........
       ryyrrrrrr..rr..5...
       rrrrrrrrrrrr...5...
       ..5.......5...5....
       55555555555555.....
        `))

        santaSled.add(new DrawAsciiArtColor(x, y, `
        .rr................
        .wrrr..............
        ...rrrr............
        ...rwbw............
        ...rwwww...........
        ....ww5............
        ...rrrrrrrw........
        yy.rrrrw...........
        ryyrrrrrr..rr..5...
        rrrrrrrrrrrr...5...
        ..5.......5...5....
        55555555555555.....
         `))

         santaSled.add(new DrawAsciiArtColor(x, y, `
         .wr................
         ..rrr..............
         ...rrrr............
         ...rwbw............
         ...rwwww..w........
         ....ww5..r.........
         ...rrrrrr..........
         yy.rrrrw...........
         ryyrrrrrr..rr..5...
         rrrrrrrrrrrr...5...
         ..5.......5...5....
         55555555555555.....
          `))

          santaSled.add(new DrawAsciiArtColor(x, y, `
        .rr................
        .wrrr..............
        ...rrrr............
        ...rwbw............
        ...rwwww...........
        ....ww5............
        ...rrrrrrrw........
        yy.rrrrw...........
        ryyrrrrrr..rr..5...
        rrrrrrrrrrrr...5...
        ..5.......5...5....
        55555555555555.....
         `))

         santaSled.add(new DrawAsciiArtColor(x, y, `
         .wr................
         ..rrr..............
         ...rrrr............
         ...rwbw............
         ...rwwww...........
         ....ww5............
         ...rrrrrrrw........
         yy.rrrrw...........
         ryyrrrrrr..rr..5...
         rrrrrrrrrrrr...5...
         ..5.......5...5....
         55555555555555.....
          `))

        const nodeer = new PixelList()
        nodeer.add(new DrawAsciiArtColor(x+16, y, `.y.`))
        nodeer.add(new DrawAsciiArtColor(x+16, y, `.w.`))
        nodeer.add(new DrawAsciiArtColor(x+16, y, `.c.`))
        nodeer.add(new DrawAsciiArtColor(x+16, y, `.b.`))
        nodeer.add(new DrawAsciiArtColor(x+16, y, `.y.`))

        const reindeer = new PixelList()
        if (reindeers>0)
        {
            reindeer.add(new DrawAsciiArtColor(x+16, y, `
            ...................
            ..........55.......
            ..........5........      
            ...........55......
            ............5......
            .............mb....
            .............mmmr..
            ...m........mm.....
            ..wwmmmmmmmmmm.....
            ...mmmmmmmmmmmm....
            ..m.m........m.m...
            .m.m..........m.m..
            .m.m...........m.m.
            `))
        
            reindeer.add(new DrawAsciiArtColor(x+16, y, `
            ...................
            ..........55.......
            ..........5........      
            ...........55......
            ............5......
            .............mb....
            .............mmmr..
            ...m........mm.....
            ..wwmmmmmmmmmm.....
            ...mmmmmmmmmmmm....
            ..m.m........m.m...
            ..m.m........m.m...
            ..m.m.........m.m..
            `))

            reindeer.add(new DrawAsciiArtColor(x+16, y, `
            ...................
            ..........55.......
            ..........5........      
            ...........55......
            ............5......
            .............mb....
            .............mmmr..
            ...m........mm.....
            ..wwmmmmmmmmmm.....
            ...mmmmmmmmmmmm....
            ..m.m.......m.m....
            ..m.m........m.m...
            .m.m........m.m....
            `))

            reindeer.add(new DrawAsciiArtColor(x+16, y, `
            ...................
            ..........55.......
            ..........5........      
            ...........55......
            ............5......
            .............mb....
            .............mmmr..
            ...m........mm.....
            ..wwmmmmmmmmmm.....
            ...mmmmmmmmmmmm....
            ..m.m........mmm...
            ...m.m.......mm....
            ..m.m..............
            `))
        
            reindeer.add(new DrawAsciiArtColor(x+16, y, `
            ...................
            ..........55.......
            ..........5........      
            ...........55......
            ............5......
            .............mb....
            .............mmmr..
            ...m........mm.....
            ..wwmmmmmmmmmm.....
            ...mmmmmmmmmmmm....
            ..m.m........m.m...
            .m.m..........m.m..
            m.m................
            `))
        }
        
        

        let sleeBox=new PixelBox(box)
        let backgroundBox=new PixelBox(box)
        box.add(backgroundBox)
        box.add(sleeBox)

        const sledControls=controls.group('Sled',true)
        const reindeerCount=sledControls.value("Reindeers count",1,0,1,1,false)
        new FxMovie(scheduler, sledControls, 8, 0).run(santaSled,  sleeBox)
        if (reindeerCount.value>0)
        {
            new FxMovie(scheduler, sledControls, 8, 0).run(reindeer,   sleeBox)
        }
        else
        {
            new FxMovie(scheduler, sledControls, 8, 0).run(nodeer,   sleeBox)
        }
      
        new FxRotate(scheduler, sledControls, 1,0, 8).run(sleeBox, box)
    
        
       

    }
}
