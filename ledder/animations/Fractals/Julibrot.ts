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
import {fontSelect} from "../../fonts.js"
import ControlSelect from "../../ControlSelect.js"
import DrawText from "../../draw/DrawText.js"
import Color from "../../Color.js"





export default class <Julibrot> extends Animator {
    static category = "Fractals"
    static title = "Mandelbrot"
    static description = "Mandelbrot fractal"
    max_iterations=900
    
   
    mandelbrot(c,px:number,py:number,width:number,height:number,zoom:number) {

        let REAL_SET = { start:c.cx-zoom , end:c.cx+zoom }
        let IMAGINARY_SET = { start: c.cy-zoom, end: c.cy+zoom }

        let complex = {
            x: REAL_SET.start + (px / width) * (REAL_SET.end - REAL_SET.start),
            y: IMAGINARY_SET.start + (py /height) * (IMAGINARY_SET.end - IMAGINARY_SET.start)
        }

        let z = { x: 0, y: 0 }, n=0, p, d;
        do {
            p = {
                x: Math.pow(z.x, 2) - Math.pow(z.y, 2),
                y: 2 * z.x * z.y
            };
            z = {
                x: p.x + complex.x,
                y: p.y + complex.y
            };
            d = Math.sqrt(Math.pow(z.x, 2) + Math.pow(z.y, 2));
            n += 1;
        } while (d <= 2 && n < this.max_iterations);
        return n
    }


    julia(c,px:number,py:number,width:number,height:number,zoom:number)
    {
        //calculate the initial real and imaginary part of z, based on the pixel location and zoom and position values
         let newRe = 1.5 * (px - width / 2) / (0.5 * zoom * width) ;
         let newIm = (py - height / 2) / (0.5 * zoom * height);
         let oldRe=0;
         let oldIm=0
         //i will represent the number of iterations
         let n=0
         //start the iteration process
         do
         {
             //remember value of previous iteration
             oldRe = newRe;
             oldIm = newIm;
             //the actual iteration, the real and imaginary part are calculated
             newRe = oldRe * oldRe - oldIm * oldIm + c.cx
             newIm = 2 * oldRe * oldIm + c.cy
             //if the point is outside the circle with radius 2: stop
             if((newRe * newRe + newIm * newIm) > 4) break;
             n++
         } while (n<this.max_iterations)
         return n
    }

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
   
        const colors = patternSelect(controls, 'Color Palette', 'DimmedReinbow')
        const alphaControls =controls.value("alpha/brightness",0.7,0.1,1,0.1)
        const colorSteepnessControls =controls.value("Color change",1,1,32,1)
        const fractalIntervalControl = controls.value("Fractal interval", 1, 1, 10, 0.1)
        const zoomSpeedControl = controls.value("Zoom speed", 0.01, 0.0001, 0.1, 0.0001)
        const bounceControl = controls.switch("Bounce",false,false)
        const colorControl = controls.color("Text color", 0, 255, 0)
        let choices=[]
        choices.push({id:1, name:"Mandelbrot"})
        choices.push({id:2, name:"Julia"})
        //choices[1]={id:1, name:"Mandelbrot"}
        //choices[2]={id:2, name:"Julia"}
        const fractalTypeControl = controls.select("Fractal type","Mandelbrot",choices,false)
        let counter=0; //palettecycle var
        box.clear();
        let zoom=0.01;
        let zoomfactor=1-zoomSpeedControl.value
        let hotspotSel=0
        let zoomMax=5
        let hotspots=[
            { cx:-0.15554376019751, cy:-0.65010365004009,   maxz:8},
            { cx:0.24679672392427,  cy:0.50342253979013, maxz:9},
            { cx:-1.1785276064604,  cy:0.30096231141302,    maxz:8},
            { cx:0.13614939178535,  cy:-0.66905589958398,   maxz:9},
            { cx:0.081159563329829, cy:-0.62558306990165,   maxz:7},
            { cx:0.25347098330532,  cy:-0.00032872330789825,maxz:9},
            { cx:-1.0658884716107,  cy:-0.25431284056064,   maxz:9},
            { cx:-1.0657340413104,  cy:-0.25412076186408,   maxz:9},
            { cx:-1.1780691868827,  cy:0.30014031883977,    maxz:14}
        ]
       
   
       

     
        scheduler.intervalControlled(fractalIntervalControl, (frameNr) => {
            let hotspot=hotspots[hotspotSel]
            counter=counter+1
            zoom=zoom*zoomfactor; 
            zoomMax=Math.pow(10,hotspot.maxz)
           
            if (bounceControl.enabled)
            {
                if (zoom<0.01) { zoomfactor=1+zoomSpeedControl.value; hotspotSel=hotspotSel+1;} //zoom in
                if (zoom>zoomMax) { zoomfactor=1-zoomSpeedControl.value;  } //zoom out
                if (hotspotSel>=hotspots.length) {hotspotSel=0; }
            }
            else
            {
                if (zoom<1) {  hotspotSel=hotspotSel+1; zoom=zoomMax ; zoomfactor=1-zoomSpeedControl.value;} //zoom in
                if (zoom>zoomMax) { zoomfactor=1-zoomSpeedControl.value; } //zoom out
                if (hotspotSel>=hotspots.length) {hotspotSel=0; }
            }

             let text = new DrawText(0, 0, fontSelect(controls), "F:"+hotspotSel.toString()+" Z:"+Math.sqrt(zoom).toFixed(0).toString(), colorControl)

            box.clear();
            let colorIndex=0;
            
            for (let x = 0;  x< box.width(); x++) {
                for (let y = 0; y < box.height(); y++) {
                   
                    if (fractalTypeControl.selected=="Mandelbrot" || fractalTypeControl.selected=="1")
                    { 
                            colorIndex = this.mandelbrot(hotspot,x,y,box.width(),box.height(),1/zoom);
                    }

                    if (fractalTypeControl.selected=="Julia" || fractalTypeControl.selected=="2")
                    {
                            colorIndex = this.julia(hotspot,x,y,box.width(),box.height(),zoom);
                    }

    
                    let mp=parseInt(colorIndex.toString())
                    let colornum=+(mp*colorSteepnessControls.value) % (colors.length-1)
                    let color= colors[colornum];
                    let pixel = new Pixel(x,y,color);
                    if (pixel.color.a)
                    {
                        try
                        {
                            pixel.color.a=alphaControls.value
                        }
                        catch (e)
                        {

                        }
                    }
                    box.add(pixel);

                }
            }
          
        })
    }
}
