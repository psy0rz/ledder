
import {MatrixWLED} from "./MatrixWLED.js";
import {Scheduler} from "./Scheduler.js";
import express from "express";
import Bundler from "parcel-bundler";

let bundler = new Bundler('index.html');


const app = express()
const port = 3000

app.use(bundler.middleware());
app.use(express.static("dist"));

app.get('/geert', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


let scheduler = new Scheduler();
let matrix=new MatrixWLED(scheduler, 37,8, false, false, '192.168.13.176');

import("./AnimationTest.js")
  .then((module) => {
    console.log(module);
    new module.AnimationTest(matrix);
    matrix.run();
  });

// import {AnimationTest} from "./AnimationTest.js";
// new AnimationTest(matrix);
// matrix.run();







