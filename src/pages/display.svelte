<canvas class="ledder-display" id="ledder-preview"></canvas>
<script>
    import {onMount} from 'svelte';
    import {runnerBrowser} from "../js/web/RunnerBrowser.js";

    import {f7ready} from "framework7-svelte";



    onMount(async () => {
        f7ready(async () => {
            await runnerBrowser.init()
        })
    })
</script>
