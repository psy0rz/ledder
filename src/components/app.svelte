<script>

    import {
        App, BlockTitle, f7, List, ListItem, Panel, View,
    } from 'framework7-svelte'


    import Display from "./Display.svelte"

    import routes from '../js/web/routes.js';
    import Categories from '../pages/categories.svelte'
    import {runnerBrowser} from "@/js/web/RunnerBrowser.js";
    import {svelteDisplayWidth, svelteDisplayHeight, svelteDisplayList, svelteSelectedDisplayNr} from "@/js/web/svelteStore.js";
    import {formatTimeAgo} from "@/js/web/util.js";
    import {onDestroy} from "svelte";

    // Framework7 Parameters
    let f7params = {
        name: 'Ledder', // App name
        theme: 'md', // force material theme, so mobile looks the same as desktop (ios theme centers navbar titles)

        // App routes
        routes: routes,
    };

    const previewFormats = [
        [8, 8],
        [16, 16],
        [32, 8],
        [32, 16],
        [64, 8],
        [64, 16],
        [64, 32],
        [64, 64]
    ]

    //ticks every second so the "last seen" texts count up without the server having to resend them
    let nowMs = Date.now()
    const lastSeenTicker = setInterval(() => {
        nowMs = Date.now()
    }, 1000)
    onDestroy(() => clearInterval(lastSeenTicker))

    function displayStatusText(display, nowMs) {
        if (display.online)
            return "online"

        if (display.lastSeenBrowserTimestampMs === undefined)
            return "offline, never seen"

        return "offline, last seen " + formatTimeAgo(nowMs - display.lastSeenBrowserTimestampMs)
    }

</script>

<App { ...f7params }>
    <Display/>

    <Panel containerEl="#categories"  side="left"  style="overflow: auto">

        <BlockTitle>Displays</BlockTitle>
        <List >
            {#each $svelteDisplayList as display, displayNr}
                <ListItem
                        checked={ $svelteSelectedDisplayNr===displayNr }
                        radio
                        title={display.description}
                        footer={displayStatusText(display, nowMs)}
                        on:click={()=>{
                            runnerBrowser.startMonitoring(displayNr)
                            f7.panel.close("left")
                        }}
                >
                    <i slot="media" class="icon material-icons display-status-{display.online?'online':'offline'}">{display.online ? 'wifi' : 'wifi_off'}</i>

                </ListItem>
            {/each}
        </List>

        <BlockTitle>Preview format</BlockTitle>
        <List>
            {#each previewFormats as previewFormat}
                <ListItem
                        radio
                        title="{previewFormat[0]} x {previewFormat[1]}"
                        checked={previewFormat[0]===$svelteDisplayWidth && previewFormat[1]===$svelteDisplayHeight}

                        on:click={()=>{
                            runnerBrowser.changePreviewSize(previewFormat[0], previewFormat[1])
                            // f7.panel.close("left")
                        }}
                />
            {/each}

        </List>
    </Panel>

    <View name="categories" restoreScrollTopOnBack={true}>
        <Categories/>
    </View>


</App>

<style>
    .display-status-online {
        color: #4caf50;
    }

    .display-status-offline {
        color: #f44336;
    }
</style>
