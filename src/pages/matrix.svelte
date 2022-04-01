<canvas class="ledder-matrix" id="ledder-preview"></canvas>
<script>
import {Scheduler} from "../js/led/Scheduler.js";
import {MatrixCanvas} from "../js/led/MatrixCanvas.js";
import {tick} from "svelte";
import { onMount } from 'svelte';
import {runnerBrowser} from "../js/RunnerBrowser.js";

import {svelteLive, sveltePresets, svelteSelectedTitle} from "../js/svelteStore.js"
import {f7, Page} from 'framework7-svelte';
import {rpc} from "../js/RpcClient.js";


onMount(async ()=> {
    let scheduler = new Scheduler();
    let matrix = new MatrixCanvas(scheduler, 75, 8, '#ledder-preview');
    matrix.run();
    runnerBrowser.init(matrix)

    matrix.preset.enableHtml( (controlName, controlValues)=>{
        if ($svelteLive) {
            rpc.notify("matrix.preset.updateValue", controlName, controlValues)
        }
    })
})
</script>
