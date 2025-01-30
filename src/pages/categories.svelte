<script>
    import {
        Block,
        Button,
        f7ready,
        Link,
        Message,
        Navbar,
        NavLeft,
        NavTitle,
        Page,
        Preloader,
        Treeview
    } from "framework7-svelte"


    import {svelteAnimations, svelteSelectedTitle, svelteStats} from "../js/web/svelteStore.js"
    import {runnerBrowser} from "../js/web/RunnerBrowser.js"
    import {onMount} from "svelte"
    import AnimationListUI from "@/components/AnimationListUI.svelte"


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
            <Button
                    iconMd="material:upload"
                    on:click={runnerBrowser.storeStrream}
                    title="Upload"
                    tonal

            />
        </NavLeft>
        <NavTitle title="{$svelteSelectedTitle}" subtitle="{$svelteStats}"></NavTitle>
    </Navbar>

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
