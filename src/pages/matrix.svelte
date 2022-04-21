<canvas class="ledder-matrix" id="ledder-preview"></canvas>
<script>
import {Scheduler} from "../js/ledder/Scheduler.js";
import {MatrixCanvas} from "../js/web/MatrixCanvas.js";
import { onMount } from 'svelte';
import {runnerBrowser} from "../js/web/RunnerBrowser.js";

import {svelteLive, sveltePresets, svelteSelectedTitle} from "../js/web/svelteStore.js"
import {rpc} from "../js/web/RpcClient.js";


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
