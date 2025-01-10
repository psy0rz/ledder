<script>

    import {
        App, BlockTitle, List, ListItem, Panel, View,
    } from 'framework7-svelte'


    import Display from "./Display.svelte"

    import routes from '../js/web/routes.js';
    import Categories from '../pages/categories.svelte'
    import {runnerBrowser} from "@/js/web/RunnerBrowser.js";
    import {svelteDisplayList, svelteSelectedDisplayNr} from "@/js/web/svelteStore.js";

    // Framework7 Parameters
    let f7params = {
        name: 'Ledder', // App name
        theme: 'auto', // Automatic theme detection

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
        [64, 32]
    ]

</script>

<App { ...f7params }>
    <Display/>

    <Panel containerEl="#categories" opened side="left"  style="overflow: auto">

        <BlockTitle>Displays</BlockTitle>
        <List >
            {#each $svelteDisplayList as display, displayNr}
                <ListItem
                        checked={ $svelteSelectedDisplayNr===displayNr }
                        radio
                        title={display}
                        on:click={()=>{
                            runnerBrowser.startMonitoring(displayNr)
                            // f7.panel.close("left")
                        }}
                />

            {/each}
        </List>

        <BlockTitle>Preview format</BlockTitle>
        <List>
            {#each previewFormats as previewFormat}
                <ListItem
                        radio
                        title="{previewFormat[0]} x {previewFormat[1]}"
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
