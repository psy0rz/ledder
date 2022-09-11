    <canvas class="ledder-display ledder-display-box" id='ledder-display' ></canvas>

    <svg xmlns="http://www.w3.org/2000/svg" class='ledder-display-box' id='ledder-grid'>
        <defs>
            <pattern id="ledder-grid-pattern" width="{zoom}" height="{zoom}" patternUnits="userSpaceOnUse">
            <path d="M {zoom} 0 L 0 0 0 {zoom}" fill="none" stroke="black" stroke-width="1"/>
            </pattern>
        </defs>
            
        <rect width="100%" height="100%" fill="url(#ledder-grid-pattern)" />
    </svg>

    <div class='ledder-display-box' style='color: white; text-align:right'>
        {width} x {height}
    </div>

<script>
    import {onMount} from 'svelte';
    import {runnerBrowser} from "../js/web/RunnerBrowser.js";

    import {f7ready} from "framework7-svelte";


    let zoom=8;
    let width=75;
    let height=8;

    onMount(async () => {
        f7ready(async () => {
            await runnerBrowser.init()
            await runnerBrowser.setSize(width, height, zoom)
        })
    })
</script>
