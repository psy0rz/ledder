<canvas class="ledder-matrix" id="ledder-preview"></canvas>

<script>
import {Scheduler} from "../js/led/Scheduler.js";
import {MatrixCanvas} from "../js/led/MatrixCanvas.js";
import {tick} from "svelte";
import { onMount } from 'svelte';
import {RunnerBrowser} from "../js/RunnerBrowser.js";

import {svelteSelected, sveltePresets} from "../js/svelteStore.js"
import { f7 } from 'framework7-svelte';

onMount(async ()=>{
    console.log(app)
    let scheduler = new Scheduler();
    let matrix = new MatrixCanvas(scheduler, 60, 8, '#ledder-preview');
    matrix.run();
    let runnerBrowser = new RunnerBrowser(matrix);
    matrix.preset.enableHtml()

    svelteSelected.subscribe(async selected=>{

        try
        {
            await runnerBrowser.run(selected.animationName, selected.presetName)
        }
        catch (e)
        {
            console.error(e)
            f7.dialog.alert(
                `${selected.animationName}, ${selected.presetName}:<br>${e.toString()}`,
                `Error while loading animation`,
            )
        }
    })


})



</script>
