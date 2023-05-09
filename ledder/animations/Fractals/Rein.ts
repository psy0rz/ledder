/**
 *  Mandelbrot fractal 
 *  Author: Rein Velt (rein@velt.org)
 *  Version: 1.0
 * 
 *  This script shows a basic mandelbrot fractal with configurable parameters
 * 
 */
import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import {patternSelect} from "../../ColorPatterns.js"
import ControlGroup from "../../ControlGroup.js"
import Pixel from "../../Pixel.js"
import Animator from "../../Animator.js"

export default class <Rein> extends Animator {
    static category = "Fractals"
    static title = "Mandelbrot"
    static description = "Mandelbrot fractal"
    max_iterations=500
   
    mandelbrot(c) {
        let z = { x: 0, y: 0 }, n=0, p, d;
        do {
            p = {
                x: Math.pow(z.x, 2) - Math.pow(z.y, 2),
                y: 2 * z.x * z.y
            };
            z = {
                x: p.x + c.x,
                y: p.y + c.y
            };
            d = Math.sqrt(Math.pow(z.x, 2) + Math.pow(z.y, 2));
            n += 1;
        } while (d <= 2 && n < this.max_iterations);
        return [n, d <= 2];
    }

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
   
        const colors = patternSelect(controls, 'Color Palette', 'DimmedReinbow')
        const fractalintervalControl = controls.value("Fractal interval", 1, 1, 10, 0.1)
        let counter=0; //palettecycle var
        box.clear();
        let zoomx=1;
        let zoomy=1;
        let zoomfactor=0.99
        let hotspotSel=0
        let zoomMax=5
        let hotspots=[
            {cx:-0.15554376019751, cy:-0.65010365004009, maxz:8.76},
            {cx:0.13614939178535, cy:-0.66905589958398,maxz:13.76},
            { cx:0.081159563329829,      cy:-0.62558306990165, maxz:11.14},
            { cx:0.25347098330532, cy:-0.00032872330789825,maxz:10.64},
            { cx:-1.0658884716107, cy:-0.25431284056064,maxz:13.27},
            { cx:-1.0657340413104, cy:-0.25412076186408,maxz:15}
        ]
     
        scheduler.intervalControlled(fractalintervalControl, (frameNr) => {
           
            counter=counter+1
            zoomx=zoomx*zoomfactor; 
            zoomy=zoomy*zoomfactor;
            if (zoomx<0.000000001) { zoomfactor=1.01; } //zoom in
            if (zoomx>zoomMax) { zoomfactor=0.99;  hotspotSel=hotspotSel+1;} //zoom out
            if (hotspotSel>=hotspots.length) {hotspotSel=0; zoomx=1; zoomy=1;}

            //read settings
            this.max_iterations=1000; 
           
            //hotspotSel=counter%4
            let hotspot=hotspots[hotspotSel]
            zoomMax=Math.pow(10,hotspot.maxz)
            let REAL_SET = { start:hotspot.cx-zoomx , end:hotspot.cx+zoomx }
            let IMAGINARY_SET = { start: hotspot.cy-zoomy, end: hotspot.cy+zoomy }
            
          
            //calculate all visible pixel positions
            box.clear();
            
            for (let x = 0;  x< box.width(); x++) {
                for (let y = 0; y < box.height(); y++) {
                    let complex = {
                        x: REAL_SET.start + (x / box.width()) * (REAL_SET.end - REAL_SET.start),
                        y: IMAGINARY_SET.start + (y / box.height()) * (IMAGINARY_SET.end - IMAGINARY_SET.start)
                    }
                    const [m, isMandelbrotSet] = this.mandelbrot(complex);
                    if (m!=false)
                    {
                        let colornum=+m % (colors.length-1)
                        let color= colors[colornum];
                        
                         let pixel = new Pixel(x,y,color);
                          box.add(pixel);
                        
                    }
                   
                }
            }

        })
    }
}
