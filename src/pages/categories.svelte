<script>
    import {

        f7ready,
        List,
        ListGroup,
        ListItem,
        Menu,
        MenuDropdown,
        MenuDropdownItem,
        MenuItem,
        Message,
        Navbar,
        Page,
        Preloader, Searchbar,
        Subnavbar,


    } from "framework7-svelte"


    import { svelteSelectedTitle, svelteLive } from "../js/web/svelteStore.js";
    import { svelteAnimations } from "../js/web/svelteStore.js";
    import { runnerBrowser } from "../js/web/RunnerBrowser.js";
    import { onMount } from "svelte";
    import { rpc } from "../js/web/RpcClient.js";
    let search = "";

    onMount(() => {
        f7ready(() => {
            runnerBrowser.refreshAnimationList();
        });
    });


</script>

<Page name="categories">
    <Navbar title="Animations" subtitle={$svelteSelectedTitle}>
        <Subnavbar inner={false}>
            <Menu >
                <MenuItem
                    iconMd="material:settings"
                    href="/settings"
                    title="Settings"
                />
                <MenuItem
                    iconMd="material:tune"
                    href="/controls"
                    title="Controls"
                />
                <MenuItem link
                    iconMd="material:upload"
                    title="Activate animation"
                    onClick={() => runnerBrowser.send()}
                />
                <MenuItem link
                    iconMd="material:radio_button_checked"
                    class={$svelteLive ? "color-yellow" : ""}
                    title="Update live"
                    onClick={() => {
                        $svelteLive = !$svelteLive;
                        if ($svelteLive) runnerBrowser.send();
                    }}
                />
                <MenuItem dropdown link
                tite="Preview size"
                  iconMd="material:view_comfy"
                >
                    <MenuDropdown>
                    <MenuDropdownItem link text="75x8" />
                    <MenuDropdownItem link text="72x18" />
                    <MenuDropdownItem link text="75x16" />
                    <MenuDropdownItem divider />
                    <MenuDropdownItem link text="Disable preview" />
                    </MenuDropdown>
                </MenuItem>
            </Menu>
            <Searchbar
                bind:value={search}
                searchContainer=".search-list"
                searchIn=".item-title"
            />
        </Subnavbar>
    </Navbar>

    {#if $svelteAnimations.length === 0}
        <Preloader />
        <Message>Loading list...</Message>
    {:else}
        <List mediaList ul={false}>
            {#each $svelteAnimations as animation}
                <ListGroup>
                    <ListItem title={animation.title} groupTitle>
                        <img
                            src="{rpc.url}/{animation.previewFile}"
                            slot="media"
                            class="ledder-preview-image"
                        />
                    </ListItem>

                    <ListItem
                        title={animation.title}
                        text="{animation.description} ({animation.name})"
                        href="/{animation.name}"
                    >
                        <img
                            src="{rpc.url}/{animation.previewFile}"
                            slot="media"
                            class="ledder-preview-image"
                        />
                    </ListItem>
                    {#each animation.presets as preset}
                        <ListItem
                            title={preset.name}
                            subtitle={preset.title}
                            text={preset.description}
                            href="/{animation.name}/{preset.name}"
                        >
                            <img
                                src="{rpc.url}/{preset.previewFile}"
                                slot="media"
                                class="ledder-preview-image"
                            />
                        </ListItem>
                    {/each}
                </ListGroup>
            {/each}
        </List>
    {/if}
</Page>
