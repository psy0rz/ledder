<script>
    import {
        f7ready,
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
        Treeview
    } from "framework7-svelte"


    import {svelteAnimations, svelteLive, svelteSelectedTitle} from "../js/web/svelteStore.js"
    import {runnerBrowser} from "../js/web/RunnerBrowser.js"
    import {onMount} from "svelte"
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
<!--                <MenuItem link-->
<!--                          iconMd="material:radio_button_checked"-->
<!--                          class={$svelteLive ? "color-yellow" : ""}-->
<!--                          title="Update live"-->
<!--                          onClick={() => {-->
<!--                        $svelteLive = !$svelteLive;-->
<!--                        if ($svelteLive) runnerBrowser.send();-->
<!--                    }}-->
<!--                />-->
                <MenuItem dropdown
                          tite="Preview size"
                          iconMd="material:view_comfy"
                >
                    <MenuDropdown>
                        <MenuDropdownItem link text="32x8"  on:click={ ()=>runnerBrowser.setSize(32, 8, 8)}/>
                        <MenuDropdownItem link text="32x16"  on:click={ ()=>runnerBrowser.setSize(32, 16, 8)}/>
                        <MenuDropdownItem link text="32x32"  on:click={ ()=>runnerBrowser.setSize(32, 32, 8)}/>
                        <MenuDropdownItem link text="64x8"  on:click={ ()=>runnerBrowser.setSize(64, 8, 8)}/>
                        <MenuDropdownItem link text="64x16"  on:click={ ()=>runnerBrowser.setSize(64, 16, 8)}/>
                        <MenuDropdownItem link text="64x32"  on:click={ ()=>runnerBrowser.setSize(64, 32, 8)}/>
                        <MenuDropdownItem link text="64x40"  on:click={ ()=>runnerBrowser.setSize(64, 40, 8)}/>
                        <MenuDropdownItem link text="75x8" on:click={ ()=>runnerBrowser.setSize(75, 8, 8)}/>
                        <MenuDropdownItem link text="72x18" on:click={ ()=>runnerBrowser.setSize(72, 18, 8)}/>
                        <MenuDropdownItem link text="75x16" on:click={ ()=>runnerBrowser.setSize(75, 16, 8)}/>
                       
                        <MenuDropdownItem link text="80x32" on:click={ ()=>runnerBrowser.setSize(80, 32, 8)}/>
                        <MenuDropdownItem link text="128x16" on:click={ ()=>runnerBrowser.setSize(128, 16, 8)}/>
                        <MenuDropdownItem link text="160x16" on:click={ ()=>runnerBrowser.setSize(160, 16, 8)}/>
                        <MenuDropdownItem divider/>
                        <MenuDropdownItem link text="Disable preview" on:click={ ()=>runnerBrowser.stopPreview()}/>
                    </MenuDropdown>
                </MenuItem>
            </Menu>
<!--            <Searchbar-->
<!--                    bind:value={search}-->
<!--                    searchContainer=".search-list"-->
<!--                    searchIn=".item-title"-->
<!--            />-->
        </Subnavbar>
    </Navbar>


    {#if $svelteAnimations.length === 0}
        <Preloader/>
        <Message>Loading list...</Message>
    {:else}
        <Treeview>
            <AnimationListUI animationList={$svelteAnimations}></AnimationListUI>
        </Treeview>
    {/if}
</Page>
