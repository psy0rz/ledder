<script>
    import {
        Block, BlockTitle,
        Button,
        f7ready,
        Link, List, ListItem,
        Message,
        Navbar, NavLeft, NavTitle, NavTitleLarge,
        Page, Panel,
        Preloader,
        Subnavbar,
        Treeview, TreeviewItem
    } from "framework7-svelte"


    import {svelteAnimations, svelteSelectedTitle} from "../js/web/svelteStore.js"
    import {runnerBrowser} from "../js/web/RunnerBrowser.js"
    import {onMount} from "svelte"
    import AnimationListUI from "@/components/AnimationListUI.svelte"
    import {svelteDisplayList} from "@/js/web/svelteStore.js";

    let search = ""

    onMount(() => {
        f7ready(() => {
            runnerBrowser.refresh()
        })
    })


</script>

<Page name="categories">
    <Navbar>

        <NavLeft>

            <Button iconMd="material:menu"
                    panelOpen="left"/>


            <Button
                    iconMd="material:settings"
                    href="/settings"
                    title="Settings"
                    tonal

            />
            <Button
                    iconMd="material:tune"
                    href="/controls"
                    title="Controls"
                    tonal

            />
        </NavLeft>
        <NavTitle title="{$svelteSelectedTitle}" subtitle="Display 1 - 30 fps - %cpu "></NavTitle>
    </Navbar>
    <Panel containerEl="#categories" clos>
        <BlockTitle>Displays</BlockTitle>
        <List menuList>
            {#each $svelteDisplayList as display, displayNr}
                <ListItem
                        panelClose="left"
                        link
                        on:click={()=>{runnerBrowser.startMonitoring(displayNr)}}>
                    {display}
                </ListItem>
            {/each}
        </List>

    </Panel>

    <Block>
        Welcome to Ledder. Click on the second icon to view per animation control. More info at
        <Link href="https://github.com/psy0rz/ledder" external>Github</Link>
    </Block>


    {#if $svelteAnimations.length === 0}
        <Preloader/>
        <Message>Loading list...</Message>
    {:else}
        <Treeview>
            <AnimationListUI animationList={$svelteAnimations}></AnimationListUI>
        </Treeview>
    {/if}


</Page>
