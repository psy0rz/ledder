<Page name="categories">
    <Navbar title="Animations"
            subtitle={$svelteSelectedTitle}
    >
        <Subnavbar inner={false}>
            <Menu class="color-theme-white">
                <MenuItem iconMd="material:settings"
                          href="/settings"
                          title="Settings"/>
                <MenuItem iconMd="material:tune"
                          href="/controls"
                          title="Controls"/>
                <MenuItem 
                          iconMd="material:upload"
                          title="Activate animation"
                          onClick={ ()=> runnerBrowser.send()  } />
                <MenuItem iconMd='material:radio_button_checked'
                          class={$svelteLive?'bg-color-red':''}
                          title="Update live"
                          onClick={ ()=> {
                                $svelteLive=!$svelteLive
                                if ($svelteLive)
                                    runnerBrowser.send()
                          } } >
                </MenuItem>
            </Menu>
            <Searchbar bind:value={search}
                       searchContainer=".search-list"
                       searchIn=".item-title"

            />

        </Subnavbar>
    </Navbar>


    {#if $svelteAnimations.length === 0}
        <Preloader/>
        <Message>Loading list...</Message>
    {:else}
        <List mediaList ul={false}>
            {#each $svelteAnimations as animation}
                <ListGroup>
                    <ListItem title="{animation.title}" groupTitle>
                        <img src="{rpc.url}/{animation.previewFile}" slot="media" class="ledder-preview-image"/>
                    </ListItem>

                    <ListItem title="{animation.title}" text="{animation.description} ({animation.name})"
                              href="/{animation.name}">
                        <img src="{rpc.url}/{animation.previewFile}" slot="media" class="ledder-preview-image"/>
                    </ListItem>
                    {#each animation.presets as preset}
                        <ListItem title="{preset.name}" subtitle="{preset.title}" text="{preset.description}"
                                  href="/{animation.name}/{preset.name}">
                            <img src="{rpc.url}/{preset.previewFile}" slot="media" class="ledder-preview-image"/>
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
        Subnavbar, Toggle, View
    } from 'framework7-svelte';
    import {svelteSelectedTitle, svelteLive} from "../js/web/svelteStore.js"
    import {svelteAnimations} from "../js/web/svelteStore.js";
    import {runnerBrowser} from "../js/web/RunnerBrowser.js";
    import {onMount} from "svelte";
    import {rpc} from "../js/web/RpcClient.js";

    let search = ""

    onMount(() => {
        f7ready(() => {
            runnerBrowser.refreshAnimationList()

        })
    })
</script>

