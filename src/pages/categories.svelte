<script>
    import {
        Block,
        Button,
        f7ready,
        Link,
        Message,
        Navbar,
        Page,
        Preloader,
        Subnavbar,
        Treeview
    } from "framework7-svelte"


    import {svelteAnimations, svelteSelectedTitle} from "../js/web/svelteStore.js"
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
    <Navbar title="Ledder" subtitle={$svelteSelectedTitle}>
        <Subnavbar inner={false} class="justify-content-left">
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

            <!--            <Searchbar-->
            <!--                    bind:value={search}-->
            <!--                    searchContainer=".search-list"-->
            <!--                    searchIn=".item-title"-->
            <!--            />-->
        </Subnavbar>
    </Navbar>
    <Block>
        Welcome to Ledder. Click on the second icon to view per animation control. More info at <Link href="https://github.com/psy0rz/ledder" external>Github</Link>

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
