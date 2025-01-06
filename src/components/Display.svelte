<script>
    import {onMount} from "svelte"
    import {runnerBrowser} from "../js/web/RunnerBrowser.js"

    import {f7ready} from "framework7-svelte"
    import {displayHeight, displayWidth, displayZoom} from "@/js/web/svelteStore.js"

    let zoom = true

    //zoom the preview to a reasoanble level for the screensize
    function autoZoom() {

        if (zoom) {
            displayZoom.set(2)
        } else {


            const canvas = document.querySelector(".ledder-display")
            let autozoom = ~~((window.innerWidth / 2) / canvas.width)

            if (autozoom < 4)
                autozoom = 4

            if (autozoom > 8)
                autozoom = 8

            displayZoom.set(autozoom)
        }
    }

    function toggleZoom() {
        if (zoom) {
            zoom = false
        } else {
            zoom = true
        }
        autoZoom()
    }

    window.addEventListener('resize', function(event) {
        autoZoom()
    })

    onMount(async () => {
        f7ready(async () => {
            await runnerBrowser.init()
            await runnerBrowser.startPreview()

            displayZoom.subscribe((zoom) => {

                const boxes = document.querySelectorAll(".ledder-display-box")
                const canvas = document.querySelector(".ledder-display")
                for (const box of boxes) {


                    box.style.width = (canvas.width * zoom) + 'px'
                    box.style.height = (canvas.height * zoom) + 'px'
                }
            })

            toggleZoom()
        })
    })
</script>


<canvas class="ledder-display ledder-display-box" id="ledder-display"/>

<svg
        xmlns="http://www.w3.org/2000/svg"
        class="ledder-display-box"
        id="ledder-grid"
>
    <defs>
        <pattern
                id="ledder-grid-pattern"
                width={$displayZoom}
                height={$displayZoom}
                patternUnits="userSpaceOnUse"
        >
            <path
                    d="M {$displayZoom} 0 L 0 0 0 {$displayZoom}"
                    fill="none"
                    stroke="black"
                    stroke-width="1"
            />
        </pattern>
    </defs>

    {#if $displayZoom >= 4}
        <rect width="100%" height="100%" fill="url(#ledder-grid-pattern)"/>
    {/if}
</svg>

<div class="ledder-display-box" style="color: white; text-align:right; " on:click={toggleZoom}>
    {$displayWidth} x {$displayHeight}
</div>

