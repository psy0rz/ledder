import { MatrixCanvas } from "./MatrixCanvas.js";
import { AnimationTest } from "./AnimationTest.js";
import { Scheduler } from "./Scheduler.js";
let scheduler = new Scheduler();
let matrix = new MatrixCanvas(scheduler, 37, 8, '#matrix', 5, 16);
new AnimationTest(matrix);
matrix.run();
//# sourceMappingURL=main.js.map