<script>
    import {onMount} from "svelte"
    import {runnerBrowser} from "../js/web/RunnerBrowser.js"

    import {f7ready} from "framework7-svelte"
    import {svelteDisplayHeight, svelteDisplayWidth, svelteDisplayZoom} from "@/js/web/svelteStore.js"

    // below this viewport width the preview would cover most of the page, so we don't zoom at all
    const smallScreenMaxWidth = 600

    let autoZoomEnabled = true

    //zoom the preview to a reasoanble level for the screensize
    function autoZoom() {

        if (!autoZoomEnabled) {
            svelteDisplayZoom.set(2)
            return
        }

        if (window.innerWidth < smallScreenMaxWidth) {
            svelteDisplayZoom.set(1)
            return
        }

        // const canvas = document.querySelector(".ledder-display")
        let fittedZoom = ~~((window.innerWidth / 2) / $svelteDisplayWidth)

        if (fittedZoom < 4)
            fittedZoom = 4

        if (fittedZoom > 8)
            fittedZoom = 8

        svelteDisplayZoom.set(fittedZoom)
    }

    function toggleAutoZoom() {
        autoZoomEnabled = !autoZoomEnabled
        autoZoom()
    }

    window.addEventListener('resize', function (event) {
        autoZoom()
    })

    onMount(async () => {
        f7ready(async () => {
            await runnerBrowser.init()


        })
    })


    $:{
        autoZoom()
        for (let box of document.querySelectorAll(".ledder-display-box")) {

            box.style.width = ($svelteDisplayWidth * $svelteDisplayZoom) + 'px'
            box.style.height = ($svelteDisplayHeight * $svelteDisplayZoom) + 'px'

        }

    }


</script>


<!-- display canvas, and grid overlay -->
<canvas class="ledder-display ledder-display-box" id="ledder-display"/>

<svg
        xmlns="http://www.w3.org/2000/svg"
        class="ledder-display-box"
        id="ledder-grid"
>
    <defs>
        <pattern
                id="ledder-grid-pattern"
                width={$svelteDisplayZoom}
                height={$svelteDisplayZoom}
                patternUnits="userSpaceOnUse"
        >
            <path
                    d="M {$svelteDisplayZoom} 0 L 0 0 0 {$svelteDisplayZoom}"
                    fill="none"
                    stroke="black"
                    stroke-width="1"
            />
        </pattern>
    </defs>

    {#if $svelteDisplayZoom >= 4}
        <rect width="100%" height="100%" fill="url(#ledder-grid-pattern)"/>
    {/if}
</svg>

<div class="ledder-display-box" style="color: white; text-align:right;  " on:click={toggleAutoZoom}>
    {#if $svelteDisplayWidth * $svelteDisplayZoom >= 100}
        {$svelteDisplayWidth} x {$svelteDisplayHeight}
    {/if}
</div>

