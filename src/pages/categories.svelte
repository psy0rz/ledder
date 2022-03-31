<Page name="categories">
    <Navbar title="Animations"
            subtitle={$svelteSelectedTitle}
    >
        <Subnavbar inner={false}>
            <Searchbar bind:value={search}
                       searchContainer=".search-list"
                       searchIn=".item-title"

            />
            <Menu class="color-theme-red">
                <MenuItem iconMd="material:settings" href="/settings"/>
                <MenuItem iconMd="material:upload"/>
            </Menu>

        </Subnavbar>
    </Navbar>


    {#if $svelteAnimations.length === 0}
        <Preloader/>
        <Message>Loading list</Message>
    {:else}
        <List mediaList ul={false}>
            {#each $svelteAnimations as animation}
                <ListGroup>
                    <ListItem title="{animation.title}" groupTitle>
                        <img src="{animation.previewFile}" slot="media" class="ledder-preview-image"/>
                    </ListItem>

                    <ListItem title="{animation.title}" text="{animation.description} ({animation.name})"
                              href="/{animation.name}">
                        <img src="{animation.previewFile}" slot="media" class="ledder-preview-image"/>
                    </ListItem>
                    {#each animation.presets as preset}
                        <ListItem title="{preset.name}" subtitle="{preset.title}" text="{preset.description}"
                                  href="/{animation.name}/{preset.name}">
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
        Button, f7ready,
        Icon,
        List,
        ListGroup,
        ListItem, Menu, MenuItem,
        Message,
        Navbar,
        Page,
        Preloader,
        Searchbar,
        Subnavbar, View
    } from 'framework7-svelte';
    import {sveltePresets, svelteSelectedTitle} from "../js/svelteStore.js"
    import {svelteAnimations} from "../js/svelteStore.js";
    import {runnerBrowser} from "../js/RunnerBrowser.js";
    import {onMount} from "svelte";

    let search = ""

    onMount(() => {
        f7ready(() => {
            runnerBrowser.refreshAnimationList()
        })
    })
</script>

