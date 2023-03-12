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
    max_iterations=128
   
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

        const fractalColorCycle = controls.switch("Colorcycle", false, true);
        const fractalZoom = controls.switch("Fly around", true, true);
        const fractalRealRange = controls.range("REAL range (x)", -2,1, -2,1,0.001)   
        const fractalImaginaryRange = controls.range("IMAGINARY range (y)", -1, 1, -1, 1,0.001)  
         const colors = patternSelect(controls, 'Color Palette', 'Brainsmoke fire')
        const fractalintervalControl = controls.value("Fractal interval", 1, 1, 10, 0.1)
        let counter=0; //palettecycle var
        box.clear();
        let zoomx=1;
        let zoomy=1;
        let hotspotSel=0
     
        scheduler.intervalControlled(fractalintervalControl, (frameNr) => {
           
            let REAL_SET = { start: fractalRealRange.from, end: fractalRealRange.to }
            let IMAGINARY_SET = { start: fractalImaginaryRange.from, end: fractalImaginaryRange.to}
            let paletteOffset=0 //palettecycle
            counter=frameNr
            zoomx=zoomx*0.99; 
            zoomy=zoomy*0.99;
            if (zoomx<0.00001) { zoomx=1; zoomy=1; hotspotSel=hotspotSel+1;}
            if (hotspotSel>3) {hotspotSel=0; zoomx=1; zoomy=1;}

           
            //read settings
            this.max_iterations=100+(1/zoomx) 
            if (fractalColorCycle.enabled){ paletteOffset=counter; }
            if (fractalZoom.enabled)
            {

                //hotspotSel=counter%4
                if (hotspotSel==0)
                {
                    REAL_SET = { start: -0.545-zoomx , end:-0.545+zoomx }
                    IMAGINARY_SET = { start: -0.6100-zoomy, end: -0.6100+zoomy }
                }

              
                if (hotspotSel==1)
                {
                    REAL_SET = { start: -1.260-zoomx , end:-1.260+zoomx }
                    IMAGINARY_SET = { start: -0.380-zoomy, end: -0.380+zoomy }
                    //REAL_SET = { start: -0.525-zoomx , end:-0.525+zoomx }
                   // IMAGINARY_SET = { start: -0.6260-zoomy, end: -0.6260+zoomy }
                }


                if (hotspotSel==2)
                {
                    REAL_SET = { start: -0.545-zoomx , end:-0.545+zoomx }
                    IMAGINARY_SET = { start: 0.6150-zoomy, end: 0.6150+zoomy }
                    //REAL_SET = { start: -0.525-zoomx , end:-0.525+zoomx }
                   // IMAGINARY_SET = { start: -0.6260-zoomy, end: -0.6260+zoomy }
                }

                if (hotspotSel==3)
                {
                    REAL_SET = { start: -0.980-zoomx , end:-0.980+zoomx }
                    IMAGINARY_SET = { start: -0.278-zoomy, end: -0.278+zoomy }
                    //REAL_SET = { start: -0.525-zoomx , end:-0.525+zoomx }
                   // IMAGINARY_SET = { start: -0.6260-zoomy, end: -0.6260+zoomy }
                }

            }
          
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
                        let color= colors[(+m+paletteOffset) % (colors.length-1)];
                        let pixel = new Pixel(x,y,color);
                        box.add(pixel);
                    }
                   
                }
            }

        })
    }
}
