import {MatrixCanvas} from "./MatrixCanvas.js";
import {AnimationTest} from "./AnimationTest.js";


let matrix=new MatrixCanvas(37,8, '#matrix', 5, 16);

matrix.addAnimation(new AnimationTest());

matrix.run();







