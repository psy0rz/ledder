<canvas class="ledder-matrix" id="ledder-preview"></canvas>
<script>
    import {Scheduler} from "../js/ledder/Scheduler.js";
    import {MatrixCanvas} from "../js/web/MatrixCanvas.js";
    import {onMount} from 'svelte';
    import {runnerBrowser} from "../js/web/RunnerBrowser.js";

    import {svelteLive, sveltePresets, svelteSelectedTitle} from "../js/web/svelteStore.js"
    import {rpc} from "../js/web/RpcClient.js";
    import {f7ready} from "framework7-svelte";



    onMount(async () => {
        f7ready(async () => {
            await runnerBrowser.init()
        })
    })
</script>
