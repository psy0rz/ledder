import {Pixel} from "./Pixel.js";
import {Matrix} from "./Matrix.js";
import {MatrixCanvas} from "./MatrixCanvas.js";

let m=new MatrixCanvas(37,8, '#matrix', 5, 16);

m.addPixel(new Pixel(0,0,255,0,0, 1));
m.addPixel(new Pixel(1,1 ,255,0,0, 1));
m.addPixel(new Pixel(2,2,255,0,0, 1));
m.render();

// console.log(l);


