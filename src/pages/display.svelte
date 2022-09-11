<canvas class="ledder-display ledder-preview-box" id='ledder-preview'></canvas>

<svg width="50%" height="50%" xmlns="http://www.w3.org/2000/svg" class='ledder-preview-box'>
  <defs>
    <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
      <path d="M 8 0 L 0 0 0 8" fill="none" stroke="black" stroke-width="1"/>
    </pattern>
  </defs>
      
  <!-- <rect width="100%" height="100%" fill="url(#grid)" /> -->
</svg>

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
