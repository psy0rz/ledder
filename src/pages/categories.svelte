<Page name="categories">
    <Navbar title="Animations"
            subtitle={$svelteSelectedTitle}
    >
        <Subnavbar inner={false}>
            <Searchbar bind:value={search}
                       searchContainer=".search-list"
                       searchIn=".item-title"

            />
        </Subnavbar>
    </Navbar>

    {#if $svelteAnimations.length==0}
        <Preloader/>
        <Message>Loading list</Message>
    {:else}
        <List mediaList ul={false}>
            {#each $svelteAnimations as animation}
                <ListGroup >
                    <ListItem title="{animation.title}"  groupTitle >
                        <img src="{animation.previewFile}" slot="media" class="ledder-preview-image" />
                    </ListItem>

                    <ListItem title="{animation.title}" text="{animation.description} ({animation.name})" >
                        <img src="{animation.previewFile}" slot="media" class="ledder-preview-image"/>
                    </ListItem>
                    {#each animation.presets as preset}
                        <ListItem title="{preset.name}" subtitle="{preset.title}" text="{preset.description}" on:click={e=>run(animation, preset)}>
                            <img src="{preset.previewFile}" slot="media" class="ledder-preview-image"/>
                        </ListItem>
                    {/each}
                </ListGroup>
            {/each}
        </List>
    {/if}
</Page>

<script>
    import {
        Block,
        BlockHeader,
        Button,
        Icon,
        List,
        ListGroup,
        ListItem,
        Message,
        Navbar,
        Page,
        Preloader,
        Searchbar,
        Subnavbar
    } from 'framework7-svelte';
    import {rpc} from "../js/RpcClient.js";
    // import * as animationClasses from "../js/led/animations/all.js";
    import {sveltePresets, svelteSelected, svelteSelectedTitle} from "../js/svelteStore.js"
    import {svelteAnimations} from "../js/svelteStore.js";
    import {runnerBrowser} from "../js/RunnerBrowser.js";


    // let categoryPromise = rpc.request("presetStore.getCategories")
    let animationsPromise


    async function run(animation, preset)
    {
        // console.log("run", animation, preset)
        svelteSelected.set({ animationName: animation.name, presetName: preset.name});


        // let preset=await rpc.request("presetStore.load", animationClass.presetDir, preset.name)
        // console.log(preset)
    }

    runnerBrowser.refreshAnimationList()

    let search = ""
</script>

