/**
 *  Julia fractal 
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
import Color from "../../Color.js"



export default class <Julia> extends Animator {
    static category = "Fractals"
    static title = "Julia"
    static description = "Julia fractal"
    max_iterations=500


    
   
   
    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
       
        const colors = patternSelect(controls, 'Color Palette', 'DimmedReinbow')
        const fractalintervalControl = controls.value("Fractal interval", 1, 1, 10, 0.1)
        const minZoomControl=controls.value("zoom min",0.1,0.001,1.0,0.001)
        const maxZoomControl=controls.value("zoom max",500,100,10000,100)
        const zoomspeedControl=controls.value("zoomspeed",0.0001,0.001,0.1,0.0001)
        const randomMoveControl=controls.switch("random move",false,false)
        const invertColorControl=controls.switch("invert color palette",false,false)
        let minZoom=minZoomControl.value
        let maxZoom=maxZoomControl.value
        let zoomfactor=1-zoomspeedControl.value
        let counter=0 //palettecycle var
        let zoom=minZoomControl.value
       
        
        let hotspotSel=0
        let moveX=0
        let moveY=0
        let hotspots=[
            { cx:-0.7,      cy:0.27015},
            { cx:-0.545000, cy:-0.610000},
           // { cx:-1.226,    cy:-0.380},
            { cx:-0.980000, cy:-0.278000},
            { cx:-0.108000, cy:-0.925000}
        ]
     
        scheduler.intervalControlled(fractalintervalControl, (frameNr) => {
            if (randomMoveControl.enabled)
            {
                moveX=Math.sin(counter/1000)/100
                moveY=Math.cos(counter/1000)/100
            }
            counter=counter+1
            zoom=zoom*zoomfactor; 
            //zoomy=zoomy*zoomfactor;
            if (zoom<minZoom && zoomfactor<1) { zoomfactor=1+zoomspeedControl.value;  hotspotSel=hotspotSel+1;} //zoomed out -> zoom in
            if (zoom>maxZoom && zoomfactor>1) { zoomfactor=1-zoomspeedControl.value; } //zoomed in -> zoom out
            if (hotspotSel>=hotspots.length)  {hotspotSel=0; zoom=minZoom; }

            let hotspot=hotspots[hotspotSel]
            let REAL_SET = hotspot.cx
            let IMAGINARY_SET = hotspot.cy
            let cRe=0
            let cIm=0
            let newRe=0 
            let newIm=0
            let oldRe=0 
            let oldIm=0
         
           
            cRe = REAL_SET
            cIm = IMAGINARY_SET
          
            //calculate all visible pixel positions
            //let pixbuf=box.blend()
            box.clear();
            //box.add(pixbuf)
            
            for (let x = 0;  x< box.width(); x++) {
                for (let y = 0; y < box.height(); y++) {
                   //calculate the initial real and imaginary part of z, based on the pixel location and zoom and position values
                    newRe = 1.5 * (x - box.width() / 2) / (0.5 * zoom * box.width()) + moveX;
                    newIm = (y - box.height() / 2) / (0.5 * zoom * box.height()) + moveY;
                    //i will represent the number of iterations
                    let i=0
                    //start the iteration process
                    for(i = 0; i < this.max_iterations; i++)
                    {
                        //remember value of previous iteration
                        oldRe = newRe;
                        oldIm = newIm;
                        //the actual iteration, the real and imaginary part are calculated
                        newRe = oldRe * oldRe - oldIm * oldIm + cRe
                        newIm = 2 * oldRe * oldIm + cIm
                        //if the point is outside the circle with radius 2: stop
                        if((newRe * newRe + newIm * newIm) > 4) break;
                    }
                    let colornum=0
                    if (invertColorControl.enabled)
                    {
                        colornum=colors.length-1-(+(i-1) % (colors.length-1))
                    }
                    else
                    {
                        colornum=(+i % (colors.length-1))
                    }
                    let color= colors[colornum];
                    if (i<this.max_iterations)
                    {
                        //color.a=0.7
                        let pixel = new Pixel(x,y,color);
                        box.add(pixel)
                    } 
                }
            }

        

        })
    }
}
