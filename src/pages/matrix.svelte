<canvas class="ledder-matrix" id="ledder-preview"></canvas>

<script>
import {Page} from "framework7-svelte";
import {Scheduler} from "../js/led/Scheduler.js";
import {MatrixCanvas} from "../js/led/MatrixCanvas.js";
import {tick} from "svelte";
import { onMount } from 'svelte';
import {RunnerBrowser} from "../js/RunnerBrowser.js";

import {sveltePresets, svelteAnimationName} from "../js/svelteStore.js"

onMount(async ()=>{
    let scheduler = new Scheduler();
    let matrix = new MatrixCanvas(scheduler, 60, 8, '#ledder-preview');
    matrix.run();
    let runnerBrowser = new RunnerBrowser(matrix);
    matrix.preset.enableHtml()

    svelteAnimationName.subscribe(animationName=>{
        console.log("update", animationName)
        runnerBrowser.run(animationName, "")

    })


})



</script>
