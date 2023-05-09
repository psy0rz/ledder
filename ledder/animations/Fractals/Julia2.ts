/**
 *  Julia fractal 
 *  Author: Rein Velt (rein@velt.org)
 *  Version: 2.0
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
import DrawText from "../../draw/DrawText.js"
import {fonts, fontSelect} from "../../fonts.js"

export default class <Julia> extends Animator {
    static category = "Fractals"
    static title = "Julia2"
    static description = "Julia2 fractal"
    max_iterations=2000


    
   
   
    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        box.clear()
        const colors = patternSelect(controls, 'Color Palette', 'DimmedReinbow')
        const fractalintervalControl = controls.value("Fractal interval", 1, 1, 10, 0.1)
        const maxiterationControl = controls.value("max iterations", 100, 10, 2000, 100)
        const minZoomControl=controls.value("zoom min",0.01,0.01,0.1,0.1)
        const maxZoomControl=controls.value("zoom max",5,1,8,0.1)
        const zoomSpeedControl=controls.value("zoomspeed",0.005,0.001,1,0.01)
        const invertColorControl=controls.switch("invert color palette",false,false)
        let minZoom=minZoomControl.value
        let maxZoom=maxZoomControl.value
        let zoomfactor=1+zoomSpeedControl.value
        let counter=0 //palettecycle var
        let zoom=minZoomControl.value
       
       
        let hotspotSel=0
        let moveX=0
        let moveY=0
        let hotspots=[
            {cx:-0.15554376019751, cy:-0.65010365004009, maxz:8.76},
            {cx:-1.1785276064604, cy:0.30096231141302,maxz:8.90},
            {cx:0.13614939178535, cy:-0.66905589958398,maxz:10.76},
            { cx:0.081159563329829,      cy:-0.62558306990165, maxz:10.14},
            { cx:0.25347098330532, cy:-0.00032872330789825,maxz:10.64},
            { cx:-1.0658884716107, cy:-0.25431284056064,maxz:10.27},
            { cx:-1.0657340413104, cy:-0.25412076186408,maxz:10}
        ]
     
        scheduler.intervalControlled(fractalintervalControl, (frameNr) => {
            let hotspot=hotspots[hotspotSel]
            let REAL_SET = hotspot.cx
            let IMAGINARY_SET = hotspot.cy
            let cRe=0
            let cIm=0
            let newRe=0 
            let newIm=0
            let oldRe=0 
            let oldIm=0
           
            counter=counter+1
            zoom=zoom*zoomfactor; 
     
            maxZoom=Math.min(Math.pow(10,maxZoomControl.value),Math.pow(10,hotspot.maxz))
            if (zoom<minZoom && zoomfactor<1) { zoom=minZoom; zoomfactor=1+zoomSpeedControl.value ; hotspotSel++} //zoomed out-> zoom in
            if (zoom>maxZoom && zoomfactor>1) { zoom=maxZoom; zoomfactor=1-zoomSpeedControl.value; } //zoomed in -> zoom out
            if (hotspotSel>=hotspots.length)  {hotspotSel=0;}

           
         
           
            cRe = REAL_SET
            cIm = IMAGINARY_SET
          
          
            box.clear();
     
            
            for (let x = 0;  x< box.width(); x++) {
                for (let y = 0; y < box.height(); y++) {
                    this.max_iterations=maxiterationControl.value
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
                        colornum=colors.length-(+(i*11) % (colors.length-1))
                    }
                    else
                    {
                        colornum=(+(i*11) % (colors.length-1))
                    }
                    let color= colors[colornum]
                    if (i<this.max_iterations && color.a!=undefined)
                    {
                
                        
                        let pixel = new Pixel(x,y,color);
                        box.add(pixel)
                    } 
                  
                }
            }
            //box.add(new DrawText(0, 0, fontSelect(controls),zoom.toString(), new Color(255,255,255,0.5)))
        

        })
    }
}
