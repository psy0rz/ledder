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
        Preloader,
        Searchbar,
        Subnavbar,
    } from "framework7-svelte"


    import {svelteAnimations, svelteLive, svelteSelectedTitle} from "../js/web/svelteStore.js"
    import {runnerBrowser} from "../js/web/RunnerBrowser.js"
    import {onMount} from "svelte"
    import {rpc} from "../js/web/RpcClient.js"
    import AnimationListUI from "@/components/AnimationListUI.svelte"

    let search = ""

    onMount(() => {
        f7ready(() => {
            runnerBrowser.refreshAnimationList()
        })
    })


</script>

<Page name="categories">
    <Navbar title="Animations" subtitle={$svelteSelectedTitle}>
        <Subnavbar inner={false}>
            <Menu>
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
                        <MenuDropdownItem link text="75x8" on:click={ ()=>runnerBrowser.setSize(75, 8, 8)}/>
                        <MenuDropdownItem link text="72x18" on:click={ ()=>runnerBrowser.setSize(72, 18, 8)}/>
                        <MenuDropdownItem link text="75x16" on:click={ ()=>runnerBrowser.setSize(75, 16, 8)}/>
                        <MenuDropdownItem divider/>
                        <MenuDropdownItem link text="Disable preview" on:click={ ()=>runnerBrowser.stopPreview()}/>
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
        <Preloader/>
        <Message>Loading list...</Message>
    {:else}
        <AnimationListUI animationList={$svelteAnimations}></AnimationListUI>
    {/if}
</Page>
