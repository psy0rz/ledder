<script>
    import {Navbar, NavLeft, NavTitle, Page, Button} from "framework7-svelte"
    import {onMount, onDestroy} from "svelte"
    import {rpc} from "../js/web/RpcClient.js"
    import {DisplayCanvas} from "../js/web/DisplayCanvas.js"
    import {runnerBrowser} from "../js/web/RunnerBrowser.js"
    import {confirmPromise} from "../js/web/util.js"
    import {svelteDisplayWidth, svelteDisplayHeight, svelteSelectedTitle, svelteStats} from "../js/web/svelteStore.js"

    const palette = [
        {r: 255, g: 255, b: 255},
        {r: 255, g: 0, b: 0},
        {r: 255, g: 128, b: 0},
        {r: 255, g: 255, b: 0},
        {r: 0, g: 255, b: 0},
        {r: 0, g: 255, b: 128},
        {r: 0, g: 255, b: 255},
        {r: 0, g: 128, b: 255},
        {r: 0, g: 0, b: 255},
        {r: 128, g: 0, b: 255},
        {r: 255, g: 0, b: 255},
        {r: 255, g: 128, b: 128},
    ]

    let selectedColor = palette[1]
    let eraser = false

    let drawArea //wrapper div around the canvas
    let areaWidth = 0
    let areaHeight = 0
    let mounted = false

    //biggest integer cell size that fits the available area
    $: cellSize = ($svelteDisplayWidth && $svelteDisplayHeight && areaWidth && areaHeight) ?
        Math.max(1, Math.floor(Math.min(areaWidth / $svelteDisplayWidth, areaHeight / $svelteDisplayHeight))) : 1
    $: canvasWidth = $svelteDisplayWidth * cellSize
    $: canvasHeight = $svelteDisplayHeight * cellSize

    //take over the frame stream from the top preview canvas while this page is open
    $: if (mounted && $svelteDisplayWidth && $svelteDisplayHeight) {
        rpc.registerDisplay(new DisplayCanvas($svelteDisplayWidth, $svelteDisplayHeight, 1, '#draw-display', '.draw-display-box'))
    }

    onMount(() => {
        mounted = true

    })

    onDestroy(() => {
        //hand the frame stream back to the top preview canvas
        rpc.registerDisplay(new DisplayCanvas($svelteDisplayWidth, $svelteDisplayHeight, 8, '#ledder-display', '.ledder-display-box'))
    })

    let drawing = false
    let lastCell = null

    function cellFromEvent(e) {
        const rect = drawArea.getBoundingClientRect()
        const x = Math.floor((e.clientX - rect.left) / cellSize)
        const y = Math.floor((e.clientY - rect.top) / cellSize)
        if (x < 0 || x >= $svelteDisplayWidth || y < 0 || y >= $svelteDisplayHeight)
            return null
        return {x, y}
    }

    //all cells on the line between two cells, so fast swipes dont leave gaps
    function lineCells(from, to) {
        const cells = []
        const dx = Math.abs(to.x - from.x)
        const dy = Math.abs(to.y - from.y)
        const sx = from.x < to.x ? 1 : -1
        const sy = from.y < to.y ? 1 : -1
        let err = dx - dy
        let x = from.x
        let y = from.y
        while (true) {
            cells.push({x, y})
            if (x === to.x && y === to.y)
                break
            const e2 = 2 * err
            if (e2 > -dy) {
                err -= dy
                x += sx
            }
            if (e2 < dx) {
                err += dx
                y += sy
            }
        }
        return cells
    }

    function sendCells(cells) {
        if (cells.length === 0)
            return
        if (eraser)
            rpc.notify("animationEvent", "erase", {cells})
        else
            rpc.notify("animationEvent", "draw", {cells, color: selectedColor})
    }

    function onPointerDown(e) {
        e.preventDefault()
        drawArea.setPointerCapture(e.pointerId)
        drawing = true
        const cell = cellFromEvent(e)
        if (cell) {
            sendCells([cell])
            lastCell = cell
        }
    }

    function onPointerMove(e) {
        if (!drawing)
            return
        e.preventDefault()
        const cell = cellFromEvent(e)
        if (!cell || (lastCell && cell.x === lastCell.x && cell.y === lastCell.y))
            return
        sendCells(lastCell ? lineCells(lastCell, cell) : [cell])
        lastCell = cell
    }

    function onPointerUp(e) {
        drawing = false
        lastCell = null
    }

    async function onClear() {
        await confirmPromise('Clear', 'Clear the whole drawing?')
        rpc.notify("animationEvent", "clear")
    }

</script>

<Page name="draw">
    <Navbar backLink="Back">
        <NavLeft>
            <Button iconMd="material:menu" panelOpen="left"/>
        </NavLeft>
        <NavTitle title="Draw - {$svelteSelectedTitle}" subtitle="{$svelteStats}"></NavTitle>
    </Navbar>

    <div class="draw-page">
        <div class="draw-canvas-area" bind:clientWidth={areaWidth} bind:clientHeight={areaHeight}>
            <div class="draw-canvas-wrapper"
                 bind:this={drawArea}
                 style="width: {canvasWidth}px; height: {canvasHeight}px;"
                 on:pointerdown={onPointerDown}
                 on:pointermove={onPointerMove}
                 on:pointerup={onPointerUp}
                 on:pointercancel={onPointerUp}
            >
                <canvas id="draw-display" style="width: {canvasWidth}px; height: {canvasHeight}px;"/>

                {#if cellSize >= 4}
                    <svg xmlns="http://www.w3.org/2000/svg" class="draw-grid" width={canvasWidth} height={canvasHeight}>
                        <defs>
                            <pattern id="draw-grid-pattern" width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
                                <path d="M {cellSize} 0 L 0 0 0 {cellSize}" fill="none" stroke="black" stroke-width="1"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#draw-grid-pattern)"/>
                    </svg>
                {/if}
            </div>
        </div>

        <div class="draw-palette">
            {#each palette as color}
                <div class="draw-swatch"
                     class:selected={!eraser && selectedColor === color}
                     style="background-color: rgb({color.r},{color.g},{color.b});"
                     on:click={() => { selectedColor = color; eraser = false }}
                />
            {/each}
            <div class="draw-swatch draw-tool"
                 class:selected={eraser}
                 title="Eraser"
                 on:click={() => eraser = true}
            >
                <i class="icon material-icons">backspace</i>
            </div>
            <div class="draw-swatch draw-tool"
                 title="Clear"
                 on:click={onClear}
            >
                <i class="icon material-icons">delete</i>
            </div>
        </div>
    </div>
</Page>

<style>
    .draw-page {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .draw-canvas-area {
        flex: 1;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }

    .draw-canvas-wrapper {
        position: relative;
        touch-action: none;
        cursor: crosshair;
    }

    #draw-display {
        display: block;
        image-rendering: pixelated;
        background-color: black;
    }

    .draw-grid {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
    }

    .draw-palette {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
        padding: 12px;
    }

    .draw-swatch {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        border: 3px solid #444;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .draw-swatch.selected {
        border-color: white;
    }

    .draw-tool {
        background-color: #222;
        color: white;
    }
</style>
