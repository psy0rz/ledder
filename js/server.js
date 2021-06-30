
import {MatrixWLED} from "./MatrixWLED.js";
import {AnimationTest} from "./AnimationTest.js";


let matrix=new MatrixWLED(37,8, '192.168.13.176');

matrix.addAnimation(new AnimationTest());

matrix.run();







